/**
 * Progress tracking for bulk document generation
 */
export type BulkGenerationProgress = {
  workPackageId: string
  status: 'pending' | 'generating_themes' | 'generating_content' | 'completed' | 'error'
  error?: string
}

/**
 * Result of bulk generation operation
 */
export type BulkGenerationResult = {
  succeeded: string[] // work package IDs that generated successfully
  failed: { id: string; error: string }[] // failed generations with error details
  skipped: string[] // already completed work packages
}

/**
 * Retry configuration for API calls
 */
const RETRY_CONFIG = {
  maxRetries: 2,
  baseDelay: 1000, // 1 second
}

/**
 * Timeout configuration (30 seconds per API call)
 */
const TIMEOUT_MS = 30000

/**
 * Sleep utility for retry delays
 */
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

/**
 * Fetch with timeout wrapper
 */
async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeout: number = TIMEOUT_MS
): Promise<Response> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    })
    clearTimeout(timeoutId)
    return response
  } catch (error) {
    clearTimeout(timeoutId)
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Request timeout')
    }
    throw error
  }
}

/**
 * Make API call with retry logic (handles non-rate-limit errors)
 * Rate limit errors (429) should be handled at higher level
 */
async function apiCallWithRetry(
  url: string,
  method: 'GET' | 'POST' = 'POST',
  retries: number = RETRY_CONFIG.maxRetries
): Promise<Response> {
  let lastError: Error | null = null

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetchWithTimeout(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        return response
      }

      // If response is 429 (rate limit), don't retry here - let caller handle it
      if (response.status === 429) {
        const errorData = await response.json()
        const error = new Error(
          `Rate limit exceeded${errorData.retryDelaySeconds ? ` - retry in ${errorData.retryDelaySeconds}s` : ''}`
        )
        throw error
      }

      // If response is not OK, throw error with status
      const errorText = await response.text()
      throw new Error(`API error (${response.status}): ${errorText}`)
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error')

      // Don't retry on rate limit errors - let caller handle
      if (lastError.message.includes('Rate limit exceeded')) {
        throw lastError
      }

      // Log retry attempt for other errors
      if (attempt < retries) {
        const delay = RETRY_CONFIG.baseDelay * Math.pow(2, attempt) // exponential backoff
        console.log(`[Bulk Generation] Retry attempt ${attempt + 1}/${retries} after ${delay}ms for ${url}`)
        await sleep(delay)
      }
    }
  }

  // All retries exhausted
  throw lastError || new Error('All retries failed')
}

/**
 * Generate win themes and content for a single work package with rate limit handling
 *
 * @param workPackageId - ID of work package to generate
 * @returns Promise that resolves when generation completes
 * @throws Error if generation fails after retries
 */
export async function generateSingleDocument(workPackageId: string): Promise<void> {
  const MAX_RATE_LIMIT_RETRIES = 3
  let rateLimitRetries = 0

  while (rateLimitRetries <= MAX_RATE_LIMIT_RETRIES) {
    try {
      // Step 1: Generate win themes
      console.log(`[Bulk Generation] Generating win themes for ${workPackageId}`)
      const themesResponse = await apiCallWithRetry(
        `/api/work-packages/${workPackageId}/win-themes`,
        'POST'
      )

      const themesData = await themesResponse.json()
      if (!themesData.success) {
        throw new Error('Win themes generation failed')
      }

      console.log(`[Bulk Generation] Win themes generated for ${workPackageId}`)

      // Step 2: Generate content
      console.log(`[Bulk Generation] Generating content for ${workPackageId}`)
      const contentResponse = await apiCallWithRetry(
        `/api/work-packages/${workPackageId}/generate-content`,
        'POST'
      )

      const contentData = await contentResponse.json()
      if (!contentData.success) {
        throw new Error('Content generation failed')
      }

      console.log(`[Bulk Generation] Content generated successfully for ${workPackageId}`)

      // Success - break out of retry loop
      return
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'

      // Check if this is a rate limit error
      const isRateLimit = errorMessage.includes('429') ||
                          errorMessage.includes('rate limit') ||
                          errorMessage.includes('quota')

      if (isRateLimit && rateLimitRetries < MAX_RATE_LIMIT_RETRIES) {
        rateLimitRetries++

        // Extract retry delay from error message if available
        const delayMatch = errorMessage.match(/retry in (\d+)s/)
        const delaySeconds = delayMatch ? parseInt(delayMatch[1]) : 60

        console.log(
          `[Bulk Generation] Rate limit hit for ${workPackageId} (attempt ${rateLimitRetries}/${MAX_RATE_LIMIT_RETRIES})`
        )
        console.log(`[Bulk Generation] Waiting ${delaySeconds}s before retry...`)

        await sleep(delaySeconds * 1000)

        console.log(`[Bulk Generation] Retrying after rate limit delay...`)
        // Continue to next iteration of while loop
        continue
      }

      // Not a rate limit error or max retries exceeded
      console.error(`[Bulk Generation] Failed to generate document ${workPackageId}:`, errorMessage)
      throw new Error(`Failed to generate document: ${errorMessage}`)
    }
  }

  // Should never reach here, but just in case
  throw new Error(`Failed to generate document after ${MAX_RATE_LIMIT_RETRIES} rate limit retries`)
}

/**
 * Work package interface (minimal fields needed for bulk generation)
 */
export interface BulkGenerationWorkPackage {
  id: string
  status: 'pending' | 'in_progress' | 'review' | 'completed'
}

/**
 * Generate multiple work packages sequentially (one at a time)
 *
 * @param workPackages - Array of work packages to generate
 * @param onProgress - Callback invoked with progress updates
 * @returns Result containing succeeded, failed, and skipped work packages
 */
export async function bulkGenerateDocuments(
  workPackages: BulkGenerationWorkPackage[],
  onProgress?: (progress: BulkGenerationProgress[]) => void
): Promise<BulkGenerationResult> {
  // Filter out already completed work packages
  const pendingWorkPackages = workPackages.filter(wp => wp.status !== 'completed')
  const skippedWorkPackages = workPackages.filter(wp => wp.status === 'completed')

  console.log(`[Bulk Generation] Starting sequential generation for ${pendingWorkPackages.length} documents`)
  console.log(`[Bulk Generation] Skipping ${skippedWorkPackages.length} completed documents`)

  // Initialize progress tracking
  const progressMap = new Map<string, BulkGenerationProgress>(
    pendingWorkPackages.map(wp => [
      wp.id,
      { workPackageId: wp.id, status: 'pending' }
    ])
  )

  // Helper to update progress
  const updateProgress = (workPackageId: string, update: Partial<BulkGenerationProgress>) => {
    const current = progressMap.get(workPackageId)
    if (current) {
      const updated = { ...current, ...update }
      progressMap.set(workPackageId, updated)

      // Invoke callback with all progress
      if (onProgress) {
        onProgress(Array.from(progressMap.values()))
      }
    }
  }

  // Initial progress callback
  if (onProgress) {
    onProgress(Array.from(progressMap.values()))
  }

  // Track results
  const succeeded: string[] = []
  const failed: { id: string; error: string }[] = []

  // Process work packages SEQUENTIALLY (one at a time)
  for (let i = 0; i < pendingWorkPackages.length; i++) {
    const wp = pendingWorkPackages[i]
    console.log(`[Bulk Generation] Processing ${i + 1}/${pendingWorkPackages.length}: ${wp.id}`)

    try {
      // Update status: generating themes
      updateProgress(wp.id, { status: 'generating_themes' })

      // Generate the document (themes + content)
      await generateSingleDocument(wp.id)

      // Update status: completed
      updateProgress(wp.id, { status: 'completed' })

      succeeded.push(wp.id)

      // Add small delay between requests to avoid bursting rate limit
      if (i < pendingWorkPackages.length - 1) {
        console.log(`[Bulk Generation] Waiting 1s before next document...`)
        await sleep(1000)
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'

      console.error(`[Bulk Generation] Failed to generate ${wp.id}:`, errorMessage)

      // Update status: error
      updateProgress(wp.id, {
        status: 'error',
        error: errorMessage
      })

      failed.push({ id: wp.id, error: errorMessage })
    }
  }

  const finalResult: BulkGenerationResult = {
    succeeded,
    failed,
    skipped: skippedWorkPackages.map(wp => wp.id),
  }

  console.log(`[Bulk Generation] Completed: ${succeeded.length} succeeded, ${failed.length} failed, ${finalResult.skipped.length} skipped`)

  return finalResult
}

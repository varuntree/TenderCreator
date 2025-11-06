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
 * Make API call with retry logic
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

      // If response is not OK, throw error with status
      const errorText = await response.text()
      throw new Error(`API error (${response.status}): ${errorText}`)
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error')

      // Log retry attempt
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
 * Generate win themes and content for a single work package
 *
 * @param workPackageId - ID of work package to generate
 * @returns Promise that resolves when generation completes
 * @throws Error if generation fails after retries
 */
export async function generateSingleDocument(workPackageId: string): Promise<void> {
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
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error(`[Bulk Generation] Failed to generate document ${workPackageId}:`, errorMessage)
    throw new Error(`Failed to generate document: ${errorMessage}`)
  }
}

/**
 * Work package interface (minimal fields needed for bulk generation)
 */
export interface BulkGenerationWorkPackage {
  id: string
  status: 'pending' | 'in_progress' | 'completed'
}

/**
 * Generate multiple work packages in parallel
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

  console.log(`[Bulk Generation] Starting bulk generation for ${pendingWorkPackages.length} documents`)
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

  // Generate all documents in parallel using Promise.allSettled
  const results = await Promise.allSettled(
    pendingWorkPackages.map(async (wp) => {
      try {
        // Update status: generating themes
        updateProgress(wp.id, { status: 'generating_themes' })

        // Generate the document (themes + content)
        await generateSingleDocument(wp.id)

        // Update status: completed
        updateProgress(wp.id, { status: 'completed' })

        return { success: true, workPackageId: wp.id }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'

        // Update status: error
        updateProgress(wp.id, {
          status: 'error',
          error: errorMessage
        })

        return { success: false, workPackageId: wp.id, error: errorMessage }
      }
    })
  )

  // Process results
  const succeeded: string[] = []
  const failed: { id: string; error: string }[] = []

  results.forEach((result, index) => {
    const workPackageId = pendingWorkPackages[index].id

    if (result.status === 'fulfilled' && result.value.success) {
      succeeded.push(workPackageId)
    } else {
      const errorMessage = result.status === 'rejected'
        ? result.reason?.message || 'Unknown error'
        : (result.value as any).error || 'Generation failed'

      failed.push({ id: workPackageId, error: errorMessage })
    }
  })

  const finalResult: BulkGenerationResult = {
    succeeded,
    failed,
    skipped: skippedWorkPackages.map(wp => wp.id),
  }

  console.log(`[Bulk Generation] Completed: ${succeeded.length} succeeded, ${failed.length} failed, ${finalResult.skipped.length} skipped`)

  return finalResult
}

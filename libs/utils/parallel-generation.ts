import { createSmartBatches } from '@/libs/utils/bulk-generation-v2'

const MAX_RATE_LIMIT_RETRIES = 3
const DEFAULT_CONCURRENCY = 2

export type ParallelGenerationState = 'queued' | 'running' | 'success' | 'error'

export type ParallelGenerationProgress = {
  workPackageId: string
  state: ParallelGenerationState
  message?: string
}

export type ParallelGenerationResult = {
  succeeded: string[]
  failed: Array<{ workPackageId: string; error: string }>
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

async function callBatchEndpoint(
  projectId: string,
  workPackageIds: string[],
  instructions?: string,
  attempt = 0
): Promise<Response> {
  const response = await fetch(`/api/projects/${projectId}/generate-batch`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ workPackageIds, instructions }),
  })

  if (response.status === 429 && attempt < MAX_RATE_LIMIT_RETRIES) {
    const data = await response.json().catch(() => ({}))
    const retryDelaySeconds = data.retryDelaySeconds ?? 60
    await delay(retryDelaySeconds * 1000)
    return callBatchEndpoint(projectId, workPackageIds, instructions, attempt + 1)
  }

  return response
}

/**
 * Generate work packages in parallel batches with configurable concurrency.
 * Emits per-document progress events so the UI can reflect live state.
 */
export async function parallelGenerateDocuments(options: {
  projectId: string
  workPackageIds: string[]
  instructions?: string
  maxBatchSize?: number
  concurrency?: number
  onProgress?: (progress: ParallelGenerationProgress) => void
}): Promise<ParallelGenerationResult> {
  const {
    projectId,
    workPackageIds,
    instructions,
    maxBatchSize = 3,
    concurrency = DEFAULT_CONCURRENCY,
    onProgress,
  } = options

  if (workPackageIds.length === 0) {
    return { succeeded: [], failed: [] }
  }

  const batches = createSmartBatches(workPackageIds, { maxBatchSize })
  const succeeded: string[] = []
  const failed: Array<{ workPackageId: string; error: string }> = []

  // Initialize progress as queued
  workPackageIds.forEach((id) =>
    onProgress?.({
      workPackageId: id,
      state: 'queued',
    })
  )

  let cursor = 0
  const safeConcurrency = Math.min(concurrency, batches.length)

  const processBatch = async (batch: string[]) => {
    batch.forEach((id) =>
      onProgress?.({
        workPackageId: id,
        state: 'running',
      })
    )

    try {
      const response = await callBatchEndpoint(projectId, batch, instructions)

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        const errorMessage = data.error || 'Batch generation failed'

        batch.forEach((id) => {
          failed.push({ workPackageId: id, error: errorMessage })
          onProgress?.({
            workPackageId: id,
            state: 'error',
            message: errorMessage,
          })
        })
        return
      }

      const data = (await response.json()) as {
        results: Array<{ workPackageId: string; success: boolean; error?: string }>
      }

      data.results.forEach((result) => {
        if (result.success) {
          succeeded.push(result.workPackageId)
          onProgress?.({
            workPackageId: result.workPackageId,
            state: 'success',
          })
        } else {
          const errorMessage = result.error || 'Generation failed'
          failed.push({ workPackageId: result.workPackageId, error: errorMessage })
          onProgress?.({
            workPackageId: result.workPackageId,
            state: 'error',
            message: errorMessage,
          })
        }
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      batch.forEach((id) => {
        failed.push({ workPackageId: id, error: message })
        onProgress?.({
          workPackageId: id,
          state: 'error',
          message,
        })
      })
    }
  }

  const worker = async () => {
    while (cursor < batches.length) {
      const batchIndex = cursor
      cursor += 1
      const batch = batches[batchIndex]
      await processBatch(batch)
    }
  }

  await Promise.all(Array.from({ length: safeConcurrency }, () => worker()))
  return { succeeded, failed }
}

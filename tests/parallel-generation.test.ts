import assert from 'node:assert/strict'

import { parallelGenerateDocuments, type ParallelGenerationProgress } from '@/libs/utils/parallel-generation'

// Mock fetch with concurrency tracking
let inFlight = 0
let peakInFlight = 0

globalThis.fetch = (async (_url, options) => {
  inFlight += 1
  peakInFlight = Math.max(peakInFlight, inFlight)

  const body = JSON.parse(options?.body?.toString() || '{}')
  await new Promise((resolve) => setTimeout(resolve, 5))

  inFlight -= 1

  return {
    ok: true,
    status: 200,
    json: async () => ({
      results: body.workPackageIds.map((id: string) => ({
        workPackageId: id,
        success: id !== 'wp4',
        error: id === 'wp4' ? 'AI error' : undefined,
      })),
    }),
  } as Response
}) as typeof fetch

async function runTest() {
  const requestedIds = ['wp1', 'wp2', 'wp3', 'wp4', 'wp5']
  const events: ParallelGenerationProgress[] = []

  const result = await parallelGenerateDocuments({
    projectId: 'proj_123',
    workPackageIds: requestedIds,
    maxBatchSize: 2,
    concurrency: 2,
    onProgress: (event) => events.push(event),
  })

  assert.equal(result.succeeded.length, 4, 'Should succeed for all but wp4')
  assert.equal(result.failed.length, 1, 'Exactly one document should fail')
  assert.equal(result.failed[0]?.workPackageId, 'wp4', 'wp4 should be marked as failed')
  assert.ok(
    events.filter((event) => event.state === 'queued').length === requestedIds.length,
    'Every document should emit a queued event'
  )
  assert.ok(
    events.filter((event) => event.state === 'success').length === 4,
    'Four documents should emit success progress'
  )
  assert.ok(
    events.some((event) => event.workPackageId === 'wp4' && event.state === 'error'),
    'wp4 should emit an error event'
  )
  assert.ok(peakInFlight <= 2, 'Concurrency must not exceed configured limit')

  console.log('parallel-generation tests passed')
}

runTest().catch((error) => {
  console.error('parallel-generation tests failed', error)
  process.exit(1)
})

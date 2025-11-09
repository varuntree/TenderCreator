import assert from 'node:assert/strict'

import {
  MAX_PARALLEL_WORK_PACKAGES,
  parallelGenerateDocuments,
  type ParallelGenerationProgress,
} from '@/libs/utils/parallel-generation'

// Mock fetch with concurrency tracking
let inFlight = 0
let peakInFlight = 0

globalThis.fetch = (async (_url, options) => {
  inFlight += 1
  peakInFlight = Math.max(peakInFlight, inFlight)

  const body = JSON.parse(options?.body?.toString() || '{}')
  await new Promise((resolve) => setTimeout(resolve, 5))

  inFlight -= 1

  if (Array.isArray(body.workPackageIds) && body.workPackageIds.length > MAX_PARALLEL_WORK_PACKAGES) {
    return {
      ok: false,
      status: 400,
      json: async () => ({ error: 'Batch size too large. Select up to 2 documents per run.' }),
    } as Response
  }

  const shouldFail = (id: string) => id === 'wp_fail'
  const forceFallback = body.instructions === 'force-fallback'

  return {
    ok: true,
    status: 200,
    json: async () => ({
      executionMode: forceFallback ? 'fallback_sequential' : 'batch_prompt',
      results: body.workPackageIds.map((id: string) => ({
        workPackageId: id,
        success: !shouldFail(id),
        error: shouldFail(id) ? 'AI error' : undefined,
      })),
    }),
  } as Response
}) as typeof fetch

async function testSuccessfulRun() {
  inFlight = 0
  peakInFlight = 0
  const requestedIds = ['wp1', 'wp_fail']
  const events: ParallelGenerationProgress[] = []

  const result = await parallelGenerateDocuments({
    projectId: 'proj_success',
    workPackageIds: requestedIds,
    concurrency: 2,
    onProgress: (event) => events.push(event),
  })

  assert.equal(result.executionMode, 'batch_prompt')
  assert.equal(result.succeeded.length, 1)
  assert.equal(result.failed.length, 1)
  assert.equal(result.failed[0]?.workPackageId, 'wp_fail')
  assert.ok(
    events.filter((event) => event.state === 'queued').length === requestedIds.length,
    'Every document should emit a queued event'
  )
  assert.ok(
    events.some((event) => event.workPackageId === 'wp_fail' && event.state === 'error'),
    'Failed document should emit error state'
  )
  assert.ok(peakInFlight <= 2, 'Concurrency must stay at or below configured limit')
}

async function testFallbackMode() {
  inFlight = 0
  peakInFlight = 0
  const requestedIds = ['wp10', 'wp11']

  const result = await parallelGenerateDocuments({
    projectId: 'proj_fallback',
    workPackageIds: requestedIds,
    instructions: 'force-fallback',
  })

  assert.equal(result.executionMode, 'fallback_sequential')
  assert.equal(result.succeeded.length, requestedIds.length)
  assert.equal(result.failed.length, 0)
}

async function testServerErrorFlow() {
  inFlight = 0
  peakInFlight = 0
  const requestedIds = ['wp_cap_1', 'wp_cap_2', 'wp_cap_3']

  const result = await parallelGenerateDocuments({
    projectId: 'proj_cap',
    workPackageIds: requestedIds,
  })

  assert.equal(result.succeeded.length, 0)
  assert.equal(result.failed.length, requestedIds.length)
  assert.ok(
    result.failed.every((entry) => entry.error?.includes('Select up to')),
    'All failures should surface the client-side selection cap message'
  )
}

async function runTests() {
  await testSuccessfulRun()
  await testFallbackMode()
  await testServerErrorFlow()
  console.log('parallel-generation tests passed')
}

runTests().catch((error) => {
  console.error('parallel-generation tests failed', error)
  process.exit(1)
})

import { executeRequest, executeStreamingRequest, parseJsonResponse } from './gemini-service'
import { buildWinThemesPrompt } from './prompts/generate-win-themes'
import { buildContentPrompt } from './prompts/generate-content'
import { buildCombinedStrategyPrompt } from './prompts/combined-strategy'
import { buildBatchGenerationPrompt } from './prompts/batch-generation'
import {
  buildExpandPrompt,
  buildShortenPrompt,
  buildAddEvidencePrompt,
  buildRephrasePrompt,
  buildCompliancePrompt,
  buildCustomPrompt,
  buildSelectionEditPrompt,
  selectionEditSystemInstruction,
  stripSelectionTokens,
} from './prompts/editor-actions'
import { WorkPackage, Requirement } from '@/libs/repositories/work-packages'
import { ProjectContext } from './context-assembly'
import { BidAnalysis } from './bid-analysis'

/**
 * Generate win themes for a work package (legacy - kept for backwards compatibility)
 * Consider using generateStrategy() instead for combined bid+themes generation
 */
export async function generateWinThemes(
  workPackage: WorkPackage,
  organizationDocs: string,
  rftDocs: string
): Promise<string[]> {
  const prompt = buildWinThemesPrompt(workPackage, organizationDocs, rftDocs)
  console.log('[Win Themes] Generating for:', workPackage.document_type)

  const response = await executeRequest({
    prompt,
    requestType: 'win-themes',
    temperature: 0.7,
  })

  if (!response.success) {
    const error: any = new Error(response.error || 'Win themes generation failed')
    error.isRateLimitError = response.isRateLimitError
    error.retryDelaySeconds = response.retryDelaySeconds
    throw error
  }

  const parsed = parseJsonResponse<{ win_themes: string[] }>(response)
  if (!parsed || !parsed.win_themes || !Array.isArray(parsed.win_themes)) {
    throw new Error('Invalid response structure: missing win_themes array')
  }

  console.log('[Win Themes] Generated', parsed.win_themes.length, 'themes')
  return parsed.win_themes
}

/**
 * Generate document content
 */
export async function generateDocumentContent(
  workPackage: WorkPackage,
  context: ProjectContext,
  winThemes: string[],
  instructions?: string
): Promise<string> {
  const prompt = buildContentPrompt(workPackage, context, winThemes, instructions)
  console.log('[Content] Generating document:', workPackage.document_type)
  console.log('[Content] Context size estimate:', context.totalTokensEstimate, 'tokens')

  const response = await executeRequest({
    prompt,
    requestType: 'content-generation',
    temperature: 0.7,
  })

  if (!response.success) {
    const error: any = new Error(response.error || 'Content generation failed')
    error.isRateLimitError = response.isRateLimitError
    error.retryDelaySeconds = response.retryDelaySeconds
    throw error
  }

  const content = response.data as string
  console.log('[Content] Generated length:', content.length, 'characters')
  return content
}

/**
 * Generate document content with streaming support
 * Yields chunks as they're generated for real-time display
 */
export async function* generateDocumentContentStream(
  workPackage: WorkPackage,
  context: ProjectContext,
  winThemes: string[],
  instructions?: string
): AsyncGenerator<string, void, unknown> {
  const prompt = buildContentPrompt(workPackage, context, winThemes, instructions)
  console.log('[Content Stream] Generating document:', workPackage.document_type)
  console.log('[Content Stream] Context size estimate:', context.totalTokensEstimate, 'tokens')

  for await (const chunk of executeStreamingRequest({
    prompt,
    requestType: 'content-generation-stream',
    temperature: 0.7,
  })) {
    yield chunk
  }
}

/**
 * Execute editor action
 */
export async function executeEditorAction(
  action: 'expand' | 'shorten' | 'add_evidence' | 'rephrase' | 'check_compliance' | 'custom',
  selectedText: string,
  fullDocument: string,
  context: {
    orgDocs?: string
    requirements?: Requirement[]
    customInstruction?: string
  }
): Promise<string> {
  let prompt: string

  switch (action) {
    case 'expand':
      prompt = buildExpandPrompt(selectedText, fullDocument, context.orgDocs || '')
      break
    case 'shorten':
      prompt = buildShortenPrompt(selectedText)
      break
    case 'add_evidence':
      prompt = buildAddEvidencePrompt(selectedText, context.orgDocs || '')
      break
    case 'rephrase':
      prompt = buildRephrasePrompt(selectedText)
      break
    case 'check_compliance':
      prompt = buildCompliancePrompt(selectedText, context.requirements || [])
      break
    case 'custom':
      prompt = buildCustomPrompt(selectedText, context.customInstruction || '', fullDocument)
      break
    default:
      throw new Error(`Unknown action: ${action}`)
  }

  console.log('[Editor Action]', action, 'for', selectedText.length, 'chars')

  const response = await executeRequest({
    prompt,
    requestType: `editor-action-${action}`,
    temperature: 0.7,
  })

  if (!response.success) {
    throw new Error(response.error || 'Editor action failed')
  }

  return response.data as string
}

interface SelectionEditArgs {
  instruction: string
  selectedText: string
  fullDocument: string
  documentType: string
  projectName: string
}

export async function runSelectionEdit({
  instruction,
  selectedText,
  fullDocument,
  documentType,
  projectName,
}: SelectionEditArgs): Promise<string> {
  const prompt = buildSelectionEditPrompt({
    instruction,
    selectedText,
    fullDocument,
    documentType,
    projectName,
  })

  const response = await executeRequest({
    prompt,
    systemInstruction: selectionEditSystemInstruction,
    requestType: 'selection-edit',
    temperature: 0.3,
  })

  if (!response.success) {
    const error: any = new Error(response.error || 'Selection edit failed')
    error.isRateLimitError = response.isRateLimitError
    error.retryDelaySeconds = response.retryDelaySeconds
    throw error
  }

  const responseText = stripSelectionTokens(response.data as string)
  if (!responseText) {
    throw new Error('AI returned an empty response.')
  }

  return responseText
}

/**
 * Generate combined strategy (bid analysis + win themes) in one request
 * Reduces API calls from 2 → 1
 */
export async function generateStrategy(
  workPackage: WorkPackage,
  projectContext: {
    name: string
    clientName?: string
    organizationDocs: string
    rftDocs: string
  }
): Promise<{ bidAnalysis: BidAnalysis; winThemes: string[] }> {
  const prompt = buildCombinedStrategyPrompt(workPackage, projectContext)
  console.log('[Strategy] Generating combined bid analysis + win themes for:', workPackage.document_type)

  const response = await executeRequest({
    prompt,
    requestType: 'combined-strategy',
    temperature: 0.7,
  })

  if (!response.success) {
    const error: any = new Error(response.error || 'Strategy generation failed')
    error.isRateLimitError = response.isRateLimitError
    error.retryDelaySeconds = response.retryDelaySeconds
    throw error
  }

  const parsed = parseJsonResponse<{
    bidAnalysis: {
      criteria: Array<{ name: string; description: string; score: number }>
      recommendation: 'bid' | 'no-bid'
      reasoning: string
      strengths: string[]
      concerns: string[]
    }
    winThemes: string[]
  }>(response)

  if (!parsed || !parsed.bidAnalysis || !parsed.winThemes) {
    throw new Error('Invalid response structure: missing bidAnalysis or winThemes')
  }

  // Process bid analysis (same as bid-analysis.ts)
  const totalCriteria = parsed.bidAnalysis.criteria.length || 1
  const criteria = parsed.bidAnalysis.criteria.map((c, index) => {
    const parsedScore = typeof c.score === 'number' ? c.score : parseFloat(c.score as any) || 0
    const clampedScore = Math.max(0, Math.min(5, parsedScore))
    const weight = 1 / totalCriteria
    const weightedScore = (clampedScore / 5) * weight

    return {
      id: String(index + 1),
      name: c.name,
      description: c.description,
      score: clampedScore,
      weight,
      weightedScore,
    }
  })

  const totalScore = Math.round(
    criteria.reduce((sum, c) => sum + c.weightedScore, 0) * 100
  )

  const bidAnalysis: BidAnalysis = {
    criteria,
    totalScore,
    recommendation: parsed.bidAnalysis.recommendation,
    reasoning: parsed.bidAnalysis.reasoning || '',
    strengths: parsed.bidAnalysis.strengths || [],
    concerns: parsed.bidAnalysis.concerns || [],
  }

  console.log('[Strategy] Generated bid analysis:', bidAnalysis.recommendation, totalScore)
  console.log('[Strategy] Generated', parsed.winThemes.length, 'win themes')

  return {
    bidAnalysis,
    winThemes: parsed.winThemes,
  }
}

/**
 * Generate multiple work packages in one batch request
 * Used for bulk generation with client-orchestrated batching
 */
type BatchGenerationMode = 'batch_prompt' | 'fallback_sequential'

export type BatchGenerationItem = {
  workPackageId: string
  success: boolean
  bidAnalysis?: BidAnalysis
  winThemes?: string[]
  content?: string
  error?: string
}

type RawBatchCriterion = {
  name: string
  description: string
  score: number | string
}

type RawBatchResult = {
  workPackageId: string
  bidAnalysis: {
    criteria: RawBatchCriterion[]
    recommendation: 'bid' | 'no-bid'
    reasoning?: string
    strengths?: string[]
    concerns?: string[]
  }
  winThemes: string[]
  content: string
}

const BATCH_SCHEMA_ERROR = 'INVALID_BATCH_SCHEMA'

type BatchSchemaError = Error & { code?: typeof BATCH_SCHEMA_ERROR }

const markBatchSchemaError = (message: string): BatchSchemaError => {
  const error = new Error(message) as BatchSchemaError
  error.name = BATCH_SCHEMA_ERROR
  error.code = BATCH_SCHEMA_ERROR
  return error
}

function normalizeBatchResults(
  rawResults: RawBatchResult[] | null,
  workPackages: WorkPackage[]
): BatchGenerationItem[] {
  if (!rawResults || !Array.isArray(rawResults) || rawResults.length === 0) {
    throw markBatchSchemaError('Batch response missing or empty.')
  }

  const validIds = new Set(workPackages.map((wp) => wp.id))
  const seenIds = new Set<string>()

  const normalized = rawResults.map((result) => {
    if (!validIds.has(result.workPackageId)) {
      throw markBatchSchemaError(`Unexpected workPackageId ${result.workPackageId}`)
    }
    if (seenIds.has(result.workPackageId)) {
      throw markBatchSchemaError(`Duplicate entry for workPackageId ${result.workPackageId}`)
    }
    seenIds.add(result.workPackageId)

    if (!result.bidAnalysis || !Array.isArray(result.bidAnalysis.criteria) || result.bidAnalysis.criteria.length === 0) {
      throw markBatchSchemaError('Bid analysis criteria missing in batch response.')
    }

    if (!Array.isArray(result.winThemes)) {
      throw markBatchSchemaError('Win themes missing in batch response.')
    }

    if (typeof result.content !== 'string' || result.content.trim().length === 0) {
      throw markBatchSchemaError('Content missing in batch response.')
    }

    const totalCriteria = result.bidAnalysis.criteria.length
    const criteria = result.bidAnalysis.criteria.map((c, index) => {
      const parsedScore = typeof c.score === 'number' ? c.score : parseFloat(c.score) || 0
      const clampedScore = Math.max(0, Math.min(5, parsedScore))
      const weight = 1 / totalCriteria
      const weightedScore = (clampedScore / 5) * weight

      return {
        id: String(index + 1),
        name: c.name,
        description: c.description,
        score: clampedScore,
        weight,
        weightedScore,
      }
    })

    const totalScore = Math.round(
      criteria.reduce((sum, c) => sum + c.weightedScore, 0) * 100
    )

    const bidAnalysis: BidAnalysis = {
      criteria,
      totalScore,
      recommendation: result.bidAnalysis.recommendation,
      reasoning: result.bidAnalysis.reasoning || '',
      strengths: result.bidAnalysis.strengths || [],
      concerns: result.bidAnalysis.concerns || [],
    }

    return {
      workPackageId: result.workPackageId,
      success: true,
      bidAnalysis,
      winThemes: result.winThemes,
      content: result.content,
    }
  })

  if (seenIds.size !== validIds.size) {
    throw markBatchSchemaError('Batch response missing one or more requested work packages.')
  }

  return normalized
}

async function runBatchPrompt(
  workPackages: WorkPackage[],
  context: ProjectContext,
  instructions?: string
): Promise<BatchGenerationItem[]> {
  const prompt = buildBatchGenerationPrompt(workPackages, context, instructions)
  console.log('[Batch] Generating', workPackages.length, 'documents in batch')
  console.log('[Batch] Context size estimate:', context.totalTokensEstimate, 'tokens')

  const response = await executeRequest({
    prompt,
    requestType: 'batch-generation',
    temperature: 0.7,
    maxRetries: 6,
  })

  if (!response.success) {
    const error: any = new Error(response.error || 'Batch generation failed')
    error.isRateLimitError = response.isRateLimitError
    error.retryDelaySeconds = response.retryDelaySeconds
    throw error
  }

  const parsed = parseJsonResponse<RawBatchResult[]>(response)
  return normalizeBatchResults(parsed, workPackages)
}

async function runFallbackSequential(
  workPackages: WorkPackage[],
  context: ProjectContext,
  instructions?: string
): Promise<BatchGenerationItem[]> {
  console.warn('[Batch] Falling back to sequential generation for', workPackages.length, 'documents')
  const items: BatchGenerationItem[] = []
  for (const workPackage of workPackages) {
    try {
      const { bidAnalysis, winThemes } = await generateStrategy(workPackage, {
        name: context.project.name,
        clientName: context.project.client_name,
        organizationDocs: context.organizationDocs,
        rftDocs: context.rftDocs,
      })

      const content = await generateDocumentContent(workPackage, context, winThemes, instructions)
      items.push({
        workPackageId: workPackage.id,
        success: true,
        bidAnalysis,
        winThemes,
        content,
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Fallback generation failed'
      console.error('[Batch Fallback] Failed for', workPackage.id, message)
      items.push({
        workPackageId: workPackage.id,
        success: false,
        error: message,
      })
    }
  }
  return items
}

export async function generateBatch(
  workPackages: WorkPackage[],
  context: ProjectContext,
  instructions?: string
): Promise<{ executionMode: BatchGenerationMode; items: BatchGenerationItem[] }> {
  try {
    const items = await runBatchPrompt(workPackages, context, instructions)
    console.log('[Batch] Successfully generated', items.length, 'documents via batch prompt')
    return { executionMode: 'batch_prompt', items }
  } catch (error) {
    const batchError = error as BatchSchemaError & { isRateLimitError?: boolean }
    if (batchError.code === BATCH_SCHEMA_ERROR) {
      const fallbackItems = await runFallbackSequential(workPackages, context, instructions)
      return { executionMode: 'fallback_sequential', items: fallbackItems }
    }
    throw error
  }
}

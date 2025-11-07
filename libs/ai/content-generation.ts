import { model } from './client'
import { buildWinThemesPrompt } from './prompts/generate-win-themes'
import { buildContentPrompt } from './prompts/generate-content'
import {
  buildExpandPrompt,
  buildShortenPrompt,
  buildAddEvidencePrompt,
  buildRephrasePrompt,
  buildCompliancePrompt,
  buildCustomPrompt,
  buildSelectionEditPrompt,
  selectionEditSystemInstruction,
} from './prompts/editor-actions'
import { WorkPackage, Requirement } from '@/libs/repositories/work-packages'
import { ProjectContext } from './context-assembly'
import { parseGeminiError } from './error-parser'

/**
 * Generate win themes for a work package
 */
export async function generateWinThemes(
  workPackage: WorkPackage,
  organizationDocs: string,
  rftDocs: string
): Promise<string[]> {
  try {
    const prompt = buildWinThemesPrompt(workPackage, organizationDocs, rftDocs)
    console.log('[Win Themes] Generating for:', workPackage.document_type)

    const result = await model.generateContent(prompt)
    const text = result.response.text()

    // Parse JSON (strip markdown fences like in analysis.ts)
    let cleanText = text.trim()
    if (cleanText.startsWith('```json')) {
      cleanText = cleanText.replace(/^```json\n?/, '').replace(/\n?```$/, '')
    } else if (cleanText.startsWith('```')) {
      cleanText = cleanText.replace(/^```\n?/, '').replace(/\n?```$/, '')
    }

    const parsed = JSON.parse(cleanText)

    if (!parsed.win_themes || !Array.isArray(parsed.win_themes)) {
      throw new Error('Invalid response structure: missing win_themes array')
    }

    console.log('[Win Themes] Generated', parsed.win_themes.length, 'themes')
    return parsed.win_themes
  } catch (error) {
    console.error('[Win Themes] Generation failed:', error)

    // Parse error for rate limit info
    const parsedError = parseGeminiError(error)

    // Re-throw with parsed error info attached
    const enhancedError = error instanceof Error ? error : new Error('Win themes generation failed')
    ;(enhancedError as any).isRateLimitError = parsedError.isRateLimitError
    ;(enhancedError as any).retryDelaySeconds = parsedError.retryDelaySeconds

    throw enhancedError
  }
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
  try {
    const prompt = buildContentPrompt(workPackage, context, winThemes, instructions)
    console.log('[Content] Generating document:', workPackage.document_type)
    console.log('[Content] Context size estimate:', context.totalTokensEstimate, 'tokens')

    const result = await model.generateContent(prompt)
    const content = result.response.text()

    console.log('[Content] Generated length:', content.length, 'characters')
    return content
  } catch (error) {
    console.error('[Content] Generation failed:', error)

    // Parse error for rate limit info
    const parsedError = parseGeminiError(error)

    // Re-throw with parsed error info attached
    const enhancedError = error instanceof Error ? error : new Error('Generation failed')
    ;(enhancedError as any).isRateLimitError = parsedError.isRateLimitError
    ;(enhancedError as any).retryDelaySeconds = parsedError.retryDelaySeconds

    throw enhancedError
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
  try {
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

    const result = await model.generateContent(prompt)
    const modifiedText = result.response.text()

    return modifiedText
  } catch (error) {
    console.error('[Editor Action] Failed:', error)
    throw error
  }
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
  try {
    const prompt = buildSelectionEditPrompt({
      instruction,
      selectedText,
      fullDocument,
      documentType,
      projectName,
    })

    const result = await model.generateContent({
      systemInstruction: selectionEditSystemInstruction,
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        temperature: 0.3,
      },
    })

    const responseText = result.response.text().trim()
    if (!responseText) {
      throw new Error('AI returned an empty response.')
    }

    return responseText
  } catch (error) {
    console.error('[Selection Edit] Failed:', error)
    const parsedError = parseGeminiError(error)
    const enhancedError = error instanceof Error ? error : new Error('AI selection edit failed')
    ;(enhancedError as any).isRateLimitError = parsedError.isRateLimitError
    ;(enhancedError as any).retryDelaySeconds = parsedError.retryDelaySeconds
    throw enhancedError
  }
}

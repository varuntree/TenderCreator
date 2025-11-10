import { Requirement } from '@/libs/repositories/work-packages'

const SELECTION_START_TOKEN = '<<<AI_SELECTION_START>>>'
const SELECTION_END_TOKEN = '<<<AI_SELECTION_END>>>'

const normalizePromptValue = (value: string) => value.replace(/\r/g, '')

const wrapWithSelectionTokens = (value: string) =>
  `${SELECTION_START_TOKEN}\n${value}\n${SELECTION_END_TOKEN}`

export const formatSelectionForPrompt = (value: string) => {
  const normalized = normalizePromptValue(value)
  return wrapWithSelectionTokens(normalized)
}

export const stripSelectionTokens = (value: string) => {
  return normalizePromptValue(value)
    .replaceAll(SELECTION_START_TOKEN, '')
    .replaceAll(SELECTION_END_TOKEN, '')
    .trim()
}

export { SELECTION_START_TOKEN, SELECTION_END_TOKEN }

export function buildExpandPrompt(selectedText: string, fullDocument: string, context: string): string {
  return `Selected text to expand:
"${selectedText}"

Full document context:
${fullDocument}

Supporting knowledge:
${context}

Task: Expand the selected text with 2-3 additional paragraphs providing:
- More specific details and examples
- Supporting evidence from the knowledge base
- Technical depth where appropriate
- Maintain the original tone and style

Return only the expanded text (including the original). No preamble.`
}

export function buildShortenPrompt(selectedText: string): string {
  return `Text to shorten:
"${selectedText}"

Task: Condense this text to 40-60% of original length while:
- Retaining all key points and critical information
- Maintaining professional tone
- Keeping it clear and readable

Return only the shortened text. No preamble.`
}

export function buildAddEvidencePrompt(selectedText: string, orgDocs: string): string {
  return `Statement needing evidence:
"${selectedText}"

Organization documents (case studies, certifications, projects):
${orgDocs}

Task: Find relevant evidence from organization documents that supports this statement. Add:
- Specific project examples
- Relevant certifications or awards
- Quantitative data (success metrics, scale, etc.)
- Case study references

Return the original text enhanced with 1-2 paragraphs of supporting evidence. Maintain flow.`
}

export function buildRephrasePrompt(selectedText: string, tone?: string): string {
  return `Text to rephrase:
"${selectedText}"

Task: Rephrase this text with ${tone || 'professional'} tone while:
- Preserving all key information
- Improving clarity and readability
- Varying sentence structure
- Maintaining appropriate formality for tender document

Return only the rephrased text. No preamble.`
}

export function buildCompliancePrompt(selectedText: string, requirements: Requirement[]): string {
  const requirementsText = requirements
    .map(r => `- [${r.priority.toUpperCase()}] ${r.text} (${r.source})`)
    .join('\n')

  return `Section to check:
"${selectedText}"

Requirements for this document:
${requirementsText}

Task: Analyze this section against the requirements. Provide:
1. Which requirements are addressed (list requirement text)
2. Which requirements are missing or inadequately addressed
3. Specific suggestions for addressing missing requirements

Output as structured text:
✓ Addressed: [list]
✗ Missing: [list]
📝 Suggestions: [specific recommendations]

Be concise but specific.`
}

export function buildCustomPrompt(selectedText: string, instruction: string, fullDocument: string): string {
  return `Selected text:
"${selectedText}"

Full document context:
${fullDocument}

User instruction:
${instruction}

Task: Apply the user's instruction to the selected text. Return the modified text only. No preamble.`
}

interface SelectionEditPromptArgs {
  instruction: string
  selectedText: string
  fullDocument: string
  documentType: string
  projectName: string
}

export const selectionEditSystemInstruction = `You are TenderCreator's senior bid writer. You specialise in crafting persuasive, evidence-led tender responses that are compliant, concise, and client-focused. Always maintain the voice, terminology, and formatting conventions of professional tender documents. Do not include meta commentary, explanations, or bullet labels in your output—return only the polished passage that should replace the selection. The selection is wrapped with ${SELECTION_START_TOKEN} and ${SELECTION_END_TOKEN}; do not echo those tokens in your response.`

export function buildSelectionEditPrompt({
  instruction,
  selectedText,
  fullDocument,
  documentType,
  projectName,
}: SelectionEditPromptArgs): string {
  return `Tender project: ${projectName}
Document type: ${documentType}

Full document content (Markdown):
${fullDocument}

Selected excerpt (rewrite only the text between ${SELECTION_START_TOKEN} and ${SELECTION_END_TOKEN}):
${formatSelectionForPrompt(selectedText)}

User instruction:
${instruction}

Task: Rewrite the text that sits between ${SELECTION_START_TOKEN} and ${SELECTION_END_TOKEN} so it follows the instruction while staying consistent with the document's voice, structure, and perspective. Keep commitments accurate, reuse relevant facts that are already present, and introduce additional supporting detail only when it strengthens the tender response. Return only the revised excerpt ready to replace the original selection, and do not include the ${SELECTION_START_TOKEN}/${SELECTION_END_TOKEN} markers in your output.`
}

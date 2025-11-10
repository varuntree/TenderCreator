import assert from 'node:assert/strict'

import {
  SELECTION_START_TOKEN,
  SELECTION_END_TOKEN,
  buildSelectionEditPrompt,
  stripSelectionTokens,
} from '@/libs/ai/prompts/editor-actions'

const prompt = buildSelectionEditPrompt({
  instruction: 'Use a more confident tone and mention the team name.',
  selectedText: 'We can help deliver the project on time.',
  fullDocument: '## Overview\nWe can help deliver the project on time.\n\n## Details\nComes with expertise.',
  documentType: 'Methodology',
  projectName: 'Test Project',
})

assert(prompt.includes('Tender project: Test Project'))
assert(prompt.includes('Document type: Methodology'))
assert(prompt.includes('Full document content (Markdown):'))
assert(prompt.includes('Selected excerpt'))
assert(prompt.includes('User instruction:'))
assert(prompt.includes(SELECTION_START_TOKEN))
assert(prompt.includes(SELECTION_END_TOKEN))
assert(prompt.indexOf(SELECTION_START_TOKEN) < prompt.indexOf(SELECTION_END_TOKEN))

const wrapped = `${SELECTION_START_TOKEN}New text${SELECTION_END_TOKEN}`
assert.strictEqual(stripSelectionTokens(wrapped), 'New text')

const trimmed = `  ${SELECTION_START_TOKEN}More polish${SELECTION_END_TOKEN}  `
assert.strictEqual(stripSelectionTokens(trimmed), 'More polish')

console.log('selection-edit prompt tests passed')

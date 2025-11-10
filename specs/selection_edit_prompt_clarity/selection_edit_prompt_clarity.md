# Plan: selection_edit_prompt_clarity

## Plan Description
Stabilize the AI-assisted selection edit workflow so that instructions consistently target the highlighted text within a document, keep the AI-aware decoration in sync with TipTap, and document the E2E validation steps. Users should be able to ask for simple edits (tone shift, detail update, evidence addition) without getting unpredictable rewrites.

## User Story
As a writer in a tender project
I want the "AI instruction" bubble to send the highlighted text plus the rest of the document in a clearly delimited way
So that the AI returns a reliable replacement that follows my request and slots back into the editor without corruption.

## Problem Statement
Selected-text edits currently deliver "random" results because the selection context and prompt do not make the AI understand which portion needs replacing, and the TipTap highlight/submit flow can lose the exact selection metadata when the user interacts with the instruction bubble.

## Solution Statement
Clarify the selection edit prompt by wrapping the selection and document context with explicit boundaries, preserve the selection range throughout the request/updating process, and add regression coverage (unit + scripted E2E) so that future interactions follow the current UI/UX pattern.

## Pattern Analysis
- `components/workflow-steps/content-editor.tsx:68-220` manages the TipTap selection highlight, the bubble menu, and the `handleSelectionInstruction` flow that gathers the selected text, document markdown, and calls the backend API. Keeping the `AiSelectionHighlight` metadata synchronized prevents the bubble from drifting when the instruction input steals focus.
- `app/api/work-packages/[id]/selection-edit/route.ts:1-64` validates the payload and forwards the request to `runSelectionEdit`, mirroring patterns used for other AI mutations (`content` streaming, etc.).
- `libs/ai/content-generation.ts:150-230` wraps the Gemini request via `runSelectionEdit`, reusing the `selectionEditSystemInstruction` from `libs/ai/prompts/editor-actions.ts:1-170`. That module demonstrates the existing prompt construction pattern (context + instructions + request snippets) and is the natural place to introduce delimiting markers.
- Pattern deviation: we will add explicit markers (e.g., `<START_SELECTION>`/`<END_SELECTION>`) and sanitized metadata to the prompt/response handshake so the AI output is less brittle while staying within the existing Gemini request flow.

## Dependencies
### Previous Plans
- None

### External Dependencies
- None

## Relevant Files
- `ai_docs/documentation/CONTEXT.md` - project-level goals that explain why TenderCreator-style AI editing must feel professionally precise and why Gemini 2.0 Flash is the single AI model in use.
- `ai_docs/documentation/PRD.md` - confirms the selection edit workflow belongs to "Phase 4" AI editor actions and references the requirement for AI-assisted editing that respects document tone and structure.
- `ai_docs/documentation/standards/*` - use formatting/coding style indicated there when editing backend or UI files.
- `components/workflow-steps/content-editor.tsx` - the TipTap editor and AI bubble (selection tracking, API request). Review the existing highlight logic before adjusting how we capture range + text for the request.
- `app/api/work-packages/[id]/selection-edit/route.ts` - request validation and passing metadata to `runSelectionEdit`; follow its structure when adding any new payload fields or error handling.
- `libs/ai/content-generation.ts` - `runSelectionEdit` currently builds Gemini prompt + response handling; modifications here must still route through `executeRequest` and honor rate-limit errors.
- `libs/ai/prompts/editor-actions.ts` - the prompt builder. It already shows how other AI actions embed selected text; this file is the focal point for adding delimiters/metadata so AI knows what to replace.
- `.claude/commands/test_e2e.md` - read before authoring/running any E2E test to understand the required format and reporting expectations (per plan instructions).
- `.claude/commands/e2e/test_basic_query.md` - a sample E2E definition to understand how new tests should be structured; mimic format when creating `test_selection_edit_flow`.

### New Files
- `.claude/commands/e2e/test_selection_edit_flow.md` - describe the E2E steps that cover the selection-highlighting → instruction bubble → AI edit cycle and capture the required screenshots.

## Acceptance Criteria
- [ ] The selection edit prompt explicitly delimits the selected excerpt (e.g., START/END markers) and reuses sanitized markdown so Gemini reliably modifies only that block.
- [ ] The TipTap editor keeps the AI selection highlight active through the request/response cycle, and errors or cleared input do not drop the intended range before the user confirms the edit.
- [ ] Backend and AI layers still honor rate-limit/error handling; new payload fields (if any) are validated and handled similar to current endpoints.
- [ ] Unit tests guard the new prompt structure or selection sanitization logic, ensuring future changes keep the format intact.
- [ ] A new `.claude/commands/e2e/test_selection_edit_flow.md` file documents the user workflow and is executed via the existing E2E harness as part of validation.

## Step by Step Tasks
**EXECUTION RULES:**
- Execute ALL steps below in exact order
- Check Acceptance Criteria - all items are REQUIRED
- Do NOT skip UI/frontend steps if in acceptance criteria
- If blocked, document and continue other steps

### 1. Drill into selection-edit wiring and design prompt delimiters
- Re-review `components/workflow-steps/content-editor.tsx` to confirm how selectionText, persisted ranges, and `handleSelectionInstruction` capture payload data; note how markdown is generated via `htmlToMarkdown`.
- Map how the API route currently validates the payload and how `runSelectionEdit` builds/prompts Gemini via `buildSelectionEditPrompt`.
- Decide on the best delimiter tokens/phrasing (e.g., `<<START_SELECTION>>`/`<<END_SELECTION>>`) that will make the selection stand out to Gemini while keeping `full_document` within prompt limits.
- Document the planned delimiter style so downstream UI/back-end changes know what to expect.

### 2. Implement backend + prompt updates
- Update `libs/ai/prompts/editor-actions.ts` so `buildSelectionEditPrompt` wraps `selectedText` with the chosen markers and clarifies the difference between the highlighted chunk and the rest of the document. Include optional metadata (like selection character length) if it helps clarity.
- Adjust `libs/ai/content-generation.ts` `runSelectionEdit` (and any helper functions) so it passes the updated prompt and sanitizes `fullDocument`/`selectedText` identically to the UI (e.g., escaping delimiter tokens, trimming). Keep rate-limit error handling intact.
- If any new payload fields are necessary (e.g., `selection_span`), extend the API route (`app/api/work-packages/[id]/selection-edit/route.ts`) to validate them and forward to `runSelectionEdit`.

### 3. Reinforce TipTap selection handling and UI messaging
- Ensure `handleSelectionInstruction` in `components/workflow-steps/content-editor.tsx` logs/retains the same range before/after sending the request so the highlight does not collapse when the bubble steals focus; adjust `previousSelectionRef`, `setSelectionText`, or highlight clearing as necessary.
- When the AI response is applied, make sure the cursor/selection resets cleanly (insert content + highlight removal) and toast messages remain accurate; verify the `aiInstruction` input state flows correctly even when the user reopens it.
- Add inline comments or helper variables where clarity is needed so future developers understand that the selection highlight must survive focus shifts.

---
✅ CHECKPOINT: Steps 1-3 complete (Backend + UI alignment). Continue to step 4.
---

### 4. Add unit tests for the new prompt structure
- Create or extend a Jest/tsx-compatible test (under `libs/ai/__tests__` or similar) that asserts `buildSelectionEditPrompt` wraps the selection with the delimiter tokens and includes the instruction + document context.
- Cover tricky cases (e.g., selection contains delimiter tokens, multiline input) to ensure escaping logic works.
- If no test harness exists for prompts, add a small file under `tests/` that can be executed with `node` or `tsx` to run these assertions.
- Make sure the new test is referenced by `npm run lint` (or another script) so validation commands will catch regressions.

### 5. Document and script E2E validation for the selection edit bubble
- Study `.claude/commands/test_e2e.md` and `.claude/commands/e2e/test_basic_query.md` to understand the required structure, screenshots, and reporting format.
- Write `.claude/commands/e2e/test_selection_edit_flow.md` that outlines the workflow: log in (test credentials), navigate to a work package, select text in the editor, enter a simple instruction (e.g., "Rephrase this sentence with a more confident tone"), and verify the replacement matches the instruction. Describe the screenshots required (e.g., initial selection, post-edit result).
- Ensure the test references `test_results/test_selection_edit_flow/` for screenshots and includes the JSON output format required by the E2E runner.

### 6. Run Validation Commands (lint, new tests, E2E)
- Execute the commands listed in the Validation Commands section (lint, unit test script) and confirm they succeed.
- Run the E2E test by reading `.claude/commands/test_e2e.md` and executing `.claude/commands/e2e/test_selection_edit_flow.md` through the prescribed harness (capture/describe outcomes).
- Collect evidence (logs/screenshots) as specified so the final report can reference success.

## Testing Strategy
### Unit Tests
- Assert `buildSelectionEditPrompt` produces the new markerized format for a sample instruction, ensuring the delimiter tokens appear around `selectedText` and the instruction is appended.
- Test that `runSelectionEdit` rejects empty selection or null `fullDocument` after formatting, maintaining previous validation guarantees.
- Include at least one test that simulates special characters (quotes, backticks, newline) inside the selection to ensure the prompt remains valid.

### Edge Cases
- Selection spans entire document (full_document ~= selected_text); ensure markers do not confuse Gemini and the result still replaces the text.
- Selection contains existing marker tokens (the chosen START/END strings); we need escaping or another deterministic fallback so prompts remain well-formed.
- Gemini responds with text containing the marker tokens; we must trim them and insert only the polished excerpt.

## Validation Commands
# Implementation log created at:
# specs/selection_edit_prompt_clarity/selection_edit_prompt_clarity_implementation.log
- `npm run lint` → reports no lint errors and includes the new prompt/test files.
- `npm run build` → succeeds to ensure Next.js configuration handles new imports (if any).
- `node tests/selection-edit-prompt.test.js` (or appropriate script) → confirms the prompt format and escaping logic pass.
- Read `.claude/commands/test_e2e.md`, then run `.claude/commands/e2e/test_selection_edit_flow.md` using the standard Playwright harness; expect a JSON report with `"status": "passed"` and all required screenshots saved.

**E2E Testing Strategy:**
- Use the test credentials listed in `.claude/commands/test_e2e.md`
- Reference absolute test fixtures if the flow requires file uploads
- Sign in via email/password: `test@tendercreator.dev` / `TestPass123!`
- Follow the workflow described in `.claude/commands/e2e/test_selection_edit_flow.md`

## Definition of Done
- [ ] All acceptance criteria met
- [ ] All validation commands pass with expected output
- [ ] No regressions (existing tests still pass)
- [ ] Patterns followed (documented in Pattern Analysis)
- [ ] E2E test created and passing (if UI change)

## Notes
- If Gemini still misbehaves, we may need to inspect the response for hints (e.g., start/end tokens are missing) and log the raw prompt/response for debugging.

## Research Documentation
- None

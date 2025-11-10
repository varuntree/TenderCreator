# Plan: generate_all_documents_fix

## Plan Description
Stabilize the "Generate All Documents" experience so project owners can reliably trigger multi-document AI runs, cap selections to safe batch sizes, and see transparent success/error states. The work covers reproducing the current 500/404 failures, hardening the `/api/projects/[id]/generate-batch` pipeline (including fallbacks when Gemini refuses structured JSON), tightening client-side selection UX, and validating the end-to-end flow (UI + API + persistence) via automated tests and a Puppeteer-based E2E run.

## User Story
As a project owner assembling a tender package
I want to select multiple work packages and generate them in one action with accurate feedback
So that I can finish multi-document tenders quickly without rerunning each document manually.

## Problem Statement
Clicking "Generate All Documents" currently fires the batch API, but the request returns HTTP 500 and individual work packages never store content; the UI only shows a generic error while `/api/work-packages/[id]/content` keeps returning 404 because nothing was persisted. Without limits or fallbacks, Gemini often breaks schema output, leaving every document in limbo.

## Solution Statement
Investigate the failing requests, then reinforce the backend so `/generate-batch` validates payloads, enforces a max of two documents per batch, and falls back to the proven single-document pipeline when Gemini’s multi-doc JSON is malformed. On the client, enforce the same selection cap, surface per-document progress/errors, and refresh the dashboard reliably. Finish with regression tests (unit + E2E) that simulate a two-document run so we know the experience works before demos.

## Pattern Analysis
- `components/work-package-table.tsx:69-252` already wires the dialog and progress UI into the dashboard; we’ll extend this to enforce selection caps, show better error states, and trigger retries.
- `components/generate-documents-dialog.tsx:52-219` auto-selects all pending docs and handles progress badges; the selection logic must gain max-selection guards and helper messaging rather than silently failing.
- `components/generation-agents-panel.tsx:1-210` renders the animated progress grid; tapping into its props lets us reflect accurate statuses after backend changes.
- `libs/utils/parallel-generation.ts:1-154` coordinates client-side batching + concurrency; we can hook improved error handling and optional instructions here so UI stays reactive even if server batches partially fail.
- `libs/utils/bulk-generation-v2.ts:33-200` shows the legacy sequential batching strategy and retry split behavior—useful for designing a server-side fallback path when multi-doc prompts exceed token limits.
- `app/api/projects/[id]/generate-batch/route.ts:1-186` currently marks statuses, assembles context, and trusts Gemini’s JSON; we’ll add stricter validation, limit selection size, and a fallback that loops through `generateStrategy` + `generateDocumentContent` when needed.
- `libs/ai/content-generation.ts:210-357` houses the combined strategy generator and the `generateBatch` helper; we can extend it with schema validation utilities to detect malformed outputs before returning.
- `app/api/work-packages/[id]/content/route.ts:6-80` returns 404 when no content exists; understanding this contract helps us decide whether to create the record proactively after batch success.
- `components/workflow-steps/content-editor.tsx:365-500` streams single-document generations from `/api/work-packages/[id]/generate-content`; its fetch/save semantics form the fallback reference implementation.
- `tests/parallel-generation.test.ts:1-57` mocks fetch to verify concurrency and failure handling; we’ll extend/duplicate this style of test for the new error-surface logic.

## Dependencies
### Previous Plans
- `specs/generate-docs-selection-flow/generate-docs-selection-flow.md` – original UX/architecture plan for the selection dialog and parallel generation. Reuse its design language and ensure new work stays compatible with earlier decisions.

### External Dependencies
- Gemini 2.0 Flash for AI generation (honor the 1,048,576-token window + JSON best practices noted in `specs/generate_all_documents_fix/research.md`).
- Supabase Postgres for work package + content persistence.

## Relevant Files
Use these files to implement the task:

- `ai_docs/documentation/CONTEXT.md` & `ai_docs/documentation/PRD.md`: Refresh product goals + scope guardrails.
- `ai_docs/documentation/standards/coding_patterns.md` and `ai_docs/documentation/standards/system-architecture.md`: Enforce coding + architectural constraints for repos/API layers.
- `components/work-package-dashboard.tsx` & `components/work-package-table.tsx`: Entry point + UI state for work-package actions that must react to new generation behavior.
- `components/generate-documents-dialog.tsx` & `components/generation-agents-panel.tsx`: Selection modal + progress UI to update with caps, instructions, and clearer error handling.
- `libs/utils/parallel-generation.ts` & `libs/utils/bulk-generation-v2.ts`: Client batching logic to refine (error handling, instructions, max batch size).
- `libs/ai/content-generation.ts` & `libs/ai/prompts/batch-generation.ts`: Gemini prompt helpers needing stricter schema enforcement + fallback pathways.
- `app/api/projects/[id]/generate-batch/route.ts`: Primary backend endpoint to harden (selection limits, fallback to single-doc pipeline, improved logging/responses).
- `libs/repositories/work-package-content.ts` & `app/api/work-packages/[id]/content/route.ts`: Content persistence/contracts to verify after batch saves.
- `components/workflow-steps/content-editor.tsx` & `app/api/work-packages/[id]/generate-content/route.ts`: Reference single-doc flow for fallback implementation details.
- `.claude/commands/test_e2e.md` and `.claude/commands/e2e/test_basic_query.md`: Instructions + example format for crafting the new E2E scenario.

### New Files
- `.claude/commands/e2e/test_generate_all_documents_fix.md`: E2E script describing the two-document selection/generation journey + screenshots.
- `specs/generate_all_documents_fix/generate_all_documents_fix_implementation.log`: Rolling log of implementation progress (append as `/implement` runs).

## Acceptance Criteria
- Selecting more than two documents in the Generate dialog shows a clear cap message and blocks submission both client- and server-side.
- `/api/projects/[id]/generate-batch` returns 200 with per-document success/error payloads (no blanket 500) even when Gemini returns malformed JSON; successful documents persist bid analysis, win themes, and content via `saveCombinedGeneration`.
- Failed documents stay in `pending` with actionable error reasons surfaced in the dialog and toast notifications; successful ones flip to `completed` and show updated content when opened.
- Fallback to the single-document generation path automatically runs when batch parsing fails or when Gemini exceeds token limits, preventing total loss of a run.
- Parallel generation UI reflects real-time progress, including partial failures, and auto-refreshes the dashboard list when runs complete.
- Automated coverage: updated unit tests for `parallelGenerateDocuments` (including new error handling) and a Puppeteer E2E test proving two-document generation succeeds end-to-end using provided fixtures/credentials.

## Step by Step Tasks

**EXECUTION RULES:**
- Execute ALL steps below in exact order
- Check Acceptance Criteria - all items are REQUIRED
- Do NOT skip UI/frontend steps if in acceptance criteria
- If blocked, document and continue other steps

### 1. Reproduce & document current failures
- Run the app, trigger "Generate All Documents" with two pending work packages, capture network traces/logs for the 500 + 404 errors, and note any Gemini error payloads.
- Append findings + stack traces to `specs/generate_all_documents_fix/generate_all_documents_fix_implementation.log` for future reference.

### 2. Harden batch API contracts
- Update `/api/projects/[id]/generate-batch/route.ts` to enforce a server-side selection cap (max 2 IDs) and emit descriptive 400 errors when exceeded.
- Instrument structured logging so we can differentiate schema-validation failures vs token issues; include correlation IDs per request.
- Adjust response payloads to always include per-document results (success or error message) even when upstream AI fails.

### 3. Implement batch fallback & schema validation
- Extend `libs/ai/content-generation.ts` with a helper that validates Gemini’s batch JSON (ensuring `workPackageId`, `bidAnalysis.criteria`, `winThemes`, `content` exist). If validation fails, fall back to iterating each work package through existing `generateStrategy` + `generateDocumentContent` (respecting cached context) and merge their results.
- Update `buildBatchGenerationPrompt` / prompt instructions to reiterate JSON-only output + schema keys per Google best-practice research.
- Ensure statuses revert correctly on failures (`pending` on error, `completed` only after `saveCombinedGeneration` succeeds) and handle token-limit or rate-limit cases gracefully.

---
✅ CHECKPOINT: Steps 1-3 complete (Backend resiliency). Continue to step 4.
---

### 4. Refine client selection & orchestration UX
- In `components/generate-documents-dialog.tsx`, enforce the max-selection limit with inline messaging + disabled checkboxes once the cap is reached; add copy reminding users to run two docs at a time.
- Update `components/work-package-table.tsx` to surface new error strings from `parallelGenerateDocuments`, keep the dialog open when failures occur, and auto-refresh list only after statuses settle.
- Adjust `GenerationAgentsPanel` props/state if needed to distinguish queued/running/success/error counts after backend changes.

### 5. Enhance client batching utility
- Update `libs/utils/parallel-generation.ts` to propagate server error bodies (including per-doc errors) back to the dialog, handle new 400 guardrails, and optionally send custom instructions.
- Expand `tests/parallel-generation.test.ts` to cover the new error payload handling and cap enforcement logic.

---
✅ CHECKPOINT: Steps 4-5 complete (Frontend/client orchestration). Continue to step 6.
---

### 6. Author E2E scenario description
- Create `.claude/commands/e2e/test_generate_all_documents_fix.md` based on the basic query template, detailing steps to sign in, open a project, select exactly two documents, run generation, verify status updates/toasts, and capture required screenshots.
- Reference `.claude/commands/test_e2e.md` for credential/runner expectations while drafting the scenario file.

### 7. Validation & logs
- Run lint/build/unit tests plus the updated `tests/parallel-generation.test.ts` (via `tsx` or `node`), ensuring outputs are recorded.
- Use Puppeteer MCP via `.claude/commands/test_e2e.md` + the new E2E file to simulate the two-document run (respecting the credit guidance) and archive screenshots under `test_results/test_generate_all_documents_fix/`.
- Record command outputs + any fixes applied in `specs/generate_all_documents_fix/generate_all_documents_fix_implementation.log`.

## Testing Strategy
### Unit Tests
- Extend `tests/parallel-generation.test.ts` to cover: (a) server 400 (cap exceeded) handling, (b) partial failure payloads returning messages, (c) ensuring the queued/running/success/error events still fire with new logic.
- Optionally add lightweight tests (or scriptable assertions) around new schema-validation helper in `libs/ai/content-generation.ts` (pure functions, no AI calls) to ensure malformed payloads trigger fallback.

### Edge Cases
- User tries selecting >2 docs → dialog shows limit + disables additional checkboxes.
- Batch API returns mix of success/error results → UI surfaces failed docs without losing successful outputs.
- Gemini returns malformed JSON → fallback kicks in, returning success for docs that re-run sequentially.
- Context/token limit warnings → server responds with actionable 400 message instead of 500.
- Re-running after partial failure → previously completed docs remain skipped/disabled.

## Validation Commands
Execute every command to validate the task works correctly with zero regressions.

1. `npm run lint` → expect “No ESLint warnings or errors”.
2. `npm run build` → Next.js compiles successfully with zero type errors.
3. `tsx tests/parallel-generation.test.ts` (or `node --loader tsx tests/parallel-generation.test.ts`) → console logs indicate all assertions pass, including new error-handling cases.
4. `cat .claude/commands/test_e2e.md` → re-read harness instructions before running UI flows.
5. `cat .claude/commands/e2e/test_generate_all_documents_fix.md` → verify E2E steps match latest UX before execution.
6. Run Puppeteer MCP via `.claude/commands/test_e2e.md` with `e2e_test_file=.claude/commands/e2e/test_generate_all_documents_fix.md` → expect JSON output `{ "status": "passed", ... }` plus screenshots in `test_results/test_generate_all_documents_fix/`.

# Implementation log created at:
# specs/generate_all_documents_fix/generate_all_documents_fix_implementation.log

## Definition of Done
- [ ] All acceptance criteria met
- [ ] All validation commands pass with expected output
- [ ] No regressions (existing tests still pass)
- [ ] Patterns followed (documented in Pattern Analysis)
- [ ] E2E test created and passing (UI change validated)

## Notes
- Testing guidance from the user: during manual/E2E verification, limit batches to two documents to stay within safe credit usage.
- Consider capturing additional telemetry (e.g., Gemini token estimates) once the fallback proves stable.

## Research Documentation
- `specs/generate_all_documents_fix/research.md` – summaries + citations covering Next.js runtime constraints and Gemini batch best practices/token limits.

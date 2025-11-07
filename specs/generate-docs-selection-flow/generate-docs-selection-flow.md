# Plan: generate-docs-selection-flow

## Plan Description
Rewrite the broken “Generate All Documents” workflow so users can choose specific work packages, fire off parallelized generation, and see truthful status signals. This plan covers the UI changes (selection dialog + progress), frontend orchestration for concurrent generation batches, backend/status updates, and regression-proof validation so the flow is reliable for demos.

## User Story
As a tender writer working inside a project dashboard
I want to pick which AI documents to bulk-generate and watch each one complete accurately
So that I’m confident the platform can deliver multiple tender artifacts quickly without manual babysitting.

## Problem Statement
The existing bulk generation button immediately triggers long-running sequential batches with no user control, often timing out and leaving work packages stuck in an “in progress” limbo even when content exists. This erodes trust because nothing finishes and statuses stay wrong.

## Solution Statement
Introduce a selection-first dialog that lists every work package, allows multi-select with clear CTAs (“Generate selected documents”), and orchestrates concurrent batch calls with throttled parallelism. While the front end fans out requests, the backend will mark work packages as `in_progress` when dispatched and `completed` when content saves, updating the dashboard to highlight successes in green. This simpler, resilient approach reduces failure surfaces, surfaces granular errors, and provides instant visual feedback.

## Pattern Analysis
- `components/work-package-table.tsx:124-222` shows the current single-button bulk action pattern, toast usage, and skeleton state handling we must extend when introducing a modal and per-row progress.
- `libs/utils/bulk-generation-v2.ts:126-314` implements client-side batching with sequential API calls; its structure (smart batching + progress callback) guides how to refactor toward limited parallel execution instead of naive sequential batches.
- `app/api/projects/[id]/generate-batch/route.ts:1-118` demonstrates how server-side batch generation assembles context once and saves combined results—any new orchestration should keep this API (or a simplified variant) as the workhorse per batch.
- `libs/repositories/work-package-content.ts:160-233` and `saveCombinedGeneration` illustrate the correct persistence flow after AI finishes, highlighting where we can hook status updates.
- `app/api/work-packages/[id]/status/route.ts:30-70` plus `migrations/phase_1/001_initial_schema.sql:72-97` reveal the status enum mismatch (`pending` vs `not_started`) that causes inaccurate UI highlights—we must realign both layers to the enum defined in the migration.
- `components/work-package-dashboard.tsx:70-119` embeds `WorkPackageTable` and handles assignment/status refresh, so any new state props (selection dialog, progress callbacks) must thread through this component.
- `components/status-badge.tsx:1-44` defines the canonical visual treatment for `pending/in_progress/completed`, which we should reuse for the per-row real-time status block in the selection dialog.

## Dependencies
### Previous Plans
- None.

### External Dependencies
- Gemini 2.0 Flash batch generation endpoint (existing `/api/projects/[id]/generate-batch`). No new third-party services required.

## Relevant Files
Use these files to implement the task:

- `ai_docs/documentation/CONTEXT.md`: Project context and constraints that must stay true while altering workflows.
- `ai_docs/documentation/PRD.md`: Defines multi-document orchestration expectations we’re fixing.
- `ai_docs/documentation/standards/coding_patterns.md`: Styling + architectural rules for new components/utilities.
- `ai_docs/documentation/standards/system-architecture.md`: Ensure backend changes respect layering.
- `components/work-package-dashboard.tsx`: Hosts the dashboard actions; needs props/state hookups for the new flow.
- `components/work-package-table.tsx`: Primary UI to refactor into “open selection dialog → run generation.”
- `components/status-badge.tsx`: Visual pattern for statuses we must leverage both in-table and new modal.
- `libs/utils/bulk-generation-v2.ts`: Starting point for new parallel orchestration utility.
- `libs/repositories/work-packages.ts` & `app/api/work-packages/[id]/status/route.ts`: Update status helpers + API validation to the corrected enum.
- `app/api/work-packages/[id]/generate-content/route.ts` and `app/api/projects/[id]/generate-batch/route.ts`: Ensure server status updates happen when generations start/finish.
- `libs/repositories/work-package-content.ts`: Hook status updates when saving combined outputs.
- `app/(dashboard)/projects/[id]/page.tsx`: Wire refreshed props and ensure page-level state reflects the new UX.
- `components/ui/dialog.tsx`, `components/ui/checkbox.tsx`, `components/ui/progress.tsx` (or existing equivalents): Provide Radix-based primitives for the selection modal.
- `Read '.claude/commands/test_e2e.md'` to internalize how to author/run E2E flows.
- `Read '.claude/commands/e2e/test_basic_query.md'` as the template for structuring the new E2E test spec.

### New Files
- `components/generate-documents-dialog.tsx`: Encapsulate the selection list, CTAs, and progress UI.
- `libs/utils/parallel-generation.ts`: New helper to fan out and throttle batch calls while exposing granular progress.
- `.claude/commands/e2e/test_generate-docs-selection.md`: E2E playbook validating the reimagined bulk generation flow.
- `specs/generate-docs-selection-flow/generate-docs-selection-flow_implementation.log`: Running log per instructions.

## Acceptance Criteria
- Clicking “Generate all documents” opens a modal listing every work package with selection checkboxes, status badges, and requirement counts.
- Primary CTA text dynamically reflects selection count (e.g., disabled until one selected, “Generate selected document” vs “Generate 4 documents”).
- Selected documents kick off parallelized generation (at least 2 concurrent batches) with visible per-document progress + error states, and the modal can be reopened to monitor status.
- Successful generations transition work packages to `completed` (green indicator) automatically; failures revert to prior status with surfaced error messages.
- Database/API layers use a consistent status enum (`pending`, `in_progress`, `completed`, `review` optional) and update values immediately when generation starts/finishes.
- Toasts or inline alerts summarize how many documents succeeded/failed.
- New E2E script walks through selecting multiple docs, running generation, and confirming status changes without manual DB tweaks.

## Step by Step Tasks

**EXECUTION RULES:**
- Execute ALL steps below in exact order
- Check Acceptance Criteria - all items are REQUIRED
- Do NOT skip UI/frontend steps if in acceptance criteria
- If blocked, document and continue other steps

### 1. Deep Dive + Status Enum Alignment
- Reconfirm current work package status enum in migrations vs runtime usage; document the agreed final enum in the implementation log.
- Update `libs/repositories/work-packages.ts`, `app/api/work-packages/[id]/status/route.ts`, and any client enums to use `pending/in_progress/completed/review` consistently.
- Plan necessary SQL migration (if enum update required) and add to backlog if outside current scope.

### 2. Design Selection Modal Contract
- Define prop contract + data requirements for `GenerateDocumentsDialog` (input list, callbacks for submit/progress, reporting errors).
- Sketch UI structure (header, filter/search optional, list rows with checkbox + metadata) referencing design tokens.
- Document UX behavior (auto-close, ability to reopen while running, disabled states) in the implementation log.

### 3. Implement Selection Modal Component
- Build `components/generate-documents-dialog.tsx` using Radix Dialog, Checkbox, ScrollArea, and `StatusBadge` for each row.
- Include selection summary, CTA label swap (“Generate selected document(s)”), progress indicator placeholder, and error messaging area.
- Ensure component accepts `initiallySelected`, `onSubmit(selectedIds)`, and `progress` props so WorkPackageTable can control behavior.

---
✅ CHECKPOINT: Steps 1-3 complete (Analysis + UI foundation). Continue to step 4.
---

### 4. Parallel Generation Utility + Backend Hooks
- Create `libs/utils/parallel-generation.ts` that accepts projectId + workPackageIds, chunks them (max 2-3 per batch), and runs multiple `generate-batch` fetches concurrently (Promise pool with configurable concurrency).
- Emit granular progress events (`started`, `succeeded`, `failed`) so UI can reflect per-doc state.
- Update `/api/projects/[id]/generate-batch` response handling to mark work packages `in_progress` at dispatch (via new helper) and `completed` once `saveCombinedGeneration` succeeds; ensure failures roll status back to `pending`.
- Ensure single-document generation (`/api/work-packages/[id]/generate-content`) also marks status `completed` post-save for consistency.

### 5. Integrate Dialog + Utility in Dashboard
- Refactor `WorkPackageTable` so the “Generate All” button opens the new dialog instead of firing immediately.
- Pass work package metadata + callbacks into `GenerateDocumentsDialog`; wire selection submissions to the new parallel utility.
- Update UI to show inline progress counts, disable rows already `completed`, and highlight success state (green) upon finish; ensure `onRefresh` fires after all promises settle.

---
✅ CHECKPOINT: Steps 4-5 complete (Backend + Frontend integration). Continue to step 6.
---

### 6. Telemetry, Toasts, and Edge Case Handling
- Surface toast summaries for success/failure counts and expose per-row error tooltips/logs inside the dialog.
- Handle cancel/close scenarios gracefully (allow reopening to monitor existing run, ensure state resets when run completes).
- Confirm status badge colors update immediately in both dialog and table after backend responses.

### 7. Create E2E Test Spec
- Review `.claude/commands/test_e2e.md` and `.claude/commands/e2e/test_basic_query.md` for structure guidance.
- Author `.claude/commands/e2e/test_generate-docs-selection.md` detailing steps to select multiple docs, trigger generation, verify statuses/toasts, and capture screenshots.

### 8. Unit/Integration Coverage + Implementation Log
- Add targeted unit tests (or lightweight integration harness) for `parallel-generation.ts` to validate batching + concurrency logic.
- Update/extend any existing tests touching work package status updates.
- Maintain `specs/generate-docs-selection-flow/generate-docs-selection-flow_implementation.log` with major decisions and validations.

### 9. Validation + Regression Pass
- Run lint/build/test commands listed below.
- Execute the new E2E playbook via MCP instructions and capture artifacts.
- Document results + any follow-up in the implementation log.

## Testing Strategy
### Unit Tests
- `libs/utils/parallel-generation.ts`: test chunking + concurrency throttling + progress callback ordering using mocked fetches.
- Repository/API helpers: add regression tests (or scriptable checks) ensuring status transitions occur when save succeeds/fails.

### Edge Cases
- User selects zero docs → CTA disabled and friendly hint.
- Mixed statuses (some completed) → completed rows prechecked/disabled with explanation.
- Partial failures (one batch errors) → ensure failures report while successful docs still complete.
- Reopening modal mid-run → progress indicators keep current state without double-sending requests.
- Backend 429/rate limit responses → verify retry/backoff strategy surfaces wait messaging.

## Validation Commands
Execute every command to validate the task works correctly with zero regressions.

- `npm run lint` → should finish with “✅ No ESLint warnings or errors”.
- `npm run build` → Next.js compiles successfully with no type errors.
- `node -e "console.log('parallel-generation tests placeholder')"` (replace with actual test runner) → outputs passing summary for new utility tests.
- `cat .claude/commands/test_e2e.md` → confirm latest harness instructions prior to running UI validation.
- `cat .claude/commands/e2e/test_generate-docs-selection.md` → verify steps align with new UX before execution.
- Execute the Playwright command documented in `.claude/commands/test_e2e.md` using the new test file → expect JSON report with `status: "passed"` and screenshots showing selection + completed states.

**E2E Testing Strategy:**
- Use provided credentials (`test@tendercreator.dev / TestPass123!`).
- Rely on fixtures in `test_fixtures/` for uploads if script requires sample docs.
- Follow `.claude/commands/test_e2e.md` flow exactly; capture screenshots into `test_results/test_generate-docs-selection/`.

# Implementation log created at:
# specs/generate-docs-selection-flow/generate-docs-selection-flow_implementation.log

## Definition of Done
- [ ] All acceptance criteria met
- [ ] All validation commands pass with expected output
- [ ] No regressions (existing tests still pass)
- [ ] Patterns followed (documented in Pattern Analysis)
- [ ] E2E test created and passing (if UI change)

## Notes
- Consider future enhancement: allow per-row re-run from dialog even after mass action completes.
- Watch Supabase Edge runtime limits—may need to cap concurrency at 2-3 to avoid token overload.

## Research Documentation
- None (existing repository knowledge + specs were sufficient; no external research files created).

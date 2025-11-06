# Plan: single_page_editor_layout

## Plan Description
Polish the intelligent editing experience on `/work-packages/[id]` by (1) rendering Gemini’s generated Markdown as rich TipTap content so headings, emphasis, and lists display correctly, and (2) constraining scrolling to the editor surface so the rest of the workflow shell remains fixed on a single page. This ensures writers immediately see well-formatted documents and keeps navigation/CTAs anchored while they scroll within the editor.

## Plan Objectives
- Normalize generated Markdown to HTML before TipTap initializes so content loads with correct typography, heading levels, and emphasis.
- Keep the workflow page height stable with only the editor body scrollable, ensuring breadcrumbs, tabs, and action buttons stay visible.
- Provide E2E guidance so QA can manually verify formatting and scrolling behavior.

## Problem Statement
Currently, the Editor step shows literal Markdown symbols (`#`, `##`, `**`) because generated content is injected directly into TipTap without conversion. In addition, long documents force the entire dashboard to scroll, so navbar/tabs move out of view, which contradicts the single-page requirement.

## Solution Statement
Introduce a Markdown-to-HTML conversion pass (using the lightweight `marked` parser) before hydrating TipTap, with safeguards to avoid double-rendering existing HTML. Update the editor layout to occupy the remaining viewport height using flex utilities, set the editor container to `overflow-y-auto`, and keep the rest of the workflow chrome fixed. Add regression instructions via a new E2E test doc covering formatting and scroll expectations.

## Dependencies
### Previous Plans
- `specs/phase_4_single_document_workflow/plan.md` (TipTap/editor foundation); no changes required but informs existing component structure.

### External Dependencies
- `marked` npm package for Markdown → HTML parsing (small footprint, browser-friendly).

## Relevant Files
Use these files to implement the task:
- `ai_docs/documentation/CONTEXT.md` – Reaffirms UX expectations for the multi-document workflow and editor polish.
- `ai_docs/documentation/PRD.md` – Describes the editing phase requirements and motivation for high-fidelity formatting.
- `components/workflow-steps/content-editor.tsx` – TipTap wrapper that needs Markdown conversion logic plus height/overflow adjustments.
- `components/workflow-steps/editor-screen.tsx` – Hosts the editor CTA/back buttons; must become a flex column with fixed header/footer regions so only the editor scrolls.
- `app/(dashboard)/work-packages/[id]/page.tsx` – Sets the container around `WorkflowTabs`; needs sizing tweaks so the tab body fills the viewport height and hands min-height constraints to child screens.
- `.claude/commands/test_e2e.md` & `.claude/commands/e2e/test_basic_query.md` – Reference formats for crafting the new E2E guide.

### New Files
- `.claude/commands/e2e/test_editor_single_page.md` – Manual E2E checklist verifying Markdown formatting and editor-only scrolling.

## Acceptance Criteria
1. Markdown outputs from Gemini render inside TipTap with proper headings, emphasis, bullet lists, and paragraphs—no literal `#`/`**` tokens remain when first opening the editor.
2. The Markdown conversion is idempotent: existing HTML (e.g., from prior edits) is not double-escaped or broken during hydration.
3. The Work Package workflow view maintains a fixed layout (breadcrumbs, tabs, action buttons); only the editor content area scrolls while the surrounding page stays static.
4. Editor toolbar and navigation buttons remain visible while scrolling long documents, confirming the single-page experience.
5. New E2E instructions file documents how to validate the formatting + scrolling behavior, following the repository’s e2e template.
6. `npm run lint` passes with no new warnings/errors.

## Step by Step Tasks

**EXECUTION RULES:**
- Execute ALL steps below in exact order
- Check Acceptance Criteria - all items are REQUIRED
- Do NOT skip UI/frontend steps if in acceptance criteria
- If blocked, document and continue other steps

### 1. Review References & Current Editor Flow
- Re-read `CONTEXT.md`, `PRD.md`, and phase 4 plan excerpts covering the editor expectations.
- Inspect `work-packages/[id]/page.tsx`, `editor-screen.tsx`, and `content-editor.tsx` to confirm current props, layout, and save cycle.

### 2. Add Markdown Parsing Dependency
- Install the `marked` package (or equivalent lightweight parser) and document it in `package.json`.
- If needed, create or export a helper (e.g., `libs/markdown/convert.ts`) to encapsulate Markdown → HTML conversion.

### 3. Convert Initial Content Before TipTap
- Update `ContentEditor` so `initialContent` is normalized:
  - Detect if the value already contains block-level HTML to avoid reprocessing.
  - Otherwise, convert Markdown to sanitized HTML via `marked`.
  - Feed the normalized HTML to `useEditor`, ensuring placeholder + character count still function.

### 4. Constrain Layout to a Single Page
- Update `WorkPackagePage` container and `WorkflowTabs` usage so the tab body stretches to the available viewport height (e.g., use `flex`, `min-h-0`, and `h-[calc(100vh-...]`).
- Refactor `EditorScreen`/`ContentEditor` wrappers into a flex column: header + action buttons stay fixed, while the editor surface gets `overflow-y-auto` with a `max-h` tied to `100vh`.
- Ensure padding/margins still match existing design tokens after the layout changes.

---
✅ CHECKPOINT: Steps 1-4 complete (analysis, dependency, formatting, layout). Continue to step 5.
---

### 5. Create E2E Instructions
- Read `.claude/commands/test_e2e.md` and `.claude/commands/e2e/test_basic_query.md`.
- Author `.claude/commands/e2e/test_editor_single_page.md` documenting how to verify Markdown rendering and editor-only scrolling.

### 6. Run Validation Commands & Final Review
- Execute all commands listed in the Validation section.
- Spot-check the editor manually (if possible) or via JSX inspection to confirm layout + formatting expectations.
- Update `specs/single_page_editor_layout/single_page_editor_layout_implementation.log` with progress notes during implementation.

## Validation Commands
- `npm run lint`
- `cat .claude/commands/test_e2e.md`
- `cat .claude/commands/e2e/test_editor_single_page.md`

# Implementation log created at:
# specs/single_page_editor_layout/single_page_editor_layout_implementation.log

## Notes
- Keep the Markdown parser usage minimal (no server-side changes required) and ensure client bundle impact is acceptable.
- Consider memoizing the conversion so rerenders don’t reprocess large documents unnecessarily.

## Research Documentation
- None required currently; reuse existing phase documentation.

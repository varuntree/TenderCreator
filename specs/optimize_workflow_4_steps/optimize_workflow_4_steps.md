# Plan: optimize_workflow_4_steps

## Plan Description
Optimize the document generation workflow from 5 steps to 4 steps by auto-generating win themes when user clicks "Continue to Strategy" and combining the strategy/generation screens. Additionally, fix a bug where regenerated win themes show zero count in the generation screen card.

## User Story
As a tender response writer
I want win themes to auto-generate when I continue to strategy, and see requirements + win themes together
So that I can proceed faster to content generation without extra clicks

## Problem Statement
Current workflow has 5 manual steps:
1. Requirements → Click "Continue to Strategy"
2. Win Themes screen → Click "Generate Win Themes" → Wait → Click "Continue to Generation"
3. Generation screen → Click "Generate Content"
4. Edit screen
5. Export screen

Issues:
- Step 2 requires manual "Generate Win Themes" click (unnecessary friction)
- Steps 2 & 3 are separate screens but have minimal distinct UI value
- Bug: After regenerating win themes, generation screen shows "0 themes" even though themes exist (parent doesn't refresh winThemesCount)

## Solution Statement
**4-step optimized workflow:**
1. **Requirements** → Click "Continue to Strategy" → *Auto-triggers win themes generation in background*
2. **Strategy + Generation (combined)** → Left side: Requirements + Win Themes (editable), Right side: "Generate Content" button
3. **Edit** → TipTap editor
4. **Export** → DOCX download

**Key changes:**
- Auto-invoke win themes generation API when user clicks "Continue to Strategy"
- Show loading state while themes generate
- Combine strategy/generation into single screen with split layout
- Fix zero-count bug by removing stale winThemesCount prop (themes always visible on combined screen)

## Dependencies

### Previous Plans
None - this modifies existing workflow implementation

### External Dependencies
- Existing Gemini AI integration (no changes needed)
- Existing API endpoints: `/api/work-packages/[id]/win-themes` (may need modification)
- Supabase database schema (no changes needed)

## Relevant Files

### Modified Files

**app/(dashboard)/work-packages/[id]/page.tsx**
- Main workflow orchestrator
- Remove "strategy" tab, combine with "generate"
- Update completedSteps logic (remove strategy step check)
- Remove winThemesCount prop calculation (not needed in combined view)
- Auto-invoke win themes generation when transitioning to combined screen

**components/workflow-steps/workflow-tabs.tsx**
- Update tabs from 5 to 4: requirements → strategy (rename to "Strategy & Generate") → edit → export
- Update completion badges logic (remove separate strategy check)
- Update tab indices

**components/workflow-steps/strategy-screen.tsx**
- Rename to `strategy-generation-screen.tsx`
- Major refactor: split layout with Requirements + Win Themes on left, Generation on right
- Auto-generate win themes on mount if not exist
- Show loading skeleton while generating themes
- Show win themes list (editable) once generated
- Show requirements list
- Right side: "Generate Content" button (disabled until themes exist)

**components/workflow-steps/generation-screen.tsx**
- Delete this file (merged into strategy-generation-screen.tsx)

**components/workflow-steps/requirements-view.tsx**
- Update button text "Continue to Strategy" → "Continue to Strategy & Generate" (or just "Continue")
- No other changes needed

**libs/repositories/work-package-content.ts**
- Ensure `saveWinThemes()` creates content record if doesn't exist (fix for potential bug)
- Add error handling for concurrent theme generation

### New Files

**.claude/commands/e2e/test_optimize_workflow_4_steps.md**
- E2E test validating:
  - Requirements → Continue button triggers auto win themes generation
  - Combined screen shows requirements + win themes + generation button
  - Generate content works from combined screen
  - Full 4-step workflow completion
  - Regeneration doesn't show zero themes bug

## Acceptance Criteria

1. ✅ Workflow has 4 tabs: Requirements → Strategy & Generate → Edit → Export
2. ✅ Clicking "Continue to Strategy" from Requirements auto-generates win themes (no separate button click)
3. ✅ Combined Strategy & Generate screen shows:
   - Left side: Requirements list (read-only) + Win Themes list (editable)
   - Right side: "Generate Content" button (enabled when themes exist)
4. ✅ Loading state during auto win themes generation (skeleton/spinner)
5. ✅ Win themes can be edited/deleted/added manually in combined screen
6. ✅ "Generate Content" button works from combined screen
7. ✅ After content generation, auto-navigates to Edit screen
8. ✅ Zero themes bug is fixed (no stale count display)
9. ✅ Can regenerate win themes and see updated count immediately
10. ✅ All existing workflow features work (edit, export, status updates)
11. ✅ E2E test passes validating full 4-step workflow

## Step by Step Tasks

**EXECUTION RULES:**
- Execute ALL steps below in exact order
- Check Acceptance Criteria - all items are REQUIRED
- Do NOT skip UI/frontend steps if in acceptance criteria
- If blocked, document and continue other steps

### 1. Update Workflow Tabs Configuration

- Open `components/workflow-steps/workflow-tabs.tsx`
- Change tabs array from 5 tabs to 4 tabs:
  - `requirements` (unchanged)
  - `strategy` (rename label to "Strategy & Generate")
  - `edit` (unchanged)
  - `export` (unchanged)
- Remove the old separate `generate` tab
- Update tab value types: `'requirements' | 'strategy' | 'edit' | 'export'`
- Update completion check logic:
  - Remove separate strategy completion check
  - `strategy` tab complete if `content.content` exists (not just themes)
- Update lock/unlock logic (strategy unlocked if requirements complete)
- Test: Tab navigation works with 4 tabs

### 2. Create Combined Strategy & Generation Screen Component

- Rename `components/workflow-steps/strategy-screen.tsx` → `components/workflow-steps/strategy-generation-screen.tsx`
- Major refactor to split-layout design:
  - **Left Panel (40% width):**
    - Section 1: Requirements list (read-only, from `workPackage.requirements`)
    - Section 2: Win Themes list (editable, with add/edit/delete)
  - **Right Panel (60% width):**
    - Card showing generation readiness status
    - Win themes count display
    - Requirements count display
    - "Generate Content" button (calls existing generate-content API)
- Add auto-generation logic on mount:
  - Check if `content.win_themes` exists and `length > 0`
  - If not, auto-call POST `/api/work-packages/{id}/win-themes`
  - Show loading skeleton during generation
  - On success, update local state with themes
  - On error, show error message + manual retry button
- Keep existing theme edit/delete/add functionality
- Update "Continue" button behavior:
  - Disabled if `content.content` doesn't exist (must generate first)
  - Enabled after content generation
  - Navigates to `edit` tab (not `generate`)
- Remove "Back to Requirements" button (use tabs for navigation)
- Props interface:
  ```typescript
  {
    workPackageId: string
    workPackage: WorkPackage
    initialContent: WorkPackageContent | null
    onContinue: () => void
  }
  ```

### 3. Delete Old Generation Screen Component

- Delete `components/workflow-steps/generation-screen.tsx` (logic merged into combined screen)
- Verify no imports reference this file (check with grep)

### 4. Update Main Work Package Page

- Open `app/(dashboard)/work-packages/[id]/page.tsx`
- Update tab type: `'requirements' | 'strategy' | 'edit' | 'export'` (remove 'generate')
- Update `completedSteps` calculation:
  - Remove separate checks for `strategy` and `generate`
  - `strategy` complete if `content.content` exists (combined step)
- Remove `winThemesCount` calculation (not needed, themes visible in combined screen)
- Update currentTab logic in `loadData()`:
  - If no themes and no content → `strategy` tab
  - If themes but no content → `strategy` tab (combined screen handles this)
  - If content exists → `edit` tab
  - If exported → `export` tab
- Update screen rendering logic:
  - Replace separate `<StrategyScreen>` and `<GenerationScreen>` cases
  - Single case for `strategy` tab renders `<StrategyGenerationScreen>`
- Remove props: `winThemesCount` (not passed to combined screen)
- Add refresh callback for combined screen to refetch data after generation

### 5. Update Requirements View Button Text

- Open `components/workflow-steps/requirements-view.tsx`
- Change button text: "Continue to Strategy" → "Continue" (simpler, since next tab name is long)
- Optionally update button description text to mention "Generate strategy and content"
- No logic changes needed (just cosmetic)

---
✅ CHECKPOINT: Steps 1-5 complete (Frontend refactor). Continue to step 6.
---

### 6. Update API Response Handling (Optional Enhancement)

- Open `app/api/work-packages/[id]/win-themes/route.ts`
- Ensure response includes full `WorkPackageContent` object (not just themes array)
- Verify error handling for concurrent generation requests
- Add logging for debugging

### 7. Fix Work Package Content Repository

- Open `libs/repositories/work-package-content.ts`
- Update `saveWinThemes()` function:
  - Always ensure content record exists before updating
  - If no record exists, create with `win_themes` array
  - Handle race conditions (use upsert pattern)
  - Return full `WorkPackageContent` object
- Add error handling for missing work package ID

### 8. Create E2E Test File

- Read `.claude/commands/test_e2e.md` to understand E2E test format
- Read `.claude/commands/e2e/test_basic_query.md` as reference example
- Create `.claude/commands/e2e/test_optimize_workflow_4_steps.md` with workflow:
  1. Sign in as test@tendercreator.dev
  2. Navigate to existing project with work package
  3. Open work package → verify 4 tabs visible
  4. Click "Continue" from Requirements
  5. Verify auto win themes generation (loading state → themes appear)
  6. Verify combined screen layout (left: requirements + themes, right: generate button)
  7. Edit a win theme, add a new theme
  8. Click "Generate Content"
  9. Verify content generation success, auto-navigate to Edit tab
  10. Verify content in editor
  11. Navigate back to Strategy & Generate tab
  12. Verify win themes still visible (no zero count)
  13. Take screenshots at key steps
- Include validation for zero-count bug fix

### 9. Update TypeScript Types

- Check `types/database.ts` or relevant type files
- Update tab type definitions if exported
- Update any interfaces referencing 5-step workflow
- Ensure `WorkPackageContent` type includes `win_themes` as required field

### 10. Test Edge Cases

- Test workflow with existing work packages (already have themes)
- Test workflow starting fresh (no themes)
- Test concurrent theme generation (multiple tabs open)
- Test API failure handling (network error, AI timeout)
- Test navigation between tabs (ensure state persists)
- Test theme editing during generation loading state
- Test generate content button disabled state

---
✅ CHECKPOINT: Steps 6-10 complete (Backend fixes + testing). Continue to step 11.
---

### 11. Run Validation Commands

- Execute all commands in "Validation Commands" section below
- Fix any TypeScript errors
- Fix any build errors
- Fix any runtime errors
- Verify E2E test passes
- Verify zero regressions in existing features

## Testing Strategy

### Unit Tests
- Combined strategy-generation screen component:
  - Auto-generates themes on mount if missing
  - Shows loading state during generation
  - Displays requirements and themes correctly
  - Edit/delete/add theme functionality works
  - Generate content button enabled/disabled logic
- API error handling (theme generation failure)
- Race condition handling (concurrent requests)

### Edge Cases
- Work package with no content record (creates new)
- Work package with themes but no content (shows themes, allows generation)
- Work package with content but no themes (shouldn't happen, but handle gracefully)
- Theme generation API timeout (show error, retry option)
- User navigates away during theme generation (cancel request)
- Concurrent theme generation requests (debounce/lock)
- Empty requirements list (edge case, but should still work)
- Very long theme text (UI overflow handling)

## Validation Commands

Execute every command to validate the task works correctly with zero regressions.

```bash
# Check for TypeScript errors
npm run type-check

# Build the application
npm run build

# Run dev server and manually test workflow
npm run dev
# Open browser to http://localhost:3000
# Navigate to a work package
# Test full 4-step workflow
# Verify auto-generation
# Verify combined screen layout
# Verify zero-count bug is fixed

# Run E2E test
# Read .claude/commands/test_e2e.md for setup instructions
# Execute .claude/commands/e2e/test_optimize_workflow_4_steps.md
```

**E2E Testing Strategy:**
- Use pre-configured test credentials from test_e2e.md (DO NOT create new users)
- Reference absolute paths for test fixtures in test_fixtures/
- Sign in via email/password: test@tendercreator.dev / TestPass123!
- Detailed E2E test workflow documented in `.claude/commands/e2e/test_optimize_workflow_4_steps.md`

# Implementation log created at:
# specs/optimize_workflow_4_steps/optimize_workflow_4_steps_implementation.log

## Notes

### Design Considerations

**Why combine strategy + generation screens?**
- Both screens have minimal UI (just buttons + lists)
- Reduces clicks from 5 steps to 4 steps
- Logical grouping: "Plan what to write" → "Write it" → "Edit it" → "Export it"
- Requirements + win themes inform generation (makes sense to see together)

**Why auto-generate on "Continue"?**
- Win themes generation is non-negotiable (required for content generation)
- No reason to force manual button click
- User intent is clear: clicking "Continue" means "proceed with workflow"
- Still allows manual editing after auto-generation

**Zero-count bug root cause:**
- `winThemesCount` prop calculated once on page load
- When themes regenerated, strategy-screen updates local state but parent doesn't refresh
- Passing static count creates stale data
- **Fix:** Remove prop, show themes directly in combined screen (always fresh)

### Migration Path

**Existing work packages:**
- Some may be on "strategy" tab with themes generated
- Some may be on "generate" tab with themes but no content
- Solution: Both map to new "strategy" tab (combined screen handles all states)
- No data migration needed (just UI routing)

### Future Enhancements (Out of Scope)
- Streaming theme generation (show themes as they appear)
- Suggested themes based on similar projects
- Theme templates/library
- Cross-document theme consistency
- Theme quality scoring (AI feedback)

## Research Documentation
None - used existing Explore agent findings from codebase analysis

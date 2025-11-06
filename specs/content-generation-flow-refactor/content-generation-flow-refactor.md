# Plan: Content Generation Flow Refactor

## Plan Description
Refactor content generation workflow: remove redundant requirements step, make bid/no-bid analysis dynamic instead of hardcoded, fix navigation issues preventing users from returning to previous steps, move "Generate Content" button to only Win Strategy tab, and ensure bulk and individual document generation flows remain functional.

## User Story
As a tender response team member
I want to streamline the content generation workflow and access dynamic bid/no-bid analysis
So that I can efficiently generate documents without redundant steps and make informed bidding decisions based on real AI analysis

## Problem Statement
Current content generation workflow has critical UX and functionality issues:
1. **Redundant step**: Step 1 "Requirements" duplicates content already in Strategy tab, forcing unnecessary navigation
2. **Hardcoded bid data**: Bid/No-Bid tab shows mock data (Atomic Technology Services example, fixed scores) instead of real AI analysis
3. **Navigation lock**: Users cannot navigate back to earlier steps after content generation completes
4. **UI confusion**: "Generate Content" button appears on all 3 tabs in Strategy step instead of only Win Strategy tab
5. **Missing loader**: No smooth transition from clicking "Generate" to showing content

## Solution Statement
1. Remove Step 1 (Requirements) from 4-step workflow → new 3-step flow: Strategy → Edit → Export
2. When user clicks "Generate" for document, show ProcessLoaderOverlay immediately, skip to Strategy tab's Win Strategy section
3. Implement real bid/no-bid AI analysis (replace getMockBidRecommendation, getMockAssessmentCriteria)
4. Move "Generate Content" card to only appear in Win Strategy tab
5. Fix navigation: allow users to return to Strategy/Edit steps after generation, remove condensed mode hiding
6. Ensure both generation flows work: individual document generation + bulk generate all

## Dependencies

### Previous Plans
- None - this refactors existing implemented functionality

### External Dependencies
- Gemini 2.0 Flash API (already integrated)
- Existing ProcessLoaderOverlay component
- Existing bulk-generation.ts utility

## Relevant Files

### Core Workflow Components
- **`components/workflow-steps/workflow-tabs.tsx`** (101 lines) - Orchestrates tab flow, defines 4 steps, implements condensed mode logic. Will update to 3 steps, remove condensed mode.
- **`components/workflow-steps/step-progress-indicator.tsx`** (65 lines) - Visual progress indicator. Will update step labels/ordering.
- **`app/(dashboard)/work-packages/[id]/page.tsx`** (152 lines) - Main page orchestrator, controls tab state, determines completed steps. Will update tab logic for 3 steps, fix navigation.

### Strategy Step Components
- **`components/workflow-steps/strategy-generation-screen.tsx`** (393 lines) - Strategy screen with 3 tabs (Requirements, Bid/No-Bid, Win Strategy), handles theme generation + content generation. Will move "Generate Content" card to Win Strategy tab only, integrate bid analysis.
- **`components/workflow-steps/bid-recommendation-card.tsx`** (171 lines) - Displays bid recommendation. Currently uses getMockBidRecommendation(). Will integrate real AI analysis.
- **`components/workflow-steps/assessment-parameters-table.tsx`** (192 lines) - Shows assessment criteria table. Currently uses getMockAssessmentCriteria(). Will integrate real AI analysis.

### Other Steps (Reference Only)
- **`components/workflow-steps/requirements-view.tsx`** - Will be removed/archived
- **`components/workflow-steps/editor-screen.tsx`** - No changes needed
- **`components/workflow-steps/export-screen.tsx`** - No changes needed

### Loader & Utilities
- **`components/process-loader-overlay.tsx`** (202 lines) - Animated loader used during uploads/analysis. Will reuse for generation transition.
- **`libs/utils/bulk-generation.ts`** (305 lines) - Bulk generation utility (implemented but not in UI). Will verify compatibility with changes.

### AI & API
- **`libs/ai/content-generation.ts`** - Content generation logic. Will review for bid analysis integration.
- **`app/api/work-packages/[id]/generate-content/route.ts`** - Generation API endpoint. May need updates.
- **`app/api/work-packages/[id]/win-themes/route.ts`** - Win themes API. Reference for bid analysis.

### New Files
- **`app/api/work-packages/[id]/bid-analysis/route.ts`** - NEW API endpoint for bid/no-bid analysis
- **`libs/ai/bid-analysis.ts`** - NEW AI utility for bid decision analysis
- **`.claude/commands/e2e/test_content_generation_flow.md`** - NEW E2E test file

## Acceptance Criteria

1. **3-step workflow implemented**: Users see Strategy → Edit → Export (no Requirements step)
2. **Smooth generation transition**: Clicking "Generate" on document shows ProcessLoaderOverlay with relevant steps, then navigates to Strategy tab's Win Strategy section
3. **Requirements accessible in Strategy**: Requirements tab in Strategy step shows all document requirements (no loss of functionality)
4. **Bid/No-Bid analysis is dynamic**: Assessment table and recommendation show real AI-generated data based on project/organization context, not hardcoded mock data
5. **Generate button location correct**: "Generate Content" card only appears on Win Strategy tab, not on Requirements or Bid/No-Bid tabs
6. **Navigation works**: Users can navigate back to Strategy and Edit tabs after content generation, no condensed mode hiding steps
7. **Progress indicator accurate**: Step progress shows 3 steps with correct labels
8. **Bulk generation compatible**: Existing bulk generation utility works with 3-step flow
9. **Individual generation works**: Single document generation flow works end-to-end
10. **Zero regressions**: Export, editing, theme generation continue to work as before

## Step by Step Tasks

**EXECUTION RULES:**
- Execute ALL steps below in exact order
- Check Acceptance Criteria - all items are REQUIRED
- Do NOT skip UI/frontend steps if in acceptance criteria
- If blocked, document and continue other steps

### 1. Create Bid Analysis AI Implementation

Create AI utility to generate real bid/no-bid recommendations:

- Create `libs/ai/bid-analysis.ts`
- Implement `generateBidAnalysis()` function
  - Input: project context, work package, organization docs, RFT docs, requirements
  - Use Gemini 2.0 Flash with structured prompt
  - Analyze 6 criteria: Customer Relationship, Strategic Alignment, Competitive Positioning, Solution Capability, Resource Availability, Profitability Potential
  - Return structured data: scores (0-5 per criterion), weights, total score, recommendation (bid/no-bid), strengths, concerns
- Implement error handling with retries
- Use similar context assembly pattern as content-generation.ts

### 2. Create Bid Analysis API Endpoint

Create API route to generate bid analysis:

- Create `app/api/work-packages/[id]/bid-analysis/route.ts`
- POST endpoint that calls `generateBidAnalysis()`
- Fetch project, organization docs, RFT docs, work package
- Return JSON: `{ success: true, analysis: { criteria, totalScore, recommendation, strengths, concerns } }`
- Handle errors, rate limits (same pattern as win-themes route)
- Store analysis in work_package_content table (add `bid_analysis` JSONB column)

### 3. Update Database Schema for Bid Analysis

Add column to store bid analysis:

- Create migration to add `bid_analysis` JSONB column to `work_package_content` table
- Update WorkPackageContent type in `libs/repositories/work-package-content.ts`
- Add TypeScript interface for BidAnalysis structure

### 4. Update Strategy Screen to Integrate Real Bid Analysis

Replace hardcoded bid data with dynamic analysis:

- In `strategy-generation-screen.tsx`:
  - Add state for `bidAnalysis` and `isGeneratingBidAnalysis`
  - Auto-generate bid analysis on mount (similar to win themes auto-generation)
  - Create `handleGenerateBidAnalysis()` function to call API
  - Pass real data to AssessmentParametersTable and BidRecommendationCard (remove getMock functions)
  - Add regenerate button functionality
  - Show loading state while generating

### 5. Move Generate Content Card to Win Strategy Tab Only

Fix UI so generate button only appears on Win Strategy tab:

- In `strategy-generation-screen.tsx`:
  - Move "Content Generation Card" (lines 318-389) inside `<TabsContent value="win-strategy">`
  - Ensure card is NOT rendered in Requirements or Bid/No-Bid tabs
  - Keep all existing functionality (button disabled state, loading state, continue button)

### 6. Update Workflow to 3 Steps (Remove Requirements Step)

Remove Requirements as standalone step:

- In `workflow-tabs.tsx`:
  - Update `stepOrder` array: remove 'requirements', keep ['strategy', 'edit', 'export']
  - Update `stepContent` record:
    - strategy: order 1, title "Strategy & Planning", description "Review requirements, assess bid decision, develop win strategy"
    - edit: order 2, title "Editor", description "Refine generated content with AI assistance"
    - export: order 3, title "Export", description "Download submission-ready files"
  - Remove condensed mode logic (lines 71-77, 86-93) - always show all steps
  - Update type definitions

- In `step-progress-indicator.tsx`:
  - Update WorkflowStepKey type to only include 'strategy' | 'edit' | 'export'

- In `app/(dashboard)/work-packages/[id]/page.tsx`:
  - Remove `<TabsContent value="requirements">` block
  - Update `getCompletedSteps()` logic:
    - Always mark 'strategy' complete if win themes OR content exists
    - Mark 'edit' complete if content exists
    - Mark 'export' complete if status is 'completed'
  - Update initial tab determination: start at 'strategy' instead of 'requirements'
  - Remove RequirementsView import

---
✅ CHECKPOINT: Steps 1-6 complete (Backend + 3-step workflow). Continue to step 7.
---

### 7. Add ProcessLoaderOverlay for Generation Transition

Show smooth loader when user clicks "Generate" on document card:

- In document card/table where "Generate" button exists for individual documents:
  - Import ProcessLoaderOverlay component
  - Add state: `isGenerating`, `generationStep`
  - When user clicks "Generate" button:
    - Show ProcessLoaderOverlay with steps:
      1. "Analyzing requirements"
      2. "Developing win strategy"
      3. "Preparing workspace"
    - Navigate to `/work-packages/[id]` route with query param `?tab=strategy`
  - Auto-advance steps every 2.4s (or use actual progress if available)
  - On completion, redirect to work package page at Strategy tab

### 8. Handle Initial Load with Loader State

Ensure when user navigates to work package from document list with loader, they land on Strategy → Win Strategy tab:

- In `app/(dashboard)/work-packages/[id]/page.tsx`:
  - Check for `?tab=strategy` query param or fresh load
  - If content doesn't exist yet (fresh generation), default to 'strategy' tab
  - Update StrategyGenerationScreen to default to "win-strategy" sub-tab when opened fresh
  - In `strategy-generation-screen.tsx`, update `<Tabs defaultValue="win-strategy">` instead of "bid-decision"

### 9. Fix Navigation - Allow Backward Navigation

Remove restrictions preventing users from going back:

- In `workflow-tabs.tsx`:
  - Remove condensed mode (already done in step 6)
  - Ensure users can click on previous step indicators to navigate back

- In `app/(dashboard)/work-packages/[id]/page.tsx`:
  - Update tab change handler to allow navigation to any completed step
  - Users should be able to go: Export → Edit → Strategy at any time

- Test clicking step indicators to confirm backward navigation works

### 10. Update Bulk Generation Flow Compatibility

Ensure bulk generation works with 3-step flow:

- Review `libs/utils/bulk-generation.ts`:
  - Verify it generates win themes + content (no requirements step dependency)
  - Ensure it doesn't reference removed step
  - Test with 3-step workflow

- If bulk UI exists (work package table "Generate All" button):
  - Update to show ProcessLoaderOverlay during bulk generation
  - Ensure each document navigates to 3-step workflow when opened

### 11. Archive Requirements View Component

Since Requirements tab still exists in Strategy step, just remove standalone step:

- Move `components/workflow-steps/requirements-view.tsx` to `components/workflow-steps/archive/` folder
- Document why it was archived in a comment at top of file

### 12. Create E2E Test File

Create comprehensive E2E test to validate new flow:

- Read `.claude/commands/test_e2e.md` and `.claude/commands/e2e/test_basic_query.md` for format
- Create `.claude/commands/e2e/test_content_generation_flow.md`
- Test workflow:
  1. Sign in with test@tendercreator.dev / TestPass123!
  2. Navigate to test project
  3. Click "Generate" on a work package
  4. Verify ProcessLoaderOverlay appears
  5. Verify navigation to Strategy tab → Win Strategy sub-tab
  6. Verify win themes auto-generate
  7. Verify bid analysis auto-generates (not hardcoded)
  8. Verify "Generate Content" button only on Win Strategy tab
  9. Click Generate Content
  10. Verify navigation to Edit tab
  11. Navigate back to Strategy tab (test backward navigation)
  12. Navigate to Export tab
  13. Navigate back to Edit (test backward navigation)
  14. Verify all 3 steps visible in progress indicator
  15. Take screenshots at each step

---
✅ CHECKPOINT: Steps 7-12 complete (UX improvements + testing). Continue to step 13.
---

### 13. Run Validation Commands

Execute all validation commands to ensure zero regressions:

- Run TypeScript compilation: `npm run type-check` (or `tsc --noEmit`)
- Run linter: `npm run lint`
- Run build: `npm run build`
- Start dev server: `npm run dev`
- Manual testing:
  - Test individual document generation flow
  - Test bulk generation (if UI exists)
  - Test backward navigation in workflow
  - Test bid analysis generation
  - Verify no hardcoded data in bid/no-bid tab
  - Test export functionality
- Execute E2E test created in step 12

## Testing Strategy

### Unit Tests
- Test `generateBidAnalysis()` with mock Gemini responses
- Test bid analysis API route with various inputs
- Test workflow tab logic with 3 steps
- Test completed steps calculation

### Edge Cases
- Bid analysis generation failure → retry, then show error
- User navigates away during generation → state cleanup
- No organization docs available → analysis still works with only RFT context
- User clicks Generate before win themes complete → button disabled
- User navigates backward from Export → can edit and re-export
- Bulk generation with mix of completed/pending documents

## Validation Commands

Execute every command to validate the task works correctly with zero regressions.

```bash
# Type checking
npm run type-check

# Linting
npm run lint

# Build production
npm run build

# Start dev server for manual testing
npm run dev
```

### Manual Testing Checklist
1. Create new project with RFT documents
2. Navigate to project, click "Analyze" to generate work packages
3. Click "Generate" on one work package from list
   - ✅ ProcessLoaderOverlay appears
   - ✅ Redirects to Strategy tab
4. Verify Strategy step:
   - ✅ 3 tabs visible: Requirements, Bid/No-Bid, Win Strategy
   - ✅ Win themes auto-generate
   - ✅ Bid analysis auto-generates (check for NO "Atomic Technology Services" hardcoded text)
   - ✅ Assessment table shows dynamic scores
   - ✅ "Generate Content" card ONLY on Win Strategy tab
5. Click "Generate Content"
   - ✅ Content generates successfully
   - ✅ Auto-navigates to Edit tab
6. Test backward navigation:
   - ✅ Click Strategy in progress indicator → navigates back
   - ✅ All 3 steps visible (no condensed mode)
   - ✅ Click Edit in progress indicator → navigates to Edit
7. Navigate to Export tab
   - ✅ Export functionality works
   - ✅ Can navigate back to Edit or Strategy
8. Progress indicator shows: "1. Strategy & Planning", "2. Editor", "3. Export"

### E2E Testing
Read `.claude/commands/test_e2e.md`, then read and execute `.claude/commands/e2e/test_content_generation_flow.md` test file to validate this functionality works.

**E2E Testing Strategy:**
- Use pre-configured test credentials from test_e2e.md (DO NOT create new users)
- Reference absolute paths for test fixtures in test_fixtures/
- Sign in via email/password: test@tendercreator.dev / TestPass123!
- Detailed test workflow steps in `.claude/commands/e2e/test_content_generation_flow.md`

# Implementation log created at:
# specs/content-generation-flow-refactor/content-generation-flow-refactor_implementation.log

## Notes

### Key Design Decisions
1. **Keep Requirements tab in Strategy step** - Don't delete requirements functionality, just remove redundant standalone step
2. **Reuse ProcessLoaderOverlay** - Already has smooth animations, perfect for generation transition
3. **Auto-generate bid analysis** - Same pattern as win themes (generate on mount)
4. **Store analysis in database** - Add to work_package_content for persistence
5. **6 assessment criteria** - Match existing mock data structure for seamless replacement

### Future Considerations
- Add user ability to manually edit bid analysis scores/weights
- Implement bid analysis version history
- Add bid analysis to bulk generation flow explicitly
- Consider caching bid analysis (expensive AI operation)
- Add bid analysis to project-level (not just work package level)

### Migration Strategy
- Existing work packages with content will show Strategy step as completed (backward compatible)
- No data migration needed - bid analysis generates on demand
- Old 4-step references in code removed safely (no database dependencies)

## Research Documentation
- None - using existing patterns from content-generation.ts and win-themes API

# Plan: Content Generation Workflow Refactor

## Plan Description
Refactor content generation workflow to streamline from 4 steps to 3 steps by removing redundant "Brief & Documents" step, integrate real bid/no-bid AI analysis (replace hardcoded data), restrict "Generate Content" button to only Win Strategy tab, enable backward navigation in workflow, and ensure consistency across both individual and bulk generation flows.

## User Story
As a tender response writer
I want a streamlined 3-step workflow with real AI-generated bid analysis and ability to navigate back
So that I can efficiently manage content generation without redundant steps or navigation restrictions

## Problem Statement
Current implementation has critical UX and data issues:
1. **Step 1 redundancy**: "Brief & Documents" step shows requirements that are duplicated in "Strategy Generated" tab
2. **Hardcoded bid data**: Bid/No-Bid assessment uses `getMockAssessmentCriteria()` and `getMockBidRecommendation()` - not real AI
3. **Generate Content button everywhere**: Button visible across all 3 tabs (requirements, bid-decision, win-strategy) - should only be on win-strategy tab
4. **No backward navigation**: Users can't go back to previous steps after content generation
5. **Multi-step indicator hidden**: Top progress indicator doesn't show first/second steps properly

## Solution Statement
1. **Remove step 1**: Delete "Brief & Documents" (requirements) from 4-step workflow, make "Strategy Generated" the new step 1
2. **Implement real AI bid analysis**: Create API endpoints and prompts for assessment scoring and bid recommendation
3. **Restrict generate button**: Move "Content Generation Card" (lines 318-370 in strategy-generation-screen.tsx) to only render when on win-strategy tab
4. **Enable navigation**: Add click handlers to WorkflowTabs step indicators, add "Back" buttons to all steps
5. **Use ProcessLoaderOverlay**: Show full-screen loader when user clicks "Generate" from project documents list (individual generation)
6. **Ensure consistency**: Both individual and bulk generation flows work identically

## Dependencies
### Previous Plans
- specs/ui-consistency-optimization/ui-consistency-optimization.md - ProcessLoaderOverlay emerald theme updates
- specs/bulk-document-generation/bulk-document-generation.md - Bulk generation logic

### External Dependencies
- Gemini 2.5 Flash API for bid analysis
- ProcessLoaderOverlay component for individual generation
- WorkflowTabs and StepProgressIndicator components

## Relevant Files

### Core Workflow Files
- **app/(dashboard)/work-packages/[id]/page.tsx** - Main workflow page
  - Lines 22-26: Current tab state (`requirements | strategy | edit | export`)
  - Lines 77-86: Completed steps logic
  - Lines 54-59: Auto-navigation based on content state
  - Lines 117, 126, 135-136: Manual navigation handlers
  - **CHANGE**: Remove `requirements` from tab state, update to 3-step flow

- **components/workflow-steps/workflow-tabs.tsx** - Tab navigation UI
  - Lines 20-43: Step definitions (4 steps currently)
  - Lines 56-69: Status computation logic
  - Lines 80-99: Tabs component with `onTabChange`
  - **CHANGE**: Remove "requirements" step, update to 3 steps, add click handlers for navigation

- **components/workflow-steps/step-progress-indicator.tsx** - Top multi-step indicator
  - Lines 22-64: Progress rendering logic
  - **CHANGE**: Update to show 3 steps, fix visibility issue

- **components/workflow-steps/strategy-generation-screen.tsx** - Strategy/planning screen
  - Lines 155-316: Three tabs (requirements, bid-decision, win-strategy)
  - Lines 318-370: Content Generation Card (always visible)
  - Lines 124-126: Mock bid data usage
  - **CHANGE**: Remove requirements tab, integrate real bid AI, move generation card to win-strategy only

### Bid Analysis Components (Currently Hardcoded)
- **components/workflow-steps/assessment-parameters-table.tsx** - Assessment criteria table
  - Lines 141-192: `getMockAssessmentCriteria()` - 6 hardcoded criteria
  - **CHANGE**: Create real AI endpoint to generate scores

- **components/workflow-steps/bid-recommendation-card.tsx** - Bid decision card
  - Lines 150-170: `getMockBidRecommendation()` - hardcoded strengths/concerns
  - **CHANGE**: Create real AI endpoint to analyze bid decision

### Project Documents/Bulk Generation
- **components/work-package-table.tsx** - Document list with "Generate" buttons
  - Lines 120-177: Bulk generation handler
  - Lines 190-201: "Generate All" button
  - **CHANGE**: For individual generation, show ProcessLoaderOverlay before navigating to workflow

- **libs/utils/bulk-generation.ts** - Bulk generation logic
  - Lines 216-304: Sequential processing
  - Lines 128-199: Single document generation flow
  - **CHANGE**: Ensure win-themes → content flow consistent

### Loader Component
- **components/process-loader-overlay.tsx** - Full-screen loader overlay
  - Lines 10-36: Emerald theme loader with progress steps
  - **USAGE**: Show when individual document generation triggered from project page

### New Files
#### API Endpoints (to create)
- **app/api/work-packages/[id]/bid-analysis/route.ts** - POST endpoint for bid assessment
  - Generate assessment criteria scores using Gemini
  - Return structured data: `{ criteria: AssessmentCriterion[], totalScore: number }`

- **app/api/work-packages/[id]/bid-recommendation/route.ts** - POST endpoint for bid decision
  - Analyze bid/no-bid using Gemini
  - Return: `{ recommendation: 'bid' | 'no-bid', reasoning: string, strengths: string[], concerns: string[] }`

#### E2E Test File
- **.claude/commands/e2e/test_workflow_refactor.md** - E2E test for new 3-step workflow
  - Test individual generation with loader
  - Test backward navigation
  - Test generate button only on win-strategy tab
  - Test real bid analysis data

## Acceptance Criteria
- [ ] Workflow has 3 steps (not 4): Strategy → Editor → Export
- [ ] "Brief & Documents" step completely removed
- [ ] Requirements tab removed from strategy screen (bid-decision is default tab)
- [ ] Bid/No-Bid assessment uses real AI (not mock data)
- [ ] Assessment criteria scores generated by Gemini
- [ ] Bid recommendation (strengths/concerns) generated by Gemini
- [ ] "Generate Content" button only visible when on win-strategy tab
- [ ] ProcessLoaderOverlay shows when individual doc generation clicked from project page
- [ ] Users can click on workflow step indicators to navigate back
- [ ] "Back" buttons added to all workflow steps
- [ ] Top multi-step indicator shows all 3 steps correctly
- [ ] Bulk generation flow unchanged and working
- [ ] Individual generation flow uses loader → win-themes → content → redirect to editor
- [ ] Zero regressions in existing functionality

## Step by Step Tasks

**EXECUTION RULES:**
- Execute ALL steps below in exact order
- Check Acceptance Criteria - all items are REQUIRED
- Do NOT skip UI/frontend steps if in acceptance criteria
- If blocked, document and continue other steps

### 1. Create E2E Test File for Validation

- Read `.claude/commands/test_e2e.md` to understand E2E test format
- Read `.claude/commands/e2e/test_basic_query.md` as example
- Create `.claude/commands/e2e/test_workflow_refactor.md` with test cases:
  - Navigate to project with analyzed documents
  - Click "Generate" on single document → verify ProcessLoaderOverlay appears
  - Verify redirected to strategy screen (not requirements)
  - Verify bid analysis shows real data (not hardcoded)
  - Click through tabs → verify generate button only on win-strategy
  - Generate content → verify redirected to editor
  - Click back → verify can navigate to previous steps
  - Verify top progress indicator shows 3 steps
  - Test bulk generation still works

### 2. Update Workflow Step Definitions (3 Steps)

**File: `components/workflow-steps/workflow-tabs.tsx`**

- Update `stepOrder` (line 20): Remove `'requirements'`, keep `['strategy', 'edit', 'export']`
- Update `stepContent` object (lines 22-43): Remove `requirements` definition
- Rename `strategy` to better reflect it's now step 1
  - Title: "Strategy & Planning" or "Tender Planning"
  - Description: Update to reflect combined requirements/bid/win-strategy
- Update `edit` step numbering/order
- Update `export` step numbering/order
- Add click handlers to step indicators for navigation:
  ```typescript
  const handleStepClick = (key: WorkflowStepKey) => {
    if (completedSet.has(key) || key === currentTab) {
      onTabChange(key)
    }
  }
  ```
- Update rendering to make completed steps clickable

**File: `components/workflow-steps/step-progress-indicator.tsx`**

- Update to render 3 steps instead of 4
- Fix visibility logic (lines 71-77 condensing feature)
- Ensure all steps visible on load

### 3. Update Main Workflow Page (3-Step State)

**File: `app/(dashboard)/work-packages/[id]/page.tsx`**

- Update tab state type (line 22): `'strategy' | 'edit' | 'export'` (remove `requirements`)
- Update `getCompletedSteps()` (lines 77-86): Remove requirements logic
- Update auto-navigation (lines 54-59): Start at `strategy` if no content, else `edit`
- Remove requirements-related navigation handlers
- Add "Back" button handlers for all steps:
  - Editor: Back to `strategy`
  - Export: Back to `edit`
- Update strategy screen props: Remove any requirements-specific props

### 4. Refactor Strategy Generation Screen (Remove Requirements Tab)

**File: `components/workflow-steps/strategy-generation-screen.tsx`**

- Remove `requirements` tab from Tabs component (lines 157-160, 172-210)
- Update TabsList to 2 columns: `grid-cols-2` (line 156)
- Set default tab to `bid-decision` (line 155)
- Move "Content Generation Card" (lines 318-370) to ONLY render when current tab is `win-strategy`:
  ```typescript
  {currentActiveTab === 'win-strategy' && (
    <Card className="border-2 border-primary/20">
      {/* Content Generation Card */}
    </Card>
  )}
  ```
- Add local tab state to track which tab is active:
  ```typescript
  const [currentActiveTab, setCurrentActiveTab] = useState<'bid-decision' | 'win-strategy'>('bid-decision')
  ```
- Update Tabs component: `value={currentActiveTab} onValueChange={setCurrentActiveTab}`

---
✅ CHECKPOINT: Steps 1-4 complete (Workflow structure refactored to 3 steps). Continue to step 5.
---

### 5. Create Bid Analysis API Endpoint

**File: `app/api/work-packages/[id]/bid-analysis/route.ts`** (NEW)

- Create POST handler
- Fetch work package, requirements, project context, org docs, RFT docs
- Build Gemini prompt:
  ```
  You are analyzing a tender opportunity for bid/no-bid decision.

  Project: [project name]
  Client: [client name]
  Document Type: [work package type]

  Requirements:
  [List all mandatory and optional requirements]

  Organization Capabilities:
  [Concatenated org docs - case studies, certifications, etc.]

  RFT Context:
  [Concatenated RFT docs]

  Task: Score the following 6 assessment criteria on a scale of 0-5:

  1. Customer Relationship (Weight: 16.7%)
     - Existing relationship, past performance, access to decision makers

  2. Strategic Alignment (Weight: 16.7%)
     - Alignment with business strategy, market priorities, growth objectives

  3. Competitive Positioning (Weight: 16.7%)
     - Competitive landscape, differentiating strengths, prime vs sub positioning

  4. Solution Capability (Weight: 16.7%)
     - Requirements coverage, expertise availability, similar experience

  5. Resource Availability (Weight: 16.7%)
     - Staff availability, project size fit, external resource needs

  6. Profitability Potential (Weight: 16.7%)
     - Profit margin expectations, payment terms, future opportunities

  For each criterion, provide:
  - score (0-5, can be decimal like 2.5)
  - brief reasoning (1 sentence)

  Also provide incumbentStatus: 'unknown' | 'known' | 'we-are'

  Output as JSON:
  {
    "incumbentStatus": "...",
    "criteria": [
      {
        "name": "Customer Relationship",
        "description": "...",
        "score": 2.5,
        "reasoning": "..."
      },
      ...
    ]
  }
  ```
- Parse Gemini response
- Calculate weighted scores and total score (0-100%)
- Return structured data matching `AssessmentCriterion[]` interface
- Store in database if needed (optional for MVP)
- Error handling with retry logic

### 6. Create Bid Recommendation API Endpoint

**File: `app/api/work-packages/[id]/bid-recommendation/route.ts`** (NEW)

- Create POST handler
- Fetch work package, assessment scores from step 5, project context, org docs, RFT docs
- Build Gemini prompt:
  ```
  You are providing a bid/no-bid recommendation for a tender opportunity.

  Context:
  - Project: [project name]
  - Client: [client name]
  - Document Type: [work package type]
  - Total Assessment Score: [score from bid-analysis]%

  Assessment Breakdown:
  [List each criterion with score and reasoning]

  Requirements:
  [List all requirements]

  Organization Capabilities:
  [Org docs]

  RFT Context:
  [RFT docs]

  Task: Based on the assessment, provide:
  1. Recommendation: 'bid' or 'no-bid'
     - Generally recommend 'bid' if total score > 60%
     - Consider mandatory requirement gaps as critical

  2. Reasoning: 1-2 sentence overall justification

  3. Key Strengths: 3-5 bullet points highlighting competitive advantages
     - Use org docs to cite specific capabilities/experience
     - Reference high-scoring assessment areas

  4. Key Concerns: 2-4 bullet points highlighting risks/gaps
     - Identify requirement coverage gaps
     - Note low-scoring assessment areas
     - Flag compliance or capability issues

  Output as JSON:
  {
    "recommendation": "bid" | "no-bid",
    "reasoning": "...",
    "strengths": ["...", "...", ...],
    "concerns": ["...", "...", ...]
  }
  ```
- Parse Gemini response
- Return structured data matching bid recommendation interface
- Store in work_package_content if needed
- Error handling

### 7. Integrate Real AI Data in Strategy Screen

**File: `components/workflow-steps/strategy-generation-screen.tsx`**

- Remove mock data imports (lines 14-16, 19-20)
- Add state for bid analysis data:
  ```typescript
  const [assessmentCriteria, setAssessmentCriteria] = useState<AssessmentCriterion[]>([])
  const [totalScore, setTotalScore] = useState(0)
  const [incumbentStatus, setIncumbentStatus] = useState('unknown')
  const [bidRecommendation, setBidRecommendation] = useState<any>(null)
  const [isLoadingBidData, setIsLoadingBidData] = useState(false)
  ```
- Add `useEffect` to auto-generate bid data on mount (similar to win themes):
  ```typescript
  useEffect(() => {
    if (assessmentCriteria.length === 0 && !isLoadingBidData) {
      generateBidAnalysis()
    }
  }, [])
  ```
- Create `generateBidAnalysis` function:
  - Fetch from `/api/work-packages/${workPackageId}/bid-analysis`
  - Set assessment criteria, total score, incumbent status
  - Then fetch from `/api/work-packages/${workPackageId}/bid-recommendation`
  - Set bid recommendation data
- Update AssessmentParametersTable props to use real data (line 215-219)
- Update BidRecommendationCard props to use real data (line 222-227)
- Add loading states for bid-decision tab while generating
- Add "Regenerate" button functionality for bid analysis

### 8. Add Navigation: Clickable Step Indicators

**File: `components/workflow-steps/workflow-tabs.tsx`**

- Identify where steps are rendered (likely using StepProgressIndicator)
- Add `onClick` handlers to completed and current steps:
  ```typescript
  <div
    onClick={() => handleStepClick(stepKey)}
    className={cn(
      "cursor-pointer", // add if completed or current
      !completedSet.has(stepKey) && stepKey !== currentTab && "cursor-not-allowed"
    )}
  >
    {/* Step indicator content */}
  </div>
  ```
- Update `handleStepClick` to call `onTabChange(stepKey)` if allowed
- Add hover states to clickable steps

**File: `components/workflow-steps/step-progress-indicator.tsx`**

- Add `onStepClick` prop
- Make step indicators clickable for completed/current steps
- Add visual feedback (hover effect)

**File: `app/(dashboard)/work-packages/[id]/page.tsx`**

- Pass `onStepClick` handler to WorkflowTabs/StepProgressIndicator
- Handler should update `currentTab` state

### 9. Add "Back" Buttons to All Steps

**File: `components/workflow-steps/strategy-generation-screen.tsx`**

- Add "Back" button in header or footer (currently no back - this is step 1 now)
- For navigation: Can't go back from strategy (it's step 1)

**File: `components/workflow-steps/editor-screen.tsx`**

- Verify "Back" button exists (lines 40-44)
- Ensure it navigates to `strategy` (not `requirements`)

**File: `components/workflow-steps/export-screen.tsx`**

- Add "Back" button if missing
- Should navigate to `edit`

**File: `app/(dashboard)/work-packages/[id]/page.tsx`**

- Update back handlers:
  - Edit screen: `onBack={() => setCurrentTab('strategy')}`
  - Export screen: `onBack={() => setCurrentTab('edit')}`

### 10. Individual Generation: Show ProcessLoaderOverlay

**File: `components/work-package-table.tsx`**

- Find individual "Generate" button click handler
- Instead of directly calling API, show ProcessLoaderOverlay
- Define loader steps:
  ```typescript
  const generationSteps = [
    { label: 'Analyzing requirements', status: 'active' },
    { label: 'Generating win themes', status: 'pending' },
    { label: 'Creating content', status: 'pending' },
    { label: 'Finalizing document', status: 'pending' },
  ]
  ```
- Show overlay with progress
- Call `/api/work-packages/${id}/win-themes` → update step 2
- Call `/api/work-packages/${id}/generate-content` → update step 3-4
- On completion, hide overlay and navigate to `/work-packages/${id}` with `currentTab=edit`
- Handle errors gracefully

**Alternative approach (simpler):**
- Show ProcessLoaderOverlay immediately
- Navigate to `/work-packages/${id}`
- Auto-trigger generation in workflow page
- Loader shows in workflow context

**Recommendation:** Keep current flow simple - bulk uses sequential, individual navigates to workflow page where strategy screen handles generation

### 11. Fix Multi-Step Indicator Visibility

**File: `components/workflow-steps/step-progress-indicator.tsx`**

- Review lines 71-77 (condensing logic)
- Ensure all 3 steps always visible
- Remove or fix condensing that hides steps
- Test on mobile/desktop widths

**File: `app/(dashboard)/work-packages/[id]/page.tsx`**

- Verify StepProgressIndicator receives correct `currentStep` and `completedSteps`
- Update for 3-step flow

---
✅ CHECKPOINT: Steps 5-11 complete (Backend AI integration, navigation, UI updates). Continue to step 12.
---

### 12. Update Bulk Generation Flow Consistency

**File: `libs/utils/bulk-generation.ts`**

- Review `generateSingleDocument` function (lines 128-199)
- Ensure it calls:
  1. `/api/work-packages/${id}/win-themes` (already does - line 180)
  2. `/api/work-packages/${id}/generate-content` (already does - line 186)
- **ADD**: Also call new bid analysis endpoints:
  3. `/api/work-packages/${id}/bid-analysis` (before win-themes)
  4. `/api/work-packages/${id}/bid-recommendation` (after bid-analysis)
- Update progress messages to reflect 4 AI operations:
  - "Analyzing bid opportunity..."
  - "Generating win themes..."
  - "Creating content..."
  - "Finalizing document..."
- Ensure error handling for new endpoints
- Test bulk generation with new flow

### 13. Test Individual Generation Flow

**Manual Testing:**
- Navigate to project with analyzed documents
- Click "Generate" on single work package
- Verify redirected to `/work-packages/[id]` at strategy tab (not requirements)
- Verify bid analysis data loads (not mock)
- Verify win themes auto-generate
- Click through tabs → confirm generate button only on win-strategy
- Click "Generate Content" → verify redirects to editor
- Verify top progress shows 3 steps

**Code Review:**
- Ensure individual generation doesn't use ProcessLoaderOverlay (not needed - strategy screen handles loading)
- OR implement if requirement is to show full-screen loader before navigation

### 14. Test Navigation Backward Flow

**Manual Testing:**
- Generate content for a work package
- In editor, click "Back" → verify returns to strategy screen
- Click on "Strategy" step indicator at top → verify navigation works
- Click on "Editor" step indicator → verify can go forward
- Test all navigation combinations

**Code Review:**
- Verify no disabled states preventing backward navigation
- Ensure state persists when navigating back

### 15. Test Bid Analysis AI Quality

**Manual Testing:**
- Generate bid analysis for multiple work packages
- Review assessment scores - should be contextually accurate
- Review bid recommendation - strengths should cite org capabilities
- Concerns should identify real gaps
- Scores should vary based on requirements/capabilities match

**Prompt Tuning:**
- Adjust Gemini prompts if output quality poor
- Add examples in prompt for better structure
- Iterate on scoring logic

### 16. Remove All Mock Data References

**Code Search:**
- Search codebase for `getMockAssessmentCriteria`
- Search for `getMockBidRecommendation`
- Remove functions from component files
- Ensure no imports remain

**Files to clean:**
- `components/workflow-steps/assessment-parameters-table.tsx` (lines 141-192)
- `components/workflow-steps/bid-recommendation-card.tsx` (lines 150-170)
- `components/workflow-steps/strategy-generation-screen.tsx` (lines 124-126)

### 17. Update Types and Interfaces

**File: `libs/repositories/work-package-content.ts`** (or wherever types are)

- Add fields for bid analysis data:
  ```typescript
  bid_analysis?: {
    incumbentStatus: string
    criteria: AssessmentCriterion[]
    totalScore: number
  }
  bid_recommendation?: {
    recommendation: 'bid' | 'no-bid'
    reasoning: string
    strengths: string[]
    concerns: string[]
  }
  ```
- Update database schema if persisting data (optional for MVP)

### 18. Handle Edge Cases

**Empty/Missing Data:**
- If bid analysis fails, show error state with retry button
- If win themes fail, allow manual entry
- If content generation fails, keep user in strategy view

**Loading States:**
- Bid analysis loading in bid-decision tab
- Win themes loading in win-strategy tab
- Content generation loading (existing)

**Error Recovery:**
- Retry logic for all AI endpoints (3 attempts)
- User-friendly error messages
- Don't block workflow on AI failures

### 19. Run Validation Commands

Execute all validation commands in order

## Testing Strategy
### Unit Tests
No new unit tests required - focus on E2E validation

### Edge Cases
- User navigates back after generation → verify state preserved
- User refreshes page mid-workflow → verify correct tab loads
- Bulk generation with AI bid analysis → verify all docs processed
- Individual generation → verify loader and navigation
- Failed bid analysis → verify fallback/retry
- Empty org docs → verify bid analysis still works
- Multiple requirements → verify all considered in scoring
- No requirements → verify bid analysis handles gracefully

## Validation Commands
Execute every command to validate the task works correctly with zero regressions.

```bash
# Build application to check TypeScript errors
npm run build

# Start dev server for manual testing
npm run dev
```

**E2E Test Execution:**
1. Read `.claude/commands/test_e2e.md`
2. Execute `.claude/commands/e2e/test_workflow_refactor.md` test file
3. Sign in with test credentials: test@tendercreator.dev / TestPass123!
4. Follow test workflow step-by-step
5. Capture screenshots at each stage
6. Verify all acceptance criteria met

**Manual Validation Checklist:**

**3-Step Workflow:**
- [ ] Navigate to work package → verify 3 steps shown (Strategy, Editor, Export)
- [ ] Verify no "Brief & Documents" step exists
- [ ] Verify top progress indicator shows 3 steps clearly

**Strategy Screen Tabs:**
- [ ] Open strategy screen → verify 2 tabs (Bid/No Bid, Win Strategy)
- [ ] Verify no Requirements tab
- [ ] Verify Bid/No Bid is default tab

**Real AI Bid Analysis:**
- [ ] Load strategy screen → verify bid analysis auto-generates
- [ ] Check assessment table → verify scores are NOT hardcoded (vary per document)
- [ ] Check bid recommendation → verify strengths cite actual org capabilities
- [ ] Verify concerns identify real requirement gaps
- [ ] Try multiple work packages → verify different scores/recommendations

**Generate Button Restriction:**
- [ ] On Bid/No Bid tab → verify NO "Generate Content" button
- [ ] Switch to Win Strategy tab → verify "Generate Content" button appears
- [ ] Verify button only enabled when win themes exist

**Backward Navigation:**
- [ ] In Editor screen → click "Back" button → verify returns to strategy
- [ ] Click on "Strategy" step indicator → verify navigates back
- [ ] Click on "Editor" step indicator → verify navigates forward
- [ ] In Export screen → click back → verify returns to editor

**Individual Generation Flow:**
- [ ] From project page, click "Generate" on single document
- [ ] Verify redirected to strategy screen (NOT requirements)
- [ ] Verify bid analysis loads
- [ ] Verify win themes generate
- [ ] Switch to win strategy tab → click generate
- [ ] Verify content generates and redirects to editor

**Bulk Generation:**
- [ ] Click "Generate All" on project page
- [ ] Verify all documents process sequentially
- [ ] Verify each gets bid analysis, win themes, content
- [ ] Check multiple generated documents → verify unique bid analysis per doc

**Visual Consistency:**
- [ ] Verify ProcessLoaderOverlay uses emerald theme (not brown)
- [ ] Verify step indicators styled correctly
- [ ] Verify tabs styled consistently
- [ ] Verify loading states use design system colors

**Error Handling:**
- [ ] Disconnect network → trigger bid analysis → verify error shown with retry
- [ ] Retry → verify works
- [ ] Verify workflow doesn't break on AI failures

# Implementation log created at:
# specs/content_generation_workflow_refactor/content_generation_workflow_refactor_implementation.log

## Notes
**Critical Implementation Details:**

1. **"Generate Content" button location**: Must ONLY show when user is on "Win Strategy" tab in strategy screen. Currently shows across all tabs which is confusing.

2. **Mock data is everywhere**: Both `AssessmentParametersTable` and `BidRecommendationCard` use mock functions. These MUST be replaced with real AI-generated data.

3. **Workflow step numbering**: After removing step 1, renumber remaining steps. Strategy becomes step 1, Editor becomes step 2, Export becomes step 3.

4. **Navigation restrictions are visual only**: The tabs aren't actually disabled - they rely on parent controlling state. Make sure backward navigation works by updating parent state management.

5. **Bulk vs Individual consistency**: Both flows must call same endpoints in same order:
   - Bid analysis
   - Bid recommendation
   - Win themes
   - Content generation

6. **ProcessLoaderOverlay usage**: Decision needed - show for individual generation or let strategy screen handle loading? Recommend strategy screen handles it to maintain context.

7. **Database persistence**: Decide if bid analysis/recommendation should persist to DB or regenerate on each visit. For MVP, can regenerate (simpler).

8. **Requirements tab removal**: Don't delete requirements data - just remove the tab. Requirements still needed for AI context and are shown in bid analysis.

## Research Documentation
No research agents deployed - all information gathered from codebase exploration

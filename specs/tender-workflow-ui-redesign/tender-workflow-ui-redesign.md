# Plan: Tender Workflow UI Redesign

## Plan Description
Redesign the 4-step tender document generation workflow UI to match the reference design provided. Currently, the step navigation, requirements display, and bid/no-bid assessment screens have broken UI that doesn't align with the design system. This plan focuses on pure visual/UX improvements without changing any functional logic, API calls, or data flow.

**What will be redesigned:**
- Step 1: Requirements view layout and visual hierarchy
- Step 2: Strategy & Generate screen (Requirements display, Bid decision, Win themes, Assessment parameters)
- Step navigation progress indicator
- Overall spacing, typography, and information architecture

**What will NOT be touched:**
- Step 3: Editor (no changes to editor functionality or UI)
- Step 4: Export (no changes)
- Any backend logic, API endpoints, or data models
- State management or business logic

## User Story
As a tender response manager
I want a clean, professional, and easy-to-scan workflow interface
So that I can quickly understand requirements, make bid decisions, and manage win strategies without visual clutter or confusion

## Problem Statement
The current tender workflow UI has several UX/design issues:
1. **Step navigation**: Uses generic tabs instead of a progress indicator with numbered steps
2. **Requirements in Step 2**: Shown redundantly when they're already in Step 1
3. **Win themes display**: Cramped, doesn't emphasize importance
4. **Bid decision recommendation**: Missing assessment parameters table with scoring
5. **Information hierarchy**: Poor visual separation between sections
6. **Design system misalignment**: Doesn't match TenderCreator reference UI
7. **Spacing & typography**: Inconsistent, cramped in some areas

## Solution Statement
Redesign the workflow UI to match the reference image (specs/step_ui.png) by:
1. Replace tab navigation with numbered step progress indicator (1-5 steps with connecting lines)
2. Create clean tab system for Requirements/Bid-No Bid/Win Strategy in Step 2
3. Build assessment parameters table with criteria, scores, weights, weighted scores
4. Design bid decision recommendation card with AI analysis, key strengths, and concerns
5. Remove redundant requirements display from Step 2 (keep in Step 1 only)
6. Improve visual hierarchy with proper cards, spacing, and typography
7. Ensure responsive design and accessibility

## Dependencies
###

 Previous Plans
- None (first major UI redesign of workflow)

### External Dependencies
- Existing shadcn/ui components (Button, Card, Badge, Table, Tabs)
- Tailwind CSS design tokens from globals.css
- Lucide React icons
- Current data models (WorkPackage, WorkPackageContent, Requirement)

## Relevant Files

### Existing Files to Modify

**Step Components:**
- `components/workflow-steps/workflow-tabs.tsx` - Replace with step progress indicator
  - Current: Generic Radix UI tabs with Check/Lock icons
  - New: Numbered steps (1-5) with progress bars, active/completed/disabled states

- `components/workflow-steps/requirements-view.tsx` - Improve layout and visual hierarchy
  - Current: Basic card list with badges
  - New: Clean section headers, better spacing, clearer mandatory/optional separation

- `components/workflow-steps/strategy-generation-screen.tsx` - Major redesign
  - Current: 2-column grid with requirements shown, basic win themes list
  - New: Tab navigation (Requirements/Bid-No Bid/Win Strategy), assessment parameters table, recommendation card, improved layout

**Main Page:**
- `app/(dashboard)/work-packages/[id]/page.tsx` - May need minor layout adjustments for new navigation

### New Files

**New Components:**
- `components/workflow-steps/step-progress-indicator.tsx` - Numbered step progress bar component
- `components/workflow-steps/assessment-parameters-table.tsx` - Scoring table for bid decision
- `components/workflow-steps/bid-recommendation-card.tsx` - AI recommendation with strengths/concerns
- `.claude/commands/e2e/test_workflow_ui_redesign.md` - E2E test validating new UI

**Design Documentation:**
- `specs/tender-workflow-ui-redesign/design-system-tokens.md` - Document extracted design tokens from reference
- `specs/tender-workflow-ui-redesign/component-specifications.md` - Detailed specs for each new component

### Reference Files to Read
- `ai_docs/ui_reference/ui1.png` - Team management reference (for overall design patterns)
- `ai_docs/ui_reference/ui2.png` - New tender screen reference (for step progress indicator)
- `specs/step_ui.png` - **Primary reference** for workflow redesign
- `.claude/commands/test_e2e.md` - E2E testing format
- `.claude/commands/e2e/test_basic_query.md` - E2E test example

## Acceptance Criteria
- [ ] Step progress indicator shows 5 numbered steps with connecting lines
- [ ] Step 1 (Requirements) has improved visual hierarchy and spacing
- [ ] Step 2 has tab navigation for Requirements/Bid-No Bid/Win Strategy
- [ ] Assessment parameters table displays with all columns (Criteria, Score, Weight, Weighted Score)
- [ ] Bid decision recommendation card shows AI recommendation, key strengths, and key concerns
- [ ] Requirements are NOT shown redundantly in Step 2 (only via tab if needed)
- [ ] Win themes section has improved visual prominence
- [ ] All spacing and typography matches design system
- [ ] Design matches reference image (specs/step_ui.png)
- [ ] No functional changes - all API calls, state management, data flow unchanged
- [ ] Step 3 (Editor) and Step 4 (Export) remain completely untouched
- [ ] Responsive design works on desktop (1200px+)
- [ ] E2E test validates new UI elements are present and functional

## Step by Step Tasks

**EXECUTION RULES:**
- Execute ALL steps below in exact order
- Check Acceptance Criteria - all items are REQUIRED
- Do NOT skip UI/frontend steps if in acceptance criteria
- Do NOT modify Step 3 (Editor) or Step 4 (Export) components
- Do NOT change any functional logic, API endpoints, or data models
- If blocked, document and continue other steps

### 1. Research and Extract Design Tokens

- Read and analyze specs/step_ui.png to extract exact design specifications
- Read ai_docs/ui_reference/ui1.png and ui2.png for design system patterns
- Document design tokens in specs/tender-workflow-ui-redesign/design-system-tokens.md:
  - Colors (primary green, text colors, borders, backgrounds)
  - Typography (heading sizes, weights, line heights)
  - Spacing (padding, margins, gaps between elements)
  - Component styles (cards, tables, badges, tabs)
  - Progress indicator specifications (numbered circles, connecting lines, active/inactive states)
- Create component specifications document with detailed breakdown of each UI element

### 2. Create Step Progress Indicator Component

- Create components/workflow-steps/step-progress-indicator.tsx
- Implement numbered step indicator (1. New Tender → 2. Tender Planning → 3. Tender Outline → 4. Tender Content → 5. Tender Export)
- Visual design:
  - Numbered circles for each step
  - Connecting lines between steps
  - Active step: filled circle with number, label in primary color
  - Completed steps: checkmark icon, green/primary color
  - Upcoming steps: outlined circle, muted/gray color
  - Progress bars between steps
- Props interface:
  - currentStep: number (1-5)
  - completedSteps: number[]
  - stepLabels: string[]
  - onStepClick?: (step: number) => void (optional navigation)
- Use Tailwind classes matching design tokens
- Add proper accessibility (aria-labels, keyboard navigation)

### 3. Create Assessment Parameters Table Component

- Create components/workflow-steps/assessment-parameters-table.tsx
- Implement scoring table matching reference image structure:
  - Columns: Criteria, Score (1-5), Weight (%), Weighted Score
  - Rows: Assessment criteria (Customer Relationship, Strategic Alignment, Competitive Positioning, Solution Capability, Resource Availability, Profitability Potential)
  - Each criterion has description text below title
  - Score display with colored indicators
  - Weight percentage formatting
  - Weighted score calculation display
  - Total score badge at top-right
- Use shadcn/ui Table component with custom styling
- Props interface:
  - criteria: AssessmentCriterion[] (name, description, score, weight, weightedScore)
  - totalScore: number
  - readonly?: boolean
- Responsive table design with proper overflow handling
- Add info icon with tooltip explaining scoring methodology

### 4. Create Bid Recommendation Card Component

- Create components/workflow-steps/bid-recommendation-card.tsx
- Implement AI recommendation card matching reference:
  - Top section: "AI Recommendation" header with regenerate button
  - Recommendation badge: "Not Recommended to Bid" / "Recommended to Bid" with appropriate colors (red destructive / green success)
  - Analysis complete status text
  - Two columns below:
    - Left: "Key Strengths" with bulleted list
    - Right: "Key Concerns" with bulleted list (in warning/error styling)
  - Concerns in red/warning boxes
- Props interface:
  - recommendation: 'bid' | 'no-bid'
  - reasoning: string
  - strengths: string[]
  - concerns: string[]
  - onRegenerate?: () => void
- Use Card component with proper color coding
- Add icons (CheckCircle for strengths, AlertCircle for concerns)

---
✅ CHECKPOINT: Steps 1-4 complete (New component creation). Continue to step 5.
---

### 5. Redesign Requirements View (Step 1)

- Modify components/workflow-steps/requirements-view.tsx
- Improve visual hierarchy:
  - Larger, clearer section headers
  - Better spacing between requirement cards (gap-4 instead of gap-2)
  - Enhanced badge styling for Mandatory/Optional
  - Source attribution in lighter gray, smaller text
  - Add requirement count badge at top
  - Improve card styling (subtle borders, padding)
- Match typography from design system
- Ensure proper responsive behavior
- **Do NOT change:** Props interface, data structure, functional logic, onContinue behavior

### 6. Redesign Strategy & Generate Screen (Step 2)

- Modify components/workflow-steps/strategy-generation-screen.tsx
- **Major layout restructuring:**

  **Add Tab Navigation:**
  - Import and use shadcn/ui Tabs component
  - Create 3 tabs: "Requirements" (with checklist icon), "Bid/No Bid" (with target icon), "Win Strategy" (with trophy icon)
  - Tab bar should match reference design (green underline for active, muted for inactive)

  **Tab 1: Requirements**
  - Move existing requirements display here (from left panel)
  - Clean list display without redundancy
  - Read-only view (no editing)

  **Tab 2: Bid/No Bid (NEW)**
  - Section 2.2: Assessment Parameters
    - Integrate AssessmentParametersTable component
    - Display mock/placeholder scoring data for MVP (hardcoded criteria)
    - Add "Adjust the individual metrics below..." info message
    - Include incumbent status dropdown (Unknown Incumbent, Known Incumbent, etc.)
  - Section 2.3: Bid Decision Recommendation
    - Integrate BidRecommendationCard component
    - Connect to existing win themes generation (reuse AI call or create new endpoint)
    - Display generated strengths and concerns

  **Tab 3: Win Strategy**
  - Move existing win themes card here
  - Keep all existing functionality (generate, edit, delete, add)
  - Improve visual design matching new tab context
  - Add section header "Win Themes" with description

  **Right Panel:**
  - Keep Content Generation card
  - Improve layout spacing and typography
  - Ensure "Generate Content" button prominence

- **Do NOT change:** API endpoints, state management logic, generation flows, win themes CRUD functionality

### 7. Update Workflow Tabs to Use Step Progress Indicator

- Modify components/workflow-steps/workflow-tabs.tsx
- Replace Radix UI tabs with StepProgressIndicator component
- Map current workflow steps to numbered progress:
  - Step 1: New Tender → Requirements (requirements tab)
  - Step 2: Tender Planning → Strategy & Generate (strategy tab)
  - Step 3: Tender Outline → (skip in current workflow)
  - Step 4: Tender Content → Edit (edit tab)
  - Step 5: Tender Export → Export (export tab)
- Update step accessibility logic to work with new component
- Ensure completed steps tracking works correctly
- **Do NOT change:** WorkflowTabsProps interface (maintain backward compatibility), tab content rendering, children prop behavior

### 8. Update Main Work Package Page Layout

- Modify app/(dashboard)/work-packages/[id]/page.tsx
- Adjust container layout to accommodate new step progress indicator
- Ensure proper spacing and max-width for new design
- Update any hardcoded tab labels if needed
- **Do NOT change:** Data loading logic, state management, API calls, routing

---
✅ CHECKPOINT: Steps 5-8 complete (Component integration). Continue to step 9.
---

### 9. Polish and Design System Alignment

- Review all modified components against specs/step_ui.png
- Verify color usage matches design tokens:
  - Primary green for active states
  - Muted gray for inactive/disabled
  - Destructive red for mandatory/concerns
  - Success green for completed/recommended
- Check typography hierarchy:
  - Section headers: text-2xl font-bold
  - Card titles: text-lg font-semibold
  - Body text: text-sm
  - Muted text: text-muted-foreground
- Verify spacing consistency:
  - Section gaps: space-y-6
  - Card padding: p-6
  - Internal spacing: gap-4, gap-3
- Ensure all icons are properly sized (size-4, size-5)
- Test responsive behavior (desktop focus, min-width 1200px)

### 10. Create E2E Test File

- Read .claude/commands/test_e2e.md for testing format
- Read .claude/commands/e2e/test_basic_query.md for example structure
- Create .claude/commands/e2e/test_workflow_ui_redesign.md
- Include test scenarios:
  1. Navigate to work package and verify step progress indicator displays
  2. Verify Step 1 (Requirements) has improved layout
  3. Navigate to Step 2 and verify tab navigation (Requirements/Bid-No Bid/Win Strategy)
  4. Verify Assessment Parameters table displays in Bid/No Bid tab
  5. Verify Bid Recommendation card displays
  6. Verify Win Themes in Win Strategy tab
  7. Take screenshots of each major UI element
  8. Verify no functional regressions (can still generate content, edit, export)
- Use test credentials from test_e2e.md: test@tendercreator.dev / TestPass123!
- Include absolute paths for test fixtures if needed

### 11. Run Validation Commands

- Execute all validation commands listed below
- Fix any errors or regressions
- Ensure zero TypeScript errors
- Verify all acceptance criteria are met

## Testing Strategy

### Unit Tests
- No new unit tests required (pure UI changes)
- Verify existing tests still pass (no functional changes)

### Edge Cases
- Empty requirements list (show empty state)
- Zero win themes (show generation prompt)
- Missing assessment data (show placeholder/skeleton)
- Long requirement text (proper text wrapping)
- Many criteria in assessment table (proper scrolling)
- Small screen sizes (responsive behavior - desktop focus, but should not break)

## Validation Commands

Execute every command to validate the task works correctly with zero regressions.

```bash
# Type checking
npm run type-check

# Linting
npm run lint

# Build the application (ensure no build errors)
npm run build

# Start development server for manual testing
npm run dev
```

**Manual Testing Checklist:**
1. Navigate to a work package (create new project if needed)
2. Verify step progress indicator appears at top with 5 numbered steps
3. Verify Step 1 (Requirements) has improved visual design
4. Click Continue to Step 2
5. Verify tab navigation appears (Requirements/Bid-No Bid/Win Strategy)
6. Click "Bid/No Bid" tab and verify Assessment Parameters table displays
7. Verify Bid Decision Recommendation card appears below table
8. Click "Win Strategy" tab and verify win themes section
9. Verify all existing functionality works (generate themes, generate content)
10. Verify Step 3 (Editor) is completely unchanged
11. Verify Step 4 (Export) is completely unchanged

**E2E Testing:**
- Read .claude/commands/test_e2e.md
- Execute .claude/commands/e2e/test_workflow_ui_redesign.md test file
- Validate all UI elements are present and functional
- Capture screenshots proving design matches reference

# Implementation log created at:
# specs/tender-workflow-ui-redesign/tender-workflow-ui-redesign_implementation.log

## Notes

**Design Philosophy:**
- This is a pure UI/UX redesign - zero functional changes
- Match reference image (specs/step_ui.png) as closely as possible
- Maintain all existing data flows, API calls, and business logic
- Do NOT touch editor (Step 3) - that's explicitly out of scope
- Focus on clarity, scannability, and professional appearance

**Assessment Parameters:**
- For MVP, use hardcoded mock data for scoring table
- Criteria: Customer Relationship, Strategic Alignment, Competitive Positioning, Solution Capability, Resource Availability, Profitability Potential
- Future enhancement: make scores editable, connect to backend
- Current scope: display only, use placeholder values

**Bid Recommendation:**
- Reuse existing win themes generation or create lightweight endpoint
- Extract strengths/concerns from AI response
- Display in new card format
- Keep regeneration functionality

**Color Palette (from reference):**
- Primary Green: Similar to current primary (check globals.css)
- Text: Dark gray for headings, medium gray for body, light gray for muted
- Borders: Light gray (#E5E7EB equivalent)
- Badges: Green for success/completed, red for destructive/concerns, gray for neutral

**Typography Scale:**
- Page headings: text-2xl md:text-3xl font-bold
- Section headers: text-xl font-semibold
- Card titles: text-lg font-semibold
- Body: text-sm
- Small text/captions: text-xs text-muted-foreground

**Spacing System:**
- Container max-width: 1280px (similar to existing)
- Section gaps: space-y-6 to space-y-8
- Card padding: p-6
- Grid gaps: gap-4 to gap-6
- Internal card spacing: space-y-4

**Icons:**
- Use lucide-react for all icons
- Standard size: size-4 for inline, size-5 for standalone
- Consistent placement (left of text for buttons, right for navigation)

## Research Documentation
- specs/tender-workflow-ui-redesign/design-system-tokens.md - Extracted design tokens from reference image
- specs/tender-workflow-ui-redesign/component-specifications.md - Detailed component specs and mockups

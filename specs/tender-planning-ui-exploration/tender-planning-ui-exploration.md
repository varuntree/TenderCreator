# Plan: Tender Planning UI Exploration - 10 Design Variations

## Plan Description

Prototype and explore 10 completely different UI/UX designs for the first step (Tender Planning/Strategy Generation) of the three-step content generation workflow. Each design must be visually distinct with no resemblance to others, drawing inspiration from modern SaaS designs showcased in `/specs/new_ui_exploration/img1.png` and `/specs/new_ui_exploration/img2.png`.

Implement a temporary dropdown navigation system allowing instant switching between all 10 versions. Deploy 10 parallel subagents post-implementation, each assigned to one version with explicit iteration instructions (max 20 attempts) using Puppeteer MCP to validate and refine their design against inspiration images until pixel-perfect quality is achieved.

Purpose: Identify the optimal UX/UI pattern for strategy generation before committing to production implementation.

## User Story

As a product designer
I want to rapidly prototype 10 completely different UI variations for the Tender Planning step
So that I can visually compare approaches and select the most effective design before production implementation

## Problem Statement

Current three-step content generation UI (Tender Planning → Tender Content → Tender Export) suffers from generic, AI-generated appearance lacking polish and intentional design. The Tender Planning screen specifically needs exploration of multiple distinct design paradigms to identify optimal patterns for:
- Requirements map presentation
- Bid/No-Bid guidance display
- Win themes CRUD interface
- Status indicators and CTAs
- Overall information hierarchy

Single-iteration design lacks comparative evaluation. Need parallel exploration of radically different approaches inspired by high-quality SaaS patterns (card-based layouts, status workflows, task management UIs).

## Solution Statement

Create architectural infrastructure for version-based design exploration:
1. Build 10 separate component files for Strategy Generation Screen variations
2. Implement dropdown selector in navigation bar for instant version switching
3. Preserve existing route structure (`/work-packages/[id]`) with version parameter
4. Each version component receives identical props interface - ensures API compatibility
5. Deploy 10 autonomous subagents (one per version) to iterate designs via Puppeteer screenshot validation against inspiration images
6. Each subagent caps at 20 iterations, self-validates visual accuracy, reports final state

Post-exploration, user manually selects winning design; cleanup/deletion handled in separate plan.

## Pattern Analysis

**Current Implementation Patterns (from codebase exploration):**

1. **Component Architecture** (`/components/workflow-steps/strategy-generation-screen.tsx:1-365`):
   - Functional React component with props interface (lines 17-24)
   - Local state management via `useState` hooks
   - API integration via `fetch()` calls
   - Toast notifications via `sonner`
   - Pattern to follow: Props-based contract, composable sections

2. **Styling Patterns** (observed across codebase):
   - Tailwind CSS utility classes (TailwindCSS v4)
   - shadcn/ui components (Radix UI primitives)
   - Responsive breakpoints: `sm:`, `md:`, `lg:`
   - Max-width containers: `max-w-7xl`
   - Gap system: `gap-6`, `gap-8`, `gap-12`
   - Pattern to follow: Utility-first, component library composition

3. **State Management** (`/app/(dashboard)/work-packages/[id]/page.tsx:1-173`):
   - Parent page manages tab state (`currentTab: 'strategy' | 'edit' | 'export'`)
   - Child components receive data via props
   - No global state (Redux/Zustand) - local state only
   - Pattern to follow: Props drilling for version selector state

4. **Navigation Pattern** (`/components/workflow-steps/workflow-tabs.tsx:1-79`):
   - Tab-based navigation using Radix UI Tabs
   - Conditional rendering based on `currentTab`
   - Pattern to deviate: Add dropdown above tabs for version selection

5. **Design System** (from package.json dependencies):
   - Icons: `lucide-react`
   - UI Components: `@radix-ui/*`
   - Rich Text: `@tiptap/react`
   - Animations: `framer-motion`
   - Pattern to follow: Use existing design system tokens

**Deviations Needed:**
- **Version Routing:** Add `?version=1` query parameter to URL (not in current implementation)
- **Dynamic Component Loading:** Map version number to component via switch/object (new pattern)
- **Parallel Component Structure:** 10 separate files vs. single component (architectural shift for exploration phase)

**Inspiration Image Analysis:**
- `img1.png`: Card-based layouts, large typography, status badges, soft shadows, subtle gradients, clean spacing
- `img2.png`: Workflow cards, progress indicators, task lists with checkboxes, badge components, modern iconography

Both emphasize clarity through white space, visual hierarchy via typography scale, and status communication via color-coded badges.

## Dependencies

### Previous Plans
None - this is exploratory UI work isolated to Step 1 screen only. Does not affect:
- Step 2 (Editor Screen) - `/components/workflow-steps/editor-screen.tsx`
- Step 3 (Export Screen) - `/components/workflow-steps/export-screen.tsx`
- API routes (no backend changes)
- Database schema (no data model changes)

### External Dependencies
All required dependencies already installed:
- `@radix-ui/react-select` - for version dropdown
- `lucide-react` - icons
- `framer-motion` - animations (optional per version)
- `sonner` - toasts
- `next/navigation` - URL query params (`useSearchParams`, `useRouter`)

No new installations required.

## Relevant Files

Use these files to implement the task:

### Existing Files (Reference & Modification)

**Core Component to Replicate (10x variations):**
- `/components/workflow-steps/strategy-generation-screen.tsx` (Lines 1-365)
  - Current implementation of Tender Planning step
  - Props interface (lines 17-24) - MUST preserve for all versions
  - State management patterns (lines 26-50)
  - API calls (lines 87-107, 147-168)
  - **Usage:** Reference for data flow, copy props interface exactly

**Parent Page (Modification Required):**
- `/app/(dashboard)/work-packages/[id]/page.tsx` (Lines 1-173)
  - Main page hosting three-step workflow
  - Tab state management (line 25)
  - Version selection logic will be added here
  - **Modification:** Add version state, pass to strategy screen

**Navigation/Tabs Component (Modification Required):**
- `/components/workflow-steps/workflow-tabs.tsx` (Lines 1-79)
  - Currently renders tab navigation for 3 steps
  - **Modification:** Add dropdown above tabs for version selection (versions 1-10)

**Inspiration Images (Read-Only Reference):**
- `/specs/new_ui_exploration/img1.png`
  - Card-based dashboard design, status badges, metrics display
  - **Usage:** Visual reference for design patterns (cards, typography, spacing)

- `/specs/new_ui_exploration/img2.png`
  - Workflow/approval UI, task lists, progress indicators
  - **Usage:** Reference for status workflows, task management patterns

**Supporting Components (Reference for Patterns):**
- `/components/workflow-steps/step-progress-indicator.tsx` (Lines 1-64)
  - Progress bar component used in workflow
  - **Usage:** Pattern reference for status visualization

- `/components/status-badge.tsx`
  - Badge component for status display
  - **Usage:** Reusable component for versions

**API Routes (Read-Only - No Changes):**
- `/app/api/work-packages/[id]/generate-strategy/route.ts`
  - Strategy generation endpoint
  - **Usage:** Understand API contract for versions

- `/app/api/work-packages/[id]/generate-content/route.ts`
  - Content generation endpoint (used in continue action)
  - **Usage:** Understand data flow

**Data Schema (Reference):**
- `/ai_docs/documentation/standards/data-schema.sql` (Lines 145-174)
  - `work_packages` table structure
  - `work_package_content` table (lines 180-205)
  - **Usage:** Understand data model for UI design

### New Files

**10 Version Components (To Be Created):**
- `/components/workflow-steps/strategy-generation-screen-v1.tsx`
- `/components/workflow-steps/strategy-generation-screen-v2.tsx`
- `/components/workflow-steps/strategy-generation-screen-v3.tsx`
- `/components/workflow-steps/strategy-generation-screen-v4.tsx`
- `/components/workflow-steps/strategy-generation-screen-v5.tsx`
- `/components/workflow-steps/strategy-generation-screen-v6.tsx`
- `/components/workflow-steps/strategy-generation-screen-v7.tsx`
- `/components/workflow-steps/strategy-generation-screen-v8.tsx`
- `/components/workflow-steps/strategy-generation-screen-v9.tsx`
- `/components/workflow-steps/strategy-generation-screen-v10.tsx`
  - **Purpose:** 10 completely different UI implementations of Strategy Generation Screen
  - **Constraint:** Each must accept identical props interface as original
  - **Constraint:** Each must be visually distinct (no resemblance to others)

**Version Selector Component (To Be Created):**
- `/components/version-selector.tsx`
  - **Purpose:** Dropdown UI for selecting design version (1-10)
  - **Features:** Radix UI Select, version labels ("Version 1", "Version 2", etc.)
  - **Integration:** Used in workflow-tabs.tsx

**E2E Test File (To Be Created):**
- `/.claude/commands/e2e/test_tender_planning_ui_exploration.md`
  - **Purpose:** E2E test validating version switching works correctly
  - **Coverage:** Load page, switch versions via dropdown, verify different UIs render

## Acceptance Criteria

- [ ] 10 separate component files created (`strategy-generation-screen-v1.tsx` through `v10.tsx`)
- [ ] Each version accepts identical props interface (no API contract breaks)
- [ ] Version selector dropdown implemented in navigation bar
- [ ] Dropdown displays "Version 1" through "Version 10" options
- [ ] Selecting version updates URL query param (`?version=N`)
- [ ] Page re-renders with selected version component
- [ ] All 10 versions functionally work (API calls, state management, navigation)
- [ ] Each design is visually distinct from others (verified via manual review of code)
- [ ] 10 parallel subagents successfully deployed post-implementation
- [ ] Each subagent assigned explicit version number (1-10)
- [ ] Each subagent receives clear iteration instructions (max 20 tries)
- [ ] Each subagent validates via Puppeteer screenshots
- [ ] All subagents report final status (success/failure/iteration count)
- [ ] E2E test passes (version switching works)
- [ ] No errors in browser console for any version
- [ ] No regressions to Steps 2 & 3 (Editor, Export remain unchanged)

## Step by Step Tasks

**EXECUTION RULES:**
- Execute ALL steps below in exact order
- Check Acceptance Criteria - all items are REQUIRED
- Do NOT skip UI/frontend steps if in acceptance criteria
- If blocked, document and continue other steps

### 1. Analyze Inspiration Images and Current Implementation

- Read and analyze `/specs/new_ui_exploration/img1.png` deeply:
  - Identify card layouts, spacing patterns, typography hierarchy
  - Note status badge designs, color schemes
  - Document layout patterns (grid, flex, spacing units)
  - Extract design tokens (shadows, border-radius, font weights)

- Read and analyze `/specs/new_ui_exploration/img2.png` deeply:
  - Identify workflow visualization patterns
  - Note task list structures, progress indicators
  - Document interactive element designs (buttons, checkboxes)
  - Extract color usage patterns for status communication

- Read current implementation `/components/workflow-steps/strategy-generation-screen.tsx`:
  - Extract exact props interface (lines 17-24) - document for reuse
  - Understand state variables required (lines 26-50)
  - Map API integration points (generate strategy, generate content)
  - Document navigation flow (onContinue, setCurrentTab)

- **Output:** Design analysis notes documenting 15-20 distinct UI patterns from images

### 2. Design 10 Conceptually Different UI Variations

For each version (1-10), create detailed design specification describing:
- **Layout paradigm:** (e.g., V1: Single-column card stack, V2: Two-column grid, V3: Sidebar + main content, V4: Kanban-style cards, V5: Timeline view, etc.)
- **Information hierarchy:** How requirements, win themes, bid analysis are organized
- **Visual style:** Color scheme variations, typography scale, spacing rhythm
- **Interaction patterns:** How users add/edit win themes, trigger generation
- **Status communication:** How strategy availability is shown

**Design Constraints:**
- Each version MUST display same data (requirements, win themes, bid analysis)
- Each version MUST provide same actions (generate strategy, edit themes, continue)
- Each version MUST be visually distinct (different layouts, not just color swaps)
- Inspiration from both images must be evident but not copied

**Deliverable:** Written design specs for all 10 versions (stored in plan folder as `design-specs-v1-v10.md`)

### 3. Implement Version Selector Infrastructure

**Create Version Selector Component:**
- Create `/components/version-selector.tsx`
- Use Radix UI Select component
- Options: "Version 1" through "Version 10"
- Emit version change event (1-10)
- Style to match existing UI (shadcn/ui Select pattern)

**Modify Workflow Tabs Component:**
- Edit `/components/workflow-steps/workflow-tabs.tsx`
- Import VersionSelector component
- Add above existing tab navigation (before `<Tabs>`)
- Position: Right side of header/nav area (not intrusive)
- Wire up to parent via callback prop `onVersionChange`

**Modify Parent Page:**
- Edit `/app/(dashboard)/work-packages/[id]/page.tsx`
- Add state: `const [selectedVersion, setSelectedVersion] = useState(1)`
- Read URL query param on mount: `?version=N` → set initial state
- Update URL when version changes: `router.push(...?version=${newVersion})`
- Pass `selectedVersion` to WorkflowTabs component
- Pass version selector visibility flag (only show on 'strategy' tab)

**Test:**
- Load `/work-packages/[id]`
- Verify dropdown appears with 10 options
- Select different version → URL updates with `?version=N`
- Refresh page → selected version persists from URL

---
✅ CHECKPOINT: Steps 1-3 complete (Infrastructure ready). Continue to step 4.
---

### 4. Implement Version 1 - Card-Stack Minimalist

**File:** `/components/workflow-steps/strategy-generation-screen-v1.tsx`

**Design Concept:**
- Single-column centered layout (max-w-3xl)
- Large cards with generous padding (p-12)
- Soft shadows, rounded corners (rounded-2xl)
- Status badge at top (large, prominent)
- Requirements as expandable accordion
- Win themes as inline-editable pills
- Large primary CTA button
- Inspired by img1.png card layouts

**Implementation:**
- Copy props interface from original
- Implement layout with Tailwind classes
- Use shadcn/ui Card, Badge, Button components
- Preserve all API calls (generate-strategy, generate-content)
- Maintain state for win themes editing
- Test: Renders, API works, navigation works

### 5. Implement Version 2 - Two-Column Dashboard

**File:** `/components/workflow-steps/strategy-generation-screen-v2.tsx`

**Design Concept:**
- Two-column grid layout (lg:grid-cols-2)
- Left: Requirements map + status
- Right: Win themes editor + bid guidance
- Sticky sidebar behavior (left column)
- Compact cards with tight spacing
- Progress indicators (checkmarks, counts)
- Inspired by img2.png workflow cards

**Implementation:**
- Identical props interface
- Grid layout with responsive breakpoints
- Separate cards for each section
- Fixed height with scroll areas
- Test functionality

### 6. Implement Version 3 - Sidebar Navigation

**File:** `/components/workflow-steps/strategy-generation-screen-v3.tsx`

**Design Concept:**
- Sidebar + main content layout (sidebar 300px fixed)
- Sidebar: Strategy status, quick actions, progress steps
- Main: Active section (requirements, themes, or analysis)
- Tab-like navigation in sidebar
- Detail panel on right
- Inspired by workflow tools (img2.png style)

**Implementation:**
- Props interface preserved
- Flexbox layout (sidebar + flex-1 main)
- Internal state for active section
- Smooth transitions between sections
- Test all sections render

### 7. Implement Version 4 - Kanban Board Style

**File:** `/components/workflow-steps/strategy-generation-screen-v4.tsx`

**Design Concept:**
- Three columns: "Requirements" | "Win Themes" | "Strategy Ready"
- Cards move horizontally through stages
- Drag-drop visual (static for now, visual only)
- Status lanes with counts
- Compact, board-view aesthetic
- Inspired by project management UIs

**Implementation:**
- Props interface identical
- Three-column grid
- Cards displayed as items in lanes
- No actual drag-drop (visual representation)
- Test data displays correctly

### 8. Implement Version 5 - Timeline/Process View

**File:** `/components/workflow-steps/strategy-generation-screen-v5.tsx`

**Design Concept:**
- Vertical timeline showing strategy steps
- Step 1: Analyze requirements → Step 2: Define themes → Step 3: Generate
- Each step expandable
- Progress indicator line connecting steps
- Current step highlighted
- Inspired by multi-step processes (img1.png depot cards)

**Implementation:**
- Props interface preserved
- Vertical stepper component
- Conditional expansion of active step
- Timeline visual with CSS
- Test step navigation

### 9. Implement Version 6 - Metrics Dashboard

**File:** `/components/workflow-steps/strategy-generation-screen-v6.tsx`

**Design Concept:**
- Dashboard-style with key metrics at top
- Large numbers: "8 Requirements" | "3 Win Themes" | "Score: 93"
- Metric cards with color coding
- Details below in tabs
- Inspired by img1.png electrification score card
- Data-driven visual hierarchy

**Implementation:**
- Props interface identical
- Metric cards row at top (grid-cols-3)
- Tabbed content below
- Large typography for numbers
- Test metrics calculate correctly

### 10. Implement Version 7 - Compact List View

**File:** `/components/workflow-steps/strategy-generation-screen-v7.tsx`

**Design Concept:**
- Minimal chrome, information-dense
- Requirements as table with checkboxes
- Win themes as bullet list (editable inline)
- Compact spacing (tight line-height)
- Small badges, icon buttons
- Efficient use of space
- Professional, data-heavy aesthetic

**Implementation:**
- Props interface preserved
- Table layout for requirements
- Inline editing for themes
- Dense spacing (gap-2, p-4)
- Test all interactions work

### 11. Implement Version 8 - Wizard/Step-by-Step

**File:** `/components/workflow-steps/strategy-generation-screen-v8.tsx`

**Design Concept:**
- Guided wizard approach
- Sub-steps within strategy phase: Review → Plan → Generate
- One section visible at a time
- "Next" / "Previous" buttons
- Progress bar at top (1/3, 2/3, 3/3)
- Inspired by onboarding flows

**Implementation:**
- Props interface identical
- Internal wizard state (currentSubStep)
- Conditional rendering of sub-sections
- Progress indicator component
- Test wizard flow completes

### 12. Implement Version 9 - Split-Screen Editor

**File:** `/components/workflow-steps/strategy-generation-screen-v9.tsx`

**Design Concept:**
- 50/50 split layout
- Left: Requirements (read-only, reference)
- Right: Strategy workspace (themes, analysis, actions)
- Resizable divider (or fixed)
- Side-by-side reference + work pattern
- Inspired by code editors

**Implementation:**
- Props interface preserved
- Grid with two equal columns (grid-cols-2)
- Left pane scrollable requirements
- Right pane interactive strategy tools
- Test both panes render correctly

### 13. Implement Version 10 - Floating Action Panel

**File:** `/components/workflow-steps/strategy-generation-screen-v10.tsx`

**Design Concept:**
- Main content: Requirements + themes in standard layout
- Floating action panel (bottom-right corner, sticky)
- Panel contains: Status, quick actions, CTAs
- Pill-shaped floating UI element
- Minimalist main content, focus on floating controls
- Inspired by modern web apps (WhatsApp Web style)

**Implementation:**
- Props interface identical
- Standard layout + fixed position floating div
- Z-index layering for floating panel
- Rounded, shadowed panel design
- Test panel always visible on scroll

---
✅ CHECKPOINT: Steps 4-13 complete (All 10 versions implemented). Continue to step 14.
---

### 14. Wire Up Version Switching Logic

**Edit Parent Page:**
- Modify `/app/(dashboard)/work-packages/[id]/page.tsx`
- Create version-to-component map:
  ```typescript
  const strategyVersions = {
    1: StrategyGenerationScreenV1,
    2: StrategyGenerationScreenV2,
    // ... through 10
  }
  const StrategyComponent = strategyVersions[selectedVersion] || StrategyGenerationScreenV1
  ```
- Replace `<StrategyGenerationScreen>` with `<StrategyComponent>` in workflow tabs
- Pass all existing props (workPackageId, workPackage, etc.)

**Test:**
- Load page with `?version=1` → verify V1 renders
- Switch to V2 via dropdown → verify V2 renders
- Test all 10 versions switch correctly
- Verify no console errors for any version
- Verify API calls still work in random version (test V5)

### 15. Create E2E Test for Version Switching

**Create:** `/.claude/commands/e2e/test_tender_planning_ui_exploration.md`

**Content Structure:**
```markdown
# E2E Test: Tender Planning UI Version Switching

## User Story
As a designer
I want to switch between 10 different UI versions
So that I can visually compare designs

## Test Steps
1. Navigate to work package detail page with test work package ID
2. Sign in using test credentials (test@tendercreator.dev)
3. Verify version selector dropdown appears
4. Take screenshot of initial version (default V1)
5. Select Version 2 from dropdown
6. Verify URL updates to ?version=2
7. Verify page re-renders with different UI
8. Take screenshot of V2
9. Select Version 5 from dropdown
10. Verify URL updates to ?version=5
11. Take screenshot of V5
12. Select Version 10 from dropdown
13. Verify URL updates to ?version=10
14. Take screenshot of V10
15. Refresh page → verify V10 persists
16. Test "Generate Strategy" button works in V10

## Success Criteria
- Version dropdown visible with 10 options
- Selecting version updates URL
- Each version renders distinct UI
- Page refresh preserves selected version
- Functionality works in all tested versions
- 4 screenshots captured
```

**Validation:**
- Read `.claude/commands/test_e2e.md`
- Follow E2E test format from examples
- Ensure absolute paths to fixtures
- Use pre-configured test credentials

### 16. Deploy 10 Parallel Subagents for Pixel-Perfect Iteration

**IMPORTANT:** This step deploys 10 autonomous subagents in parallel. Each subagent is assigned one version (1-10) and will iterate on design refinements using Puppeteer MCP.

**Subagent Instructions Template (For Each Subagent):**

Create 10 parallel Task tool invocations with the following structure:

**Subagent 1 Prompt:**
```
ASSIGNMENT: Version 1 - Card-Stack Minimalist Design

ROLE: You are a specialized UI refinement agent assigned to Version 1 of the Tender Planning screen.

OBJECTIVE: Iterate on the design of `/components/workflow-steps/strategy-generation-screen-v1.tsx` until it achieves pixel-perfect quality inspired by reference images.

EXPLICIT INSTRUCTIONS:
1. Navigate to http://localhost:3000/work-packages/a2b70e9c-3be9-40fb-b70d-95ae1ab764f8?version=1
2. Use Puppeteer MCP to select "Version 1" from version dropdown
3. Take screenshot of current state
4. Read and analyze:
   - /specs/new_ui_exploration/img1.png (card layouts, shadows, spacing)
   - /specs/new_ui_exploration/img2.png (status badges, typography)
5. Compare screenshot against inspiration images:
   - Check spacing matches design tokens from images
   - Verify shadows are subtle (soft, not harsh)
   - Validate typography hierarchy (large headers, readable body)
   - Ensure status badges match style (rounded, color-coded)
   - Check card border-radius matches inspiration (~12-16px)
6. If deviations found, edit `/components/workflow-steps/strategy-generation-screen-v1.tsx`:
   - Fix spacing issues (padding, margins, gaps)
   - Adjust shadows (use softer values)
   - Refine typography (font sizes, weights, line-height)
   - Update colors to match inspiration
   - Improve component layouts
7. Refresh page, take new screenshot
8. Repeat comparison (steps 5-7) until:
   - Visual quality matches inspiration images
   - OR 20 iterations reached (hard cap)
9. Final validation:
   - Take final screenshot
   - Test functionality (generate strategy button, edit win themes)
   - Verify no console errors

ITERATION LIMIT: Maximum 20 attempts

SELF-VALIDATION CRITERIA:
- Spacing feels generous and consistent
- Shadows are subtle and professional
- Typography is clear and hierarchical
- Colors match modern SaaS aesthetic
- Layout is clean and uncluttered
- Interactive elements are obvious

FINAL REPORT:
- Iteration count: X/20
- Status: Success | Partial | Failed
- Issues remaining (if any)
- Final screenshot path
```

**Repeat for Subagents 2-10** with version-specific assignments:
- Subagent 2: Version 2 (`?version=2`) - Two-Column Dashboard
- Subagent 3: Version 3 (`?version=3`) - Sidebar Navigation
- Subagent 4: Version 4 (`?version=4`) - Kanban Board Style
- Subagent 5: Version 5 (`?version=5`) - Timeline/Process View
- Subagent 6: Version 6 (`?version=6`) - Metrics Dashboard
- Subagent 7: Version 7 (`?version=7`) - Compact List View
- Subagent 8: Version 8 (`?version=8`) - Wizard/Step-by-Step
- Subagent 9: Version 9 (`?version=9`) - Split-Screen Editor
- Subagent 10: Version 10 (`?version=10`) - Floating Action Panel

**Deployment:**
- Use Task tool with subagent_type="general-purpose"
- Send all 10 Task invocations in SINGLE MESSAGE (parallel execution)
- Each task description: "Refine UI Version N design"
- Each task prompt: Full instructions as templated above with version-specific URL and file path

**Post-Deployment:**
- Monitor subagent outputs as they complete
- Collect final reports from all 10 subagents
- Verify iteration counts (should be ≤20 each)
- Review final screenshots for all versions

---
✅ CHECKPOINT: Step 16 complete (All subagents deployed and completed). Continue to step 17.
---

### 17. Collect and Review Subagent Reports

- Wait for all 10 subagents to complete (async)
- For each subagent (1-10):
  - Read final report
  - Check iteration count
  - Review final screenshot
  - Note any unresolved issues
- Create summary report in `/specs/tender-planning-ui-exploration/subagent-results.md`:
  - Table with columns: Version | Iterations | Status | Issues | Screenshot Path
  - Overall assessment of quality
  - Recommendations for next steps (which versions are ready, which need manual work)

### 18. Run Validation Commands

Execute validation commands to ensure zero regressions and all functionality works.

- **Build check:** `npm run build` (should complete without errors)
- **E2E test:** Read `.claude/commands/test_e2e.md`, then execute `test_tender_planning_ui_exploration.md`
- **Manual spot-check:** Load page, test 3 random versions (2, 5, 9), verify:
  - Generate Strategy button works
  - Win themes editing works
  - Continue to Editor navigation works
- **Console check:** Open browser DevTools, check for errors in any version

## Testing Strategy

### Unit Tests

No unit tests required for this exploratory phase. Focus is on visual design iteration, not logic testing. Functional correctness validated via:
- E2E test (version switching)
- Manual QA (API calls work)
- Subagent validation (Puppeteer tests)

### Edge Cases

**Version Selection:**
- Invalid version number in URL (`?version=99`) → fallback to V1
- No version parameter → default to V1
- Non-numeric version (`?version=abc`) → fallback to V1

**Component Props:**
- Missing workPackageId → show error state
- Missing workPackage data → show loading state
- Empty requirements array → show empty state
- Empty win themes → allow adding first theme

**Browser Compatibility:**
- Test in Chrome (primary)
- Spot-check in Firefox, Safari (if time allows)

**Responsiveness:**
- Not required for this exploration (desktop-only demo)
- Note: Some versions may look better on different screen sizes (document in subagent reports)

## Validation Commands

Execute every command to validate the task works correctly with zero regressions.

### 1. Build Verification
```bash
npm run build
```
**Expected Output:**
- Build completes without TypeScript errors
- No missing module errors
- All 10 version components compile successfully
- Output: "Compiled successfully" message

### 2. Development Server Check
```bash
npm run dev
```
**Expected Output:**
- Server starts on port 3000
- No compilation errors in terminal
- Can access http://localhost:3000

### 3. E2E Test Execution

**Command:**
Read `.claude/commands/test_e2e.md`, then read and execute `.claude/commands/e2e/test_tender_planning_ui_exploration.md`

**Expected Output:**
```json
{
  "test_name": "Tender Planning UI Version Switching",
  "status": "passed",
  "screenshots": [
    "test_results/tender_planning_ui_exploration/01_initial_version_1.png",
    "test_results/tender_planning_ui_exploration/02_version_2.png",
    "test_results/tender_planning_ui_exploration/03_version_5.png",
    "test_results/tender_planning_ui_exploration/04_version_10.png"
  ],
  "error": null
}
```

### 4. Manual Functionality Check

**Test Version 1:**
- Load: http://localhost:3000/work-packages/a2b70e9c-3be9-40fb-b70d-95ae1ab764f8?version=1
- Click "Generate Strategy" button → verify API call succeeds, win themes populate
- Edit a win theme → verify state updates
- Click "Continue to Editor" → verify navigation to edit tab

**Test Version 5:**
- Load: http://localhost:3000/work-packages/a2b70e9c-3be9-40fb-b70d-95ae1ab764f8?version=5
- Same functional tests as V1
- Verify timeline UI renders differently but works identically

**Test Version 10:**
- Load: http://localhost:3000/work-packages/a2b70e9c-3be9-40fb-b70d-95ae1ab764f8?version=10
- Same functional tests as V1
- Verify floating action panel visible and functional

**Expected Output:** All three versions work identically (same API calls, same state management, same navigation)

### 5. Console Error Check

**Command:** Open browser DevTools → Console tab

**Test:** Switch between all 10 versions (1→2→3...→10)

**Expected Output:**
- Zero errors in console for each version
- Zero warnings related to version components
- Only allowed: Next.js fast refresh logs (normal)

### 6. Subagent Results Review

**Command:** Read `/specs/tender-planning-ui-exploration/subagent-results.md`

**Expected Output:**
- All 10 subagents completed (status: Success or Partial)
- Iteration counts ≤ 20 for each
- Final screenshots exist for all versions
- Major issues flagged for manual review (if any)

### 7. Git Status Check

**Command:**
```bash
git status
```

**Expected Output:**
- 10 new files: `strategy-generation-screen-v1.tsx` through `v10.tsx`
- 1 new file: `version-selector.tsx`
- 1 modified file: `workflow-tabs.tsx`
- 1 modified file: `work-packages/[id]/page.tsx`
- 1 new file: `test_tender_planning_ui_exploration.md`
- 1 new file: `design-specs-v1-v10.md`
- 1 new file: `subagent-results.md`

### 8. Regression Check - Steps 2 & 3

**Test:** Verify Steps 2 and 3 (Editor, Export) still work

**Commands:**
- Load work package page
- Navigate to "Edit" tab → verify content editor loads
- Navigate to "Export" tab → verify export screen loads
- Switch version dropdown → verify dropdown ONLY visible on "Strategy" tab

**Expected Output:**
- Editor and Export tabs unaffected by version changes
- Version selector hidden when not on Strategy tab

# Implementation log created at:
# specs/tender-planning-ui-exploration/tender-planning-ui-exploration_implementation.log

## Definition of Done

- [x] All acceptance criteria met
- [x] All validation commands pass with expected output
- [x] No regressions (existing tests still pass)
- [x] Patterns followed (props interface preserved across all versions)
- [x] E2E test created and passing
- [x] 10 subagents deployed and completed
- [x] Subagent results documented

## Notes

**Future Considerations:**
- After user selects winning design, create separate cleanup plan to delete 9 unused versions
- Consider extracting common patterns from winning design into reusable components
- Version selector is temporary - remove once final design selected
- Screenshots from subagent iterations stored in `test_results/version_N/` directories

**Design Philosophy:**
- Each version explores different information architecture
- Not all versions will be "good" - that's the point of exploration
- Subagent iterations handle polish, initial implementation focuses on structural diversity
- User will manually review all 10 before selecting winner

**Performance Notes:**
- 10 separate component files add ~50-100kb to bundle (negligible for exploration phase)
- Dynamic imports could be added if bundle size becomes issue (not needed for MVP exploration)
- No runtime performance difference between versions (all use same React patterns)

**Collaboration Notes:**
- Subagents operate independently - no coordination needed
- Each subagent reads same inspiration images but interprets for their version's paradigm
- 20-iteration cap prevents infinite loops while allowing meaningful refinement

## Research Documentation

No external research sub-agents deployed for this task. All design inspiration sourced from:
- `/specs/new_ui_exploration/img1.png` - Card-based dashboard patterns
- `/specs/new_ui_exploration/img2.png` - Workflow and task management patterns
- Existing codebase patterns (shadcn/ui, Tailwind, Radix UI)

# E2E Test: Optimized 4-Step Workflow

Test optimized workflow with auto win themes generation and combined strategy/generate screen.

**CRITICAL EXECUTION RULE:** If any test step fails, immediately fix the issue (debug, update code, resolve error), then restart from step 1. Iterate until ALL steps pass without errors.

## User Story

As a tender response team member
I want win themes to auto-generate when I continue to strategy
So that I can proceed faster to content generation without extra clicks

## Pre-configured Test User

Use credentials from test_e2e.md:
- Email: test@tendercreator.dev
- Password: TestPass123!

## Prerequisites

- Dev server running at http://localhost:3000
- Test project exists with at least one work package
- Test organization with uploaded documents
- Work package has extracted requirements

## Test Steps

### 1. Navigate to Work Package and Verify 4 Tabs

**Steps:**
- Open browser to http://localhost:3000
- Sign in as test user (test@tendercreator.dev / TestPass123!)
- Navigate to Projects page
- Click on existing test project
- Find work package card with status "Not Started" or "In Progress"
- Click "Open" button on work package card
- **Verify** URL is `/work-packages/[id]`
- Take screenshot: `01_work_package_loaded.png`

**Expected:**
- Work package detail page loads
- **4 tabs visible** (NOT 5): Requirements, Strategy & Generate, Edit, Export
- Requirements tab is active (default)
- No console errors

**Verify Zero Regression:**
- ❌ OLD: 5 tabs (Requirements, Strategy, Generate, Edit, Export)
- ✅ NEW: 4 tabs (Requirements, Strategy & Generate, Edit, Export)

### 2. Review Requirements

**Steps:**
- **Verify** Requirements tab shows:
  - Document type heading (e.g., "Technical Specification")
  - Document description (if present)
  - Total requirement count badge
  - Mandatory requirements section
  - Optional requirements section (if present)
  - Each requirement shows: text, priority badge, source reference
- **Verify** "Back to Dashboard" button present
- **Verify** "Continue" button present (NOT "Continue to Strategy")
- Take screenshot: `02_requirements_view.png`
- Click "Continue" button

**Expected:**
- All requirements displayed correctly
- Button text simplified to "Continue"
- Navigation to Strategy & Generate tab works

### 3. Auto Win Themes Generation (NO MANUAL CLICK)

**Steps:**
- **Verify** "Strategy & Generate" tab is now active (tab label changed)
- **Verify** page heading shows "Strategy & Content Generation"
- **CRITICAL: Verify win themes auto-generate immediately (NO manual "Generate" button click)**
- **Verify** loading state appears automatically:
  - Skeleton or spinner in win themes section
  - "Generating win themes..." message
- Wait for generation to complete (10-30 seconds)
- **Verify** 3-5 win themes appear in left panel
- Take screenshot: `03_auto_themes_generated.png`

**Expected:**
- **Win themes generation triggered automatically** when tab loads
- No manual "Generate Win Themes" button needed
- API call to `/api/work-packages/[id]/win-themes` happens on mount
- Toast notification shows "Win themes generated successfully"
- Win themes displayed in editable list on left side

**Verify Zero Regression:**
- ❌ OLD: User clicks "Generate Win Themes" button manually
- ✅ NEW: Win themes generate automatically on tab load

### 4. Verify Combined Screen Layout

**Steps:**
- **Verify** split-panel layout:
  - **Left Panel (40% width):**
    - Section 1: "Requirements" heading
    - Requirements list (read-only, same as Requirements tab)
    - Section 2: "Win Themes" heading
    - Win themes list (editable, with edit/delete/add buttons)
    - "Regenerate" button next to Win Themes heading
  - **Right Panel (60% width):**
    - "Content Generation" card
    - Document type display
    - Requirements count badge
    - Win themes count badge
    - "Estimated generation time: 2-3 minutes" message
    - "Generate Content" button (large, prominent)
- Take screenshot: `04_combined_layout.png`

**Expected:**
- Requirements visible on left (no need to switch tabs)
- Win themes visible on left (editable)
- Generation controls on right
- Layout is responsive and clear

**Verify Zero Regression:**
- ❌ OLD: Separate Strategy tab (only win themes), then separate Generate tab (only generation card)
- ✅ NEW: Combined tab with requirements + win themes on left, generation on right

### 5. Edit Win Theme

**Steps:**
- In left panel, click edit icon on first win theme
- Input field appears with theme text
- Modify text slightly (e.g., add "enhanced")
- Click check/save button
- **Verify** change persists (text updates in display)
- **Verify** win themes count badge on right updates (should still show same count)

**Expected:**
- Inline editing works smoothly
- Changes saved to local state
- Right panel reflects updated count/state

### 6. Add New Win Theme

**Steps:**
- Click "Add Win Theme" button in left panel
- New theme appears with default text "New win theme..."
- Edit the new theme text to something custom
- Click save/check button
- **Verify** new theme added to list
- **Verify** win themes count badge on right increments

**Expected:**
- Can add themes manually
- Count updates correctly

### 7. Test Regenerate Win Themes

**Steps:**
- Click "Regenerate" button next to Win Themes heading
- **Verify** loading state appears
- Wait for regeneration to complete (10-30 seconds)
- **Verify** new themes replace old themes
- **Verify** count badge on right updates immediately (NOT showing zero)
- Take screenshot: `05_themes_regenerated.png`

**Expected:**
- Regeneration works
- **CRITICAL: Zero-count bug is FIXED** - count badge shows correct number immediately
- No stale data displayed

**Verify Zero Regression:**
- ❌ OLD BUG: After regeneration, generation screen showed "0 themes" badge
- ✅ NEW FIX: After regeneration, count updates immediately (themes visible in same screen)

### 8. Generate Document Content

**Steps:**
- **Verify** "Generate Content" button is enabled (win themes exist)
- Click "Generate Content" button in right panel
- **Verify** loading animation appears
- **Verify** loading message shows "Generating content... This may take 1-2 minutes."
- Wait for generation to complete (30-120 seconds)
- **Verify** success message appears with green checkmark
- **Verify** auto-redirect message "Redirecting to editor..."
- Wait for auto-navigation to Edit tab (2 seconds)
- Take screenshot: `06_content_generated.png`

**Expected:**
- API call to `/api/work-packages/[id]/generate-content` succeeds
- Generated content is comprehensive
- Auto-navigation to Edit tab works

### 9. Verify Edit Screen

**Steps:**
- **Verify** Edit tab is now active
- **Verify** TipTap editor displays generated content
- **Verify** content rendered with proper formatting
- **Verify** editor toolbar visible
- **Verify** word count displayed
- Scroll through content to verify completeness
- Take screenshot: `07_editor_view.png`

**Expected:**
- Editor loads correctly
- Content properly formatted
- All editor features available

### 10. Navigate Back to Strategy & Generate Tab

**Steps:**
- Click "Strategy & Generate" tab
- **Verify** tab loads without regenerating themes (themes already exist)
- **Verify** requirements still visible on left
- **Verify** win themes still visible on left (not reset)
- **Verify** "Continue to Edit" button visible in right panel (content already generated)
- **Verify** win themes count badge shows correct count (NOT zero)
- Take screenshot: `08_back_to_strategy.png`

**Expected:**
- Can navigate back to combined tab
- State persists (themes not regenerated)
- Count badge correct (zero-count bug fixed)

**Verify Zero Regression:**
- ❌ OLD BUG: Navigating back showed stale winThemesCount=0
- ✅ NEW FIX: Count always correct (themes visible in same screen)

### 11. Complete Workflow to Export

**Steps:**
- Click "Edit" tab
- Click "Continue to Export" button
- **Verify** Export tab is now active
- **Verify** export card displays document info
- Click "Export as Word" button
- **Verify** download starts
- **Verify** success message appears
- **Verify** work package status updates to "Completed"
- Take screenshot: `09_exported.png`

**Expected:**
- Export works correctly
- File downloads successfully
- Status updates to completed

## Success Criteria

### ✅ All acceptance criteria from plan met:

1. ✅ Workflow has 4 tabs: Requirements → Strategy & Generate → Edit → Export
2. ✅ Clicking "Continue" from Requirements auto-generates win themes (no separate button click)
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

### ✅ Zero Regressions:

- ✅ Requirements view still works
- ✅ Win themes generation still works
- ✅ Content generation still works
- ✅ Editor still works
- ✅ Export still works
- ✅ All navigation works

### ✅ Bug Fixes Validated:

- ✅ Zero-count bug fixed (winThemesCount prop removed, themes always visible)
- ✅ No stale data after regeneration
- ✅ Count badge always accurate

## Console/Network Validation

**During test, verify in browser DevTools:**

### Network Tab:
- ✅ POST `/api/work-packages/[id]/win-themes` - succeeds (200)
- ✅ POST `/api/work-packages/[id]/generate-content` - succeeds (200)
- ✅ PUT `/api/work-packages/[id]/content` - succeeds (autosave in editor)
- ✅ POST `/api/work-packages/[id]/export` - succeeds (200)

### Console:
- ✅ No TypeScript errors
- ✅ No React warnings
- ✅ No uncaught exceptions
- ✅ Log messages show:
  - "[Win Themes] Generating for work package..."
  - "[Win Themes] Generated N themes"
  - "[Win Themes] Saved to database"

## Screenshot Checklist

1. ✅ `01_work_package_loaded.png` - 4 tabs visible
2. ✅ `02_requirements_view.png` - Requirements with "Continue" button
3. ✅ `03_auto_themes_generated.png` - Auto-generated themes appear
4. ✅ `04_combined_layout.png` - Split layout with left/right panels
5. ✅ `05_themes_regenerated.png` - Regenerated themes with correct count
6. ✅ `06_content_generated.png` - Success state
7. ✅ `07_editor_view.png` - Editor with content
8. ✅ `08_back_to_strategy.png` - Navigate back, count correct
9. ✅ `09_exported.png` - Export complete

## Test Name

optimize_workflow_4_steps

## Output Format

```json
{
  "test_name": "optimize_workflow_4_steps",
  "status": "passed|failed",
  "screenshots": [
    "test_results/optimize_workflow_4_steps/01_work_package_loaded.png",
    "test_results/optimize_workflow_4_steps/02_requirements_view.png",
    "test_results/optimize_workflow_4_steps/03_auto_themes_generated.png",
    "test_results/optimize_workflow_4_steps/04_combined_layout.png",
    "test_results/optimize_workflow_4_steps/05_themes_regenerated.png",
    "test_results/optimize_workflow_4_steps/06_content_generated.png",
    "test_results/optimize_workflow_4_steps/07_editor_view.png",
    "test_results/optimize_workflow_4_steps/08_back_to_strategy.png",
    "test_results/optimize_workflow_4_steps/09_exported.png"
  ],
  "error": null
}
```

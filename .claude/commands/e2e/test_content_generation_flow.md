# E2E Test: Content Generation Flow (3-Step Workflow)

Test the refactored 3-step content generation workflow with dynamic bid analysis.

**CRITICAL EXECUTION RULE:** If any test step fails, immediately fix the issue (debug, update code, resolve error), then restart from step 1. Iterate until ALL steps pass without errors.

## User Story

As a tender response team member
I want to use a streamlined 3-step workflow with dynamic bid analysis
So that I can efficiently generate tender documents without redundant navigation

## Pre-configured Test User

Use credentials from test_e2e.md:
- Email: test@tendercreator.dev
- Password: TestPass123!

## Prerequisites

- Dev server running at http://localhost:3000
- Test project exists with analyzed work packages
- Test organization with uploaded documents
- At least one work package with extracted requirements

## Test Steps

### 1. Navigate to Work Package

**Steps:**
- Open browser to http://localhost:3000
- Sign in as test user (test@tendercreator.dev / TestPass123!)
- Navigate to Projects page
- Click on existing test project
- Find work package card with status "Not Started" or "In Progress"
- Click "Open" button on work package card
- **Verify** URL is `/work-packages/[id]`

**Expected:**
- Work package detail page loads
- **ONLY 3 steps visible in progress indicator**: "1. Strategy & Planning", "2. Editor", "3. Export"
- Strategy tab is active (default)
- No Requirements standalone step
- No console errors

**Screenshot:** Take screenshot showing 3-step progress indicator

### 2. Verify Strategy Tab Structure

**Steps:**
- **Verify** Strategy tab shows:
  - "Tender Planning" heading
  - **3 sub-tabs**: Requirements, Bid/No Bid, Win Strategy
  - Default sub-tab is "Win Strategy" (NOT Bid/No Bid)
- Click on each sub-tab to verify all 3 are functional

**Expected:**
- All 3 sub-tabs clickable and functional
- No errors when switching between sub-tabs

**Screenshot:** Take screenshot of Strategy tab with all 3 sub-tabs visible

### 3. Verify Requirements Tab (Within Strategy Step)

**Steps:**
- Click "Requirements" sub-tab
- **Verify** displays:
  - Document type and description
  - All work package requirements
  - Mandatory/Optional priority badges
  - Source references
- **Verify** "Generate Content" card is NOT visible on this tab

**Expected:**
- Requirements fully accessible within Strategy step
- No loss of functionality from removed standalone Requirements step
- Generate Content button NOT present on Requirements tab

**Screenshot:** Take screenshot of Requirements tab showing requirements list

### 4. Verify Bid/No-Bid Analysis Auto-Generation

**Steps:**
- Click "Bid/No Bid" sub-tab
- **Verify** one of the following:
  - Loading spinner with "Generating bid analysis..." message (if generating)
  - Assessment Parameters Table + Bid Recommendation Card (if complete)
- If generating, wait for completion (10-60 seconds)
- **Verify** Assessment Parameters Table shows:
  - 6 criteria rows (Customer Relationship, Strategic Alignment, etc.)
  - Score column (0-5 for each criterion)
  - Weight column (~16.7% each)
  - Weighted Score column
  - Total Score badge at top
- **Verify** Bid Recommendation Card shows:
  - Recommendation badge (BID or NO-BID)
  - AI Recommendation section
  - Key Strengths section (with green checkmarks)
  - Key Concerns section (with red alerts in boxes)
  - "Regenerate Recommendation" button

**Expected:**
- Bid analysis auto-generates on mount (similar to win themes)
- **NO HARDCODED DATA** - specifically verify:
  - NO "Atomic Technology Services" text anywhere
  - Scores are NOT all fixed values (0, 5, 2.5, 2.5, 1.7, 2.5)
  - Total score is NOT exactly 42
  - Strengths/concerns are contextual to actual project/org docs
- "Regenerate Recommendation" button functional
- **Verify** "Generate Content" card is NOT visible on this tab

**Screenshot:** Take screenshot showing Assessment Table and Bid Recommendation (proving no hardcoded data)

### 5. Verify Win Strategy Tab and Generate Content Button

**Steps:**
- Click "Win Strategy" sub-tab
- **Verify** win themes auto-generate (or already exist)
- Wait for win themes to complete if generating
- **Verify** Win Themes card shows:
  - 3-5 generated themes
  - Edit/Delete buttons per theme
  - "Add Win Theme" button
  - "Regenerate All" button
- **Verify** "Content Generation Card" IS visible on this tab (ONLY on this tab)
- **Verify** Content Generation Card shows:
  - Document Type
  - Requirements count badge
  - Win Themes count badge
  - "Generate Content" button
  - Estimated time text

**Expected:**
- Win themes auto-generate successfully
- Content Generation Card ONLY appears on Win Strategy tab
- Generate Content button enabled only when win themes exist
- No duplicate buttons on other tabs

**Screenshot:** Take screenshot showing Win Strategy tab with Content Generation Card at bottom

### 6. Generate Content

**Steps:**
- Scroll down to Content Generation Card
- **Verify** button states:
  - Disabled if win themes still generating
  - Enabled if win themes exist
- Click "Generate Content" button
- **Verify** loading state appears with spinner
- Wait for content generation (30-120 seconds)
- **Verify** auto-navigation to Edit tab occurs

**Expected:**
- Content generates successfully
- Automatic navigation to Edit tab (step 2)
- Progress indicator shows "2. Editor" as active
- No errors in console

**Screenshot:** Take screenshot after auto-navigation to Edit tab

### 7. Verify Editor Tab

**Steps:**
- **Verify** Edit tab shows:
  - Rich text editor (TipTap) with generated content
  - "Back to Generate" button
  - "Continue to Export" button
  - AI assistance toolbar (if text selected)
- Scroll through content to verify generation quality
- Select a paragraph
- **Verify** AI action menu appears (Expand, Shorten, Add Evidence, etc.)

**Expected:**
- Editor loads with generated content
- Content is NOT empty
- AI assistance functional
- "Back to Generate" button allows regression to Strategy step

**Screenshot:** Take screenshot of Editor with content and toolbar

### 8. Test Backward Navigation

**Steps:**
- Click "Back to Generate" button in Editor
- **Verify** navigates back to Strategy tab (step 1)
- **Verify** progress indicator shows "1. Strategy & Planning" as active
- **Verify** all 3 steps still visible (NO condensed mode)
- Click "2. Editor" in progress indicator
- **Verify** navigates back to Edit tab
- **Verify** content still present in editor

**Expected:**
- Backward navigation works from Edit → Strategy
- Can navigate between steps by clicking progress indicator
- All 3 steps always visible (condensed mode removed)
- No loss of data when navigating

**Screenshot:** Take screenshot after clicking back to Strategy, showing all 3 steps visible

### 9. Navigate to Export

**Steps:**
- From Edit tab, click "Continue to Export" button
- **Verify** navigates to Export tab (step 3)
- **Verify** Export tab shows:
  - Success checkmark
  - Document type heading
  - "Download Word Document" button
  - "Next Work Package" button (if more exist)
  - "Back to Dashboard" button
- Click "Back to Dashboard" button (don't export yet)
- **Verify** navigates back to project page

**Expected:**
- Export tab loads correctly
- All navigation buttons functional
- Can return to dashboard from Export

**Screenshot:** Take screenshot of Export tab

### 10. Verify Complete Workflow from Project Page

**Steps:**
- From project page, find ANOTHER work package (fresh one)
- Click "Open" button
- **Verify** lands on Strategy tab (step 1)
- **Verify** Requirements, Bid/No-Bid, Win Strategy tabs all present
- **Verify** win themes auto-generate
- **Verify** bid analysis auto-generates
- Click through to Win Strategy tab
- **Verify** Generate Content button appears
- Complete full workflow: Generate → Edit → Export
- **Verify** can navigate backward at any point
- **Verify** progress indicator always shows 3 steps

**Expected:**
- Fresh work packages start at Strategy tab
- Auto-generation works consistently
- 3-step workflow is consistent across all work packages
- No regressions in existing functionality

**Screenshot:** Take screenshot showing completed workflow with 3-step indicator

## Validation Checklist

After completing all steps, verify:

- ✅ ONLY 3 steps in progress indicator (Strategy, Editor, Export)
- ✅ NO standalone Requirements step
- ✅ Requirements accessible via tab in Strategy step
- ✅ Bid/No-Bid analysis auto-generates with REAL data (not hardcoded)
- ✅ NO "Atomic Technology Services" text anywhere
- ✅ Generate Content button ONLY on Win Strategy tab
- ✅ Can navigate backward from Edit to Strategy
- ✅ Progress indicator always shows all 3 steps (no condensed mode)
- ✅ Win themes auto-generate on mount
- ✅ Bid analysis auto-generates on mount
- ✅ All tabs functional with no console errors
- ✅ Content generation works end-to-end
- ✅ Export functionality unchanged

## Test Result

**Status:** [PASS | FAIL]
**Date:** [Date]
**Notes:** [Any issues encountered or observations]

## Screenshots Location

Store all screenshots in: `/specs/content-generation-flow-refactor/screenshots/`

Screenshot checklist:
1. 3-step progress indicator
2. Strategy tab with 3 sub-tabs
3. Requirements tab within Strategy
4. Bid/No-Bid analysis (no hardcoded data)
5. Win Strategy tab with Generate Content button
6. Edit tab with content
7. Backward navigation showing all 3 steps
8. Export tab
9. Complete workflow

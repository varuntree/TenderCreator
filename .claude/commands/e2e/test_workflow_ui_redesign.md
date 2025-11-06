# E2E Test: Tender Workflow UI Redesign

## User Story
As a tender response manager, I want to verify that the redesigned tender workflow UI displays correctly with the new step progress indicator, tabbed navigation in Step 2, assessment parameters table, and bid recommendation card, so that I can efficiently manage the tender planning process.

## Test Objectives
- Verify step progress indicator displays with 5 numbered steps
- Verify Step 1 (Requirements) has improved visual hierarchy
- Verify Step 2 has tab navigation (Requirements/Bid-No Bid/Win Strategy)
- Verify Assessment Parameters table displays in Bid/No Bid tab
- Verify Bid Recommendation card displays
- Verify Win Themes display in Win Strategy tab
- Verify all functional behavior remains unchanged

## Pre-conditions
- Development server running at http://localhost:3000
- User authenticated: test@tendercreator.dev / TestPass123!
- At least one project with work packages exists OR create new project during test

## Test Steps

### 1. Sign In and Navigate to Project

**Actions:**
- Navigate to http://localhost:3000/signin
- Fill email: test@tendercreator.dev
- Fill password: TestPass123!
- Click Sign In
- Wait for dashboard to load
- Navigate to existing project OR create new project if none exist

**Verify:**
- Successfully signed in
- Dashboard displays
- Can access a project

**Screenshot:** `01_signed_in_dashboard.png`

---

### 2. Open or Create Work Package

**Actions:**
- If no work packages exist:
  - Click "Analyze RFT" if project has documents
  - Wait for work packages to be created
- Click on any work package to open it
- Wait for work package page to load

**Verify:**
- Work package page loads successfully
- URL is `/work-packages/[id]`

**Screenshot:** `02_work_package_loading.png`

---

### 3. Verify Step Progress Indicator

**Actions:**
- Observe top of page for step progress indicator

**Verify:**
- ✅ Step progress indicator displays with 5 steps:
  - Step 1: "New Tender"
  - Step 2: "Tender Planning"
  - Step 3: "Tender Outline"
  - Step 4: "Tender Content"
  - Step 5: "Tender Export"
- Current step (1 or 2) highlighted in green
- Completed steps show green checkmark
- Future steps shown in gray
- Connecting lines between steps visible

**Screenshot:** `03_step_progress_indicator.png`

---

### 4. Verify Step 1 - Requirements View (Improved Design)

**Actions:**
- Ensure on Step 1 (Requirements tab)
- Scroll to view all requirements

**Verify:**
- ✅ Page title displays work package document type (larger, bold)
- ✅ Requirements count badge displays at top right
- ✅ "Mandatory Requirements" section header visible (text-xl font-semibold)
- ✅ Each mandatory requirement card has:
  - Red left border (border-l-4 border-l-destructive)
  - "Mandatory" badge in destructive (red) variant
  - Requirement text with proper spacing
  - Source attribution in muted gray
  - Cards have proper spacing between them (space-y-3)
- ✅ "Optional Requirements" section (if any) similar styling
- ✅ Action buttons at bottom: "Back to Dashboard" and "Continue"

**Screenshot:** `04_requirements_view_improved.png`

---

### 5. Navigate to Step 2 - Tender Planning

**Actions:**
- Click "Continue" button
- Wait for Step 2 to load

**Verify:**
- Step 2 loads successfully
- URL or tab changes to strategy

**Screenshot:** `05_navigating_to_step_2.png`

---

### 6. Verify Tab Navigation in Step 2

**Actions:**
- Observe tab navigation at top of Step 2 content

**Verify:**
- ✅ Three tabs visible:
  - "Requirements" tab with checklist icon
  - "Bid/No Bid" tab with target icon
  - "Win Strategy" tab with trophy icon
- ✅ Active tab has green underline
- ✅ Inactive tabs have gray text
- ✅ Tabs are clickable

**Screenshot:** `06_step2_tab_navigation.png`

---

### 7. Verify Requirements Tab (Step 2)

**Actions:**
- Click on "Requirements" tab
- Wait for content to display

**Verify:**
- ✅ Requirements list displays in read-only format
- ✅ Card shows "Document Requirements" title
- ✅ Each requirement numbered (1., 2., etc.)
- ✅ Requirements show in bordered boxes with proper spacing
- ✅ Priority badges display (Mandatory/Optional)
- ✅ Source attribution visible

**Screenshot:** `07_step2_requirements_tab.png`

---

### 8. Verify Bid/No Bid Tab - Assessment Parameters Table

**Actions:**
- Click on "Bid/No Bid" tab
- Scroll to view full table

**Verify:**
- ✅ "2.2 | Assessment Parameters" header visible
- ✅ Info banner displays explaining scoring methodology
- ✅ "Total Score: 42%" badge at top right
- ✅ "Incumbent Status" dropdown visible with options
- ✅ Assessment table displays with columns:
  - **Criteria** (with name and description)
  - **Score (1-5)** (with colored indicator dot and score like "2.5 / 5")
  - **Weight** (percentage like "16.7%")
  - **Weighted Score** (decimal like "0.08")
- ✅ Table shows all 6 criteria:
  - Customer Relationship
  - Strategic Alignment
  - Competitive Positioning
  - Solution Capability
  - Resource Availability
  - Profitability Potential
- ✅ Each criterion has description text below name
- ✅ Score dots colored appropriately (gray for 0, red/yellow/green for 1-5)

**Screenshot:** `08_assessment_parameters_table.png`

---

### 9. Verify Bid Decision Recommendation Card

**Actions:**
- Scroll down to view Bid Decision Recommendation card (Section 2.3)

**Verify:**
- ✅ "2.3 | Bid Decision Recommendation" header visible
- ✅ Info banner about reviewing AI recommendation
- ✅ "AI Recommendation" section header
- ✅ "Regenerate Recommendation" button visible
- ✅ Recommendation badge displays:
  - "Not Recommended to Bid" OR "Recommended to Bid"
  - Appropriate color (red for no-bid, green for bid)
  - Alert/check icon
- ✅ Status text: "Analysis Complete - NO-BID" or "BID"
- ✅ Two columns layout:
  - **Key Strengths** (left column)
  - **Key Concerns** (right column)
- ✅ Strengths list with green checkmark icons
- ✅ Concerns in warning boxes (red background, alert icons)
- ✅ Multiple bullet points visible in each section

**Screenshot:** `09_bid_recommendation_card.png`

---

### 10. Verify Win Strategy Tab

**Actions:**
- Click on "Win Strategy" tab
- Wait for content to load

**Verify:**
- ✅ "Win Themes" card header visible
- ✅ Description text: "Identify 3-5 key messages..."
- ✅ "Regenerate All" button visible (if themes exist)
- ✅ Win themes display as cards/boxes with:
  - Green bullet dot or checkmark
  - Theme text
  - Edit button (pencil icon)
  - Delete button (trash icon, red)
- ✅ "Add Win Theme" button at bottom
- ✅ Proper spacing between theme cards

**Screenshot:** `10_win_strategy_tab.png`

---

### 11. Verify Content Generation Card (Always Visible)

**Actions:**
- Scroll to bottom of page
- Observe content generation card

**Verify:**
- ✅ "Content Generation" card visible below tabs
- ✅ Card has prominent border (border-2 border-primary/20)
- ✅ Three columns showing:
  - Document Type
  - Requirements count badge
  - Win Themes count badge
- ✅ "Generate Content" button visible (large, primary green)
- ✅ "Continue to Edit" button visible IF content already generated
- ✅ Estimated time text at bottom

**Screenshot:** `11_content_generation_card.png`

---

### 12. Verify Functional Behavior - Win Theme Editing

**Actions:**
- In Win Strategy tab, click Edit icon on any win theme
- Observe input field appears
- Type some text
- Click checkmark to save
- Verify theme updates

**Verify:**
- ✅ Edit mode activates (input field replaces text)
- ✅ Can type and edit text
- ✅ Checkmark saves changes
- ✅ Theme updates in UI

**Screenshot:** `12_win_theme_editing.png`

---

### 13. Verify Functional Behavior - Generate Content (if not already generated)

**Actions:**
- Ensure win themes exist (if not, wait for auto-generation)
- Click "Generate Content" button
- Observe loading state
- Wait for generation to complete (may take 1-2 minutes)

**Verify:**
- ✅ Button shows loading state with spinner
- ✅ Loading message displays
- ✅ After completion, either:
  - Redirected to Edit step
  - OR "Continue to Edit" button appears

**Screenshot:** `13_content_generation_loading.png`

---

### 14. Verify Step 3 (Editor) Remains Unchanged

**Actions:**
- Click "Continue to Edit" or navigate to Edit step
- Observe editor interface

**Verify:**
- ✅ Editor displays (TipTap editor)
- ✅ Editor functionality unchanged
- ✅ Toolbar visible
- ✅ Can type and edit content

**Screenshot:** `14_editor_unchanged.png`

---

### 15. Verify Responsive Behavior

**Actions:**
- Resize browser window to desktop size (1400px wide)
- Observe layout adapts

**Verify:**
- ✅ Step progress indicator scales appropriately
- ✅ Tab navigation remains horizontal
- ✅ Assessment table scrolls if needed
- ✅ Two-column layout in bid recommendation card
- ✅ No broken layouts or overflow issues

**Screenshot:** `15_responsive_desktop.png`

---

## Success Criteria

**All of the following must be true for test to PASS:**

- [ ] Step progress indicator displays with 5 numbered steps
- [ ] Step 1 (Requirements) has improved visual design with proper spacing
- [ ] Step 2 has tab navigation with 3 tabs (Requirements/Bid-No Bid/Win Strategy)
- [ ] Assessment Parameters table displays correctly with all columns and 6 criteria
- [ ] Bid Decision Recommendation card displays with recommendation, strengths, and concerns
- [ ] Win Strategy tab displays win themes with edit/delete functionality
- [ ] Content Generation card always visible at bottom
- [ ] All functional behavior works (editing win themes, generating content)
- [ ] No TypeScript errors or console errors
- [ ] Editor (Step 3) remains completely unchanged
- [ ] Responsive design works on desktop (1200px+)

## Expected Screenshots

1. `01_signed_in_dashboard.png` - Dashboard after login
2. `02_work_package_loading.png` - Work package page loading
3. `03_step_progress_indicator.png` - 5-step progress indicator
4. `04_requirements_view_improved.png` - Redesigned Step 1
5. `05_navigating_to_step_2.png` - Transition to Step 2
6. `06_step2_tab_navigation.png` - Tab navigation in Step 2
7. `07_step2_requirements_tab.png` - Requirements tab content
8. `08_assessment_parameters_table.png` - Assessment table
9. `09_bid_recommendation_card.png` - Bid recommendation
10. `10_win_strategy_tab.png` - Win Strategy tab
11. `11_content_generation_card.png` - Content generation card
12. `12_win_theme_editing.png` - Edit functionality
13. `13_content_generation_loading.png` - Generation in progress
14. `14_editor_unchanged.png` - Editor step unchanged
15. `15_responsive_desktop.png` - Responsive layout

## Notes

- This test focuses on UI/UX verification, not functional testing
- All existing functionality should continue to work without changes
- Test validates visual design matches requirements
- Performance is not a primary concern for this test

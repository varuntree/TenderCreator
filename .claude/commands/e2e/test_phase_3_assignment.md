# E2E Test: Phase 3 Work Package Assignment & Dashboard

Test the complete work package assignment workflow, dashboard UI, status tracking, and navigation.

**CRITICAL EXECUTION RULE:** If any test step fails, immediately fix the issue (debug, update code, resolve error), then restart from step 1. Iterate until ALL steps pass without errors.

## Pre-configured Test User

Use credentials from test_e2e.md:
- Email: test@tendercreator.dev
- Password: TestPass123!

## Prerequisites

Before starting this test, ensure:
- Phase 1 complete: Database schema, auth working
- Phase 2 complete: RFT analysis creates work packages
- Test project exists with analyzed work packages (from Phase 2 test)
- If no existing test project, create one and run Phase 2 analysis first

## Test Fixture Setup

If starting fresh, upload this test fixture:
- File: `test_fixtures/sample_rft_construction.txt`
- Upload to new project: "Phase 3 Dashboard Test"
- Run "Analyze RFT" to create work packages (Phase 2 functionality)
- Wait for analysis to complete (should create 8-10 work packages)

## Test Steps

### 1. Verify Dashboard Displays on Project Detail Page

**Actions:**
1. Sign in as test user (test@tendercreator.dev / TestPass123!)
2. Navigate to "Projects" page
3. Click on test project (should have status = 'in_progress' after Phase 2 analysis)
4. Verify project detail page loads

**Expected Results:**
- ✓ Page displays "Work Packages" heading
- ✓ Progress summary shows "0 of X completed" (where X = number of work packages)
- ✓ Dashboard grid displays with work package cards
- ✓ Grid layout shows 3 columns on desktop (use browser DevTools to verify width > 1024px)
- ✓ Each card shows:
  - Document type as heading
  - Requirement count badge (e.g., "[8]")
  - "Assigned to:" label with dropdown
  - "Status:" label with badge (gray "Not Started") and dropdown
  - "Open" button at bottom

**Validation:**
- Count visible cards = number of work packages from Phase 2 analysis
- All cards have same visual structure (consistent layout)
- No console errors in browser DevTools
- Page loads within 2 seconds

---

### 2. Test Assignment Dropdown - Select Mock User

**Actions:**
1. On first work package card (e.g., "Technical Specification"), click "Assigned to:" dropdown
2. Verify dropdown opens showing mock users:
   - Admin
   - Writer A
   - Writer B
3. Select "Writer A" from dropdown
4. Wait for dropdown to close

**Expected Results:**
- ✓ Dropdown displays all 3 mock users
- ✓ After selection, dropdown shows "Writer A" as selected value
- ✓ Card does not reload/flicker (optimistic update)
- ✓ No error toasts appear

**Browser DevTools Validation:**
- Open Network tab before selecting
- After selection, verify:
  - PUT request to `/api/work-packages/[id]/assign`
  - Request body contains: `{ "assigned_to": "mock_writer_a" }` (or similar)
  - Response status: 200
  - Response body contains updated work_package object
  - Response assigned_to field = authenticated user's actual UUID (NOT "mock_writer_a")

---

### 3. Verify Assignment Persistence

**Actions:**
1. After assigning "Writer A" in previous step, refresh the page (F5 or Cmd+R)
2. Wait for page to reload completely
3. Locate the same work package card

**Expected Results:**
- ✓ Assignment dropdown still shows "Writer A" selected
- ✓ Assignment persisted across page refresh
- ✓ All other work packages still show "Unassigned" (or previous assignments)

**Database Validation (Manual via Supabase Dashboard):**
- Open Supabase Dashboard > Table Editor > work_packages
- Find the assigned work package by document_type
- Verify assigned_to column contains authenticated user's UUID
- Verify UUID matches user ID from users table (test@tendercreator.dev user)

---

### 4. Test Status Change - Not Started to In Progress

**Actions:**
1. On the same work package card (assigned to "Writer A"), click status dropdown (next to "Not Started" badge)
2. Verify dropdown shows 3 options:
   - Not Started
   - In Progress
   - Completed
3. Select "In Progress"
4. Wait for dropdown to close

**Expected Results:**
- ✓ Status badge immediately changes from gray "Not Started" to yellow/orange "In Progress"
- ✓ Status badge icon changes (circle outline → half-filled circle or spinner)
- ✓ Status dropdown shows "In Progress" as selected
- ✓ Progress summary header updates to "0 of X completed" (still 0 since not completed)
- ✓ No console errors

**Browser DevTools Validation:**
- Network tab shows:
  - PUT request to `/api/work-packages/[id]/status`
  - Request body: `{ "status": "in_progress" }`
  - Response status: 200
  - Response body contains work_package with status = "in_progress"

---

### 5. Test Status Change - In Progress to Completed

**Actions:**
1. On same work package card, click status dropdown again
2. Select "Completed"
3. Observe badge and progress summary changes

**Expected Results:**
- ✓ Status badge changes from yellow "In Progress" to green "Completed"
- ✓ Status badge icon changes to checkmark circle
- ✓ Progress summary updates to "1 of X completed"
- ✓ Card remains in same grid position (no reordering)

**Validation:**
- Refresh page
- Verify status still shows "Completed" after refresh
- Verify progress summary still shows "1 of X completed"

---

### 6. Test Multiple Work Package Assignments

**Actions:**
1. Assign second work package to "Writer B"
2. Assign third work package to "Admin"
3. Change second work package status to "In Progress"
4. Change third work package status to "Completed"
5. Refresh page

**Expected Results:**
- ✓ All 3 assignments persist after refresh
- ✓ Second WP shows "Writer B", status "In Progress" (yellow badge)
- ✓ Third WP shows "Admin", status "Completed" (green badge)
- ✓ Progress summary shows "2 of X completed" (first + third)
- ✓ No assignments or statuses lost

**Consistency Check:**
- All dropdowns respond immediately
- No conflicting states between cards
- Progress summary math is correct

---

### 7. Test Navigation - Open Work Package Detail

**Actions:**
1. Click "Open" button on first work package card (Technical Specification)
2. Wait for navigation to complete

**Expected Results:**
- ✓ URL changes to `/work-packages/[id]` (where [id] is work package UUID)
- ✓ Work package detail page loads
- ✓ Page displays:
  - Breadcrumb navigation: "Project Name > Technical Specification"
  - Work package metadata card showing:
    - Document type: "Technical Specification"
    - Requirements count: "8 requirements"
    - Current status: "Completed" badge (from previous steps)
    - Assigned to: "Admin" (or current assignment)
  - Placeholder section with heading: "Content Workflow Coming in Phase 4"
  - Subtitle: "Requirements → Strategy → Generate → Edit → Export"
  - "← Back to Project" button
  - "Continue to Workflow →" button (disabled with tooltip)

**Validation:**
- No console errors on page load
- All metadata matches work package from database
- Page layout matches TenderCreator design aesthetic

---

### 8. Test Navigation - Back to Project

**Actions:**
1. From work package detail page (opened in previous step), click "← Back to Project" button
2. Wait for navigation

**Expected Results:**
- ✓ Returns to project detail page
- ✓ Dashboard still displays with all work packages
- ✓ Work package that was opened still shows correct assignment and status
- ✓ Progress summary unchanged
- ✓ No state lost during navigation

---

### 9. Test Continue to Workflow Button

**Actions:**
1. On project detail page, locate "Continue to Workflow" button (should be visible if work packages exist)
2. Click button
3. Observe navigation

**Expected Results:**
- ✓ Navigates to first work package in list (ordered by work_packages.order field)
- ✓ Work package detail page loads for first work package
- ✓ Same page structure as step 7

**Validation:**
- URL should be `/work-packages/[id]` where [id] is the first work package ID
- Breadcrumb shows correct document type for first work package

---

### 10. Test Add Custom Document from Dashboard

**Actions:**
1. Navigate back to project detail page (dashboard view)
2. Click "Add Custom Document" button (below work package grid or in header)
3. Dialog/modal opens (Phase 2 component reused)
4. Enter document type: "Insurance Certificates"
5. Enter description (optional): "Required insurance coverage documentation"
6. Click "Search for Requirements" button
7. Wait for AI to search RFT (may find 0-3 requirements)
8. Review found requirements (if any)
9. Click "Add Document" button
10. Wait for dialog to close

**Expected Results:**
- ✓ Dialog closes after adding
- ✓ New work package card appears in dashboard grid
- ✓ Card shows:
  - Document type: "Insurance Certificates"
  - Requirement count: [N] (where N = found requirements)
  - Status: "Not Started" (gray badge)
  - Assignment: "Unassigned"
- ✓ Progress summary updates total count: "2 of X+1 completed"
- ✓ Card appears at end of grid or in correct order

**Validation:**
- Refresh page
- Verify new work package persists
- Click "Open" on new card
- Verify detail page shows correct document type and requirements

---

### 11. Test Work Package Deletion

**Actions:**
1. On dashboard, locate a work package card to delete (choose one NOT completed to avoid affecting progress)
2. Identify delete button/icon on card (typically trash icon in header or actions area)
3. Click delete button
4. If confirmation dialog appears, click "Confirm" or "Delete"
5. Wait for card to disappear

**Expected Results:**
- ✓ Confirmation dialog appears (shadcn AlertDialog)
- ✓ Dialog shows warning: "Are you sure you want to delete this work package?"
- ✓ After confirming, card immediately disappears from grid
- ✓ Grid re-flows (remaining cards fill the space)
- ✓ Progress summary updates if deleted WP was completed
- ✓ Total count decreases: "2 of X-1 completed" (or similar)

**Browser DevTools Validation:**
- Network tab shows:
  - DELETE request to `/api/work-packages/[id]`
  - Response status: 200 or 204
  - No errors in console

**Persistence Check:**
- Refresh page
- Verify deleted work package does not reappear
- Verify database no longer contains deleted work package (Supabase Table Editor)

---

### 12. Test Responsive Layout - Tablet View

**Actions:**
1. Open browser DevTools (F12)
2. Enable responsive design mode (toggle device toolbar)
3. Set viewport width to 768px (iPad)
4. Observe dashboard grid layout

**Expected Results:**
- ✓ Grid displays 2 columns (not 3)
- ✓ Cards resize to fit 2-column layout
- ✓ All card content visible (no overflow or cut-off text)
- ✓ Dropdowns and buttons still functional
- ✓ No horizontal scrollbar

**Actions (continued):**
5. Set viewport width to 375px (iPhone)
6. Observe layout changes

**Expected Results:**
- ✓ Grid displays 1 column
- ✓ Cards stack vertically
- ✓ All content readable on mobile width
- ✓ Touch targets large enough (buttons, dropdowns)
- ✓ No horizontal overflow

**Return to Desktop:**
7. Set viewport back to 1440px (desktop)
8. Verify grid returns to 3 columns

---

### 13. Test Empty State - Zero Work Packages

**Setup:**
1. Create a new project: "Empty Dashboard Test"
2. Do NOT upload RFT or run analysis (leave at status = 'setup')
3. Manually change project status to 'in_progress' via Supabase Dashboard (to force dashboard display)
   - OR delete all work packages from existing project via Supabase

**Actions:**
1. Navigate to project detail page
2. Observe dashboard display

**Expected Results:**
- ✓ Dashboard shows empty state (no cards)
- ✓ Empty state displays:
  - Icon (document question mark or similar)
  - Heading: "No work packages yet"
  - Description text explaining how to add work packages
  - "Add Custom Document" button (prominent)
- ✓ No "Continue to Workflow" button visible (requires work packages)
- ✓ Progress summary shows "0 of 0 completed" (or hides entirely)

**Actions (continued):**
3. Click "Add Custom Document" button
4. Add a document: "Test Document"
5. Verify empty state disappears and card appears

---

### 14. Test Progress Summary Calculation

**Setup:**
Use project with multiple work packages (at least 5)

**Actions:**
1. Set work package statuses as follows:
   - WP 1: Completed
   - WP 2: Completed
   - WP 3: In Progress
   - WP 4: In Progress
   - WP 5: Not Started
2. After each status change, observe progress summary header

**Expected Results:**
- After WP 1 completed: "1 of 5 completed"
- After WP 2 completed: "2 of 5 completed"
- After WP 3 in progress: "2 of 5 completed" (no change)
- After WP 4 in progress: "2 of 5 completed" (no change)
- After WP 5 not started: "2 of 5 completed" (no change)

**Actions (continued):**
3. Change WP 3 from "In Progress" to "Completed"
4. Observe summary

**Expected Results:**
- Progress summary updates to "3 of 5 completed"
- Math is correct (only counts completed status)

**Actions (continued):**
5. Change WP 1 from "Completed" back to "In Progress"
6. Observe summary

**Expected Results:**
- Progress summary updates to "2 of 5 completed" (decreases)
- Reversing completion works correctly

---

### 15. Test Breadcrumb Navigation

**Actions:**
1. Navigate to any work package detail page (click "Open" on a card)
2. Observe breadcrumb at top of page
3. Click on project name in breadcrumb

**Expected Results:**
- ✓ Breadcrumb displays: "Project Name > Document Type"
- ✓ Project name is clickable link
- ✓ Clicking project name navigates back to project detail page
- ✓ Same result as "Back to Project" button

---

### 16. Test Concurrent Assignment Changes (Data Consistency)

**Setup:**
1. Open same project in two different browser tabs (or two browsers)
2. Both tabs showing project dashboard

**Actions:**
1. In Tab 1: Assign WP 1 to "Writer A"
2. In Tab 2: Refresh page
3. Verify Tab 2 shows WP 1 assigned to "Writer A"
4. In Tab 2: Change WP 1 status to "In Progress"
5. In Tab 1: Refresh page
6. Verify Tab 1 shows WP 1 status "In Progress"

**Expected Results:**
- ✓ Changes in one tab persist and are visible in other tab after refresh
- ✓ No data conflicts or lost updates
- ✓ Database is source of truth

---

### 17. Test UI Design Consistency with TenderCreator

**Manual Visual Check:**
1. Open `ai_docs/ui_reference/` folder in Finder
2. View TenderCreator reference screenshots
3. Compare side-by-side with rendered dashboard

**Checklist:**
- ✓ Card shadows match (subtle, increase on hover)
- ✓ Border radius = 8px (rounded-lg)
- ✓ Card padding ~24px (p-6 in Tailwind)
- ✓ Gap between cards ~24px (gap-6)
- ✓ Primary green color matches TenderCreator
- ✓ Status badge colors: gray, yellow/orange, green
- ✓ Typography sizes match (headings, body, labels)
- ✓ Button styles match (filled primary, outlined secondary)
- ✓ Overall layout feels cohesive with TenderCreator aesthetic

**If Deviations Found:**
- Document specific differences (screenshot + description)
- Adjust CSS in app/globals.css or component styles
- Re-run visual check until aligned

---

### 18. Test Error Handling - API Failure

**Simulate API Error:**
1. Open browser DevTools > Network tab
2. Enable network throttling to "Offline"
3. On dashboard, attempt to assign a work package
4. Observe behavior

**Expected Results:**
- ✓ Assignment dropdown shows loading state briefly
- ✓ Error toast notification appears: "Failed to update assignment" (or similar)
- ✓ Dropdown reverts to previous value (unassigned or previous assignment)
- ✓ User can retry after re-enabling network

**Actions (continued):**
5. Disable network throttling (back to "Online")
6. Retry assignment
7. Verify success

**Repeat for Status Change:**
8. Enable offline mode
9. Attempt status change
10. Verify error toast, badge reverts to previous status
11. Re-enable network, retry, verify success

---

### 19. Test Keyboard Navigation (Accessibility)

**Actions:**
1. Navigate to dashboard
2. Press Tab key repeatedly
3. Observe focus indicators

**Expected Results:**
- ✓ Focus moves through interactive elements in logical order:
  - First card: Assignment dropdown → Status dropdown → Open button
  - Second card: Assignment dropdown → Status dropdown → Open button
  - (etc. for all cards)
  - "Add Custom Document" button
- ✓ Focus indicators clearly visible (outline or ring)
- ✓ Can open dropdowns with Enter/Space key
- ✓ Can navigate dropdown options with arrow keys
- ✓ Can select with Enter key
- ✓ Can close dropdowns with Escape key

**Screen Reader Test (Optional if available):**
- Enable VoiceOver (Mac) or NVDA (Windows)
- Navigate through dashboard
- Verify announcements:
  - "Work package: Technical Specification"
  - "Assigned to: Writer A"
  - "Status: In Progress"
  - Progress summary announced correctly

---

### 20. Final Validation - Complete User Journey

**Full Workflow Test (No Breaks):**
1. Sign in as test user
2. Navigate to Projects
3. Create new project: "Final E2E Test Project"
4. Upload `test_fixtures/sample_rft_construction.txt`
5. Click "Analyze RFT"
6. Wait for analysis to complete (should create 8-10 work packages)
7. Verify dashboard displays with all work packages
8. Assign 3 work packages to different mock users
9. Change 2 work packages to "In Progress"
10. Change 1 work package to "Completed"
11. Verify progress summary shows "1 of X completed"
12. Click "Open" on completed work package
13. Verify detail page loads correctly
14. Click "Back to Project"
15. Click "Continue to Workflow"
16. Verify navigates to first work package
17. Return to dashboard
18. Add custom document: "Additional Requirements"
19. Verify new card appears
20. Delete one work package
21. Verify card disappears, total count decreases
22. Refresh page multiple times
23. Verify all changes persist

**Success Criteria:**
- ✓ All 23 actions complete without errors
- ✓ No console errors throughout entire flow
- ✓ No broken UI states
- ✓ All data persists across refreshes
- ✓ Navigation works bidirectionally
- ✓ Progress tracking accurate
- ✓ UI polished and professional

---

## Post-Test Validation

After completing all test steps:

### Database Consistency Check
1. Open Supabase Dashboard > Table Editor > work_packages
2. Verify:
   - assigned_to fields contain actual user UUIDs (not mock IDs)
   - status fields only contain: 'not_started', 'in_progress', or 'completed'
   - All work packages belong to correct project_id
   - No orphaned work packages (project_id references existing project)

### Code Quality Check
1. Run `npm run build` - verify no TypeScript errors
2. Check browser console - verify no React warnings or errors
3. Review Network tab - verify all API calls return 200 status
4. Check for any TODO comments left in code

### Performance Check
1. Measure page load time (project detail with dashboard)
   - Should load within 2 seconds on fast connection
2. Measure assignment update response time
   - Should complete within 500ms
3. Check for any memory leaks (DevTools Memory profiler)
   - Dashboard should not accumulate memory with repeated interactions

## Success Criteria Summary

**All tests must pass:**
- ✓ Dashboard displays correctly with card grid layout
- ✓ Assignment dropdowns show mock users and save to database
- ✓ Status changes update badges and persist
- ✓ Progress summary calculates correctly
- ✓ Navigation between project and work packages works bidirectionally
- ✓ Add custom document functionality preserved from Phase 2
- ✓ Work package deletion works with confirmation
- ✓ Responsive layout adapts to mobile/tablet/desktop
- ✓ Empty state displays when no work packages
- ✓ UI matches TenderCreator design aesthetic
- ✓ Error handling graceful (API failures, network issues)
- ✓ Keyboard navigation and accessibility working
- ✓ All data persists across page refreshes
- ✓ No console errors or warnings
- ✓ Database contains correct data (assigned_to = real user IDs)

## Failure Recovery

If any test step fails:
1. Document the exact failure (screenshot, error message, console logs)
2. Debug and fix the issue in code
3. Restart test from step 1 (ensure no state contamination)
4. Iterate until all steps pass cleanly

**Common Issues:**
- Assignment not persisting: Check API route saves authenticated user ID, not mock ID
- Status badge not updating: Verify optimistic update logic and API call success
- Navigation broken: Check route structure and Next.js router.push calls
- Grid layout incorrect: Verify Tailwind responsive classes (md:, lg:)
- Progress summary wrong: Check filter logic for completed count

## Test Completion

When all 20 test steps pass without errors:
- ✓ Phase 3 is complete and validated
- ✓ Ready to proceed to Phase 4 (Single Document Workflow)
- ✓ Work package infrastructure ready for content generation
- ✓ Dashboard provides project management and progress tracking
- ✓ Multi-user concept demonstrated (even if single-user functional)

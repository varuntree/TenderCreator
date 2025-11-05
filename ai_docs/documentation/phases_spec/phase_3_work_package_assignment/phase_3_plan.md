# Phase: Work Package Assignment & Project Dashboard

## Phase Description

Phase 3 transforms the Document Requirements Matrix from Phase 2 into an interactive project dashboard with work package assignment and status tracking. Users can assign work packages to team members via dropdown selectors (mock users hardcoded in frontend), track progress with visual status indicators (not_started, in_progress, completed), and navigate into individual work package workflows. The dashboard displays all work packages as status cards in a grid layout matching TenderCreator's design, with each card showing document type, assignment, requirement count, and current status. This phase bridges analysis (Phase 2) and content generation (Phase 4) by providing the organizational layer needed to manage multiple parallel document workflows. While assignment is UI-only for MVP (single user), the database saves assigned_to fields to prepare for future multi-user functionality.

## Phase Objectives

- Replace Document Requirements Matrix table with card-based project dashboard UI
- Implement assignment dropdown with hardcoded mock users (Admin, Writer A, Writer B)
- Save assigned_to field to database when assignment selected (single user in practice)
- Add status badges and progress indicators to work package cards
- Create status transition functionality (manual dropdown in dashboard)
- Build "Open" button navigation from dashboard to work package detail route
- Implement route structure for work package workflow pages (Phase 4 readiness)
- Update project detail page to show dashboard when status = 'in_progress'
- Style cards matching TenderCreator aesthetic with proper spacing and shadows

## Problem Statement

After Phase 2, users have identified work packages but no way to organize or track them:
- **No visual organization** - Table view from Phase 2 is analysis-focused, not workflow-ready
- **No assignment UI** - Can't demonstrate team collaboration concept (even if single user)
- **No status tracking** - All packages stuck at "not_started" with no way to change
- **No navigation** - Can't enter individual work package workflows
- **No progress visibility** - Project dashboard doesn't show completion state

Without this phase, users cannot:
- See project progress at a glance
- Demonstrate multi-user workflow (key differentiator vs TenderCreator)
- Navigate to content generation (Phase 4)
- Track which documents are complete vs in-progress

## Solution Statement

Build a card-based project dashboard replacing the Phase 2 table, where each work package displays as a status card showing document type, assigned user, requirement count, and current status. Hardcode mock users in frontend (Admin, Writer A, Writer B) displayed via shadcn Select dropdown. When user selects assignment, save to work_packages.assigned_to field using current authenticated user's ID (single user functional, but UI shows concept). Add status dropdown allowing manual transitions between not_started/in_progress/completed with color-coded badges. Create "Open" button on each card navigating to `/work-packages/[id]` route structure. Implement work package detail page shell (empty for Phase 3, Phase 4 will fill with workflow). Update project detail page to conditionally render dashboard when project status is 'in_progress'. Style cards with TenderCreator design tokens, 3-column grid layout, hover effects, and smooth transitions. Preserve Phase 2's "Add Custom Document" functionality within new dashboard layout.

## Dependencies

### Previous Phases

**Phase 1 (Core Schema & Project Structure)** - Required:
- `work_packages` table with assigned_to and status fields
- User authentication and user_id available
- Project detail page at `/projects/[id]`
- Repository pattern established

**Phase 2 (AI Analysis & Document Decomposition)** - Required:
- Work packages created via RFT analysis
- `listWorkPackages` repository function
- `updateWorkPackage` repository function for assignment/status changes
- Project status 'in_progress' set after analysis completes
- Document Requirements Matrix component (will be replaced but logic reused)

### External Dependencies

No new external dependencies. Uses existing:
- shadcn/ui components (Card, Select, Badge already installed)
- Supabase client for database updates
- Next.js routing for navigation

## Relevant Files

**Existing files from previous phases:**
- `libs/repositories/work-packages.ts` - Work package repository (extend with assignment/status updates)
- `libs/repositories/projects.ts` - Project repository (no changes needed)
- `app/(dashboard)/projects/[id]/page.tsx` - Project detail page (update to show dashboard)
- `components/document-requirements-matrix.tsx` - Phase 2 component (reference for logic, replace UI)
- `app/globals.css` - Design tokens (verify TenderCreator card styling)
- `ai_docs/ui_reference/` - TenderCreator screenshots (reference for dashboard design)

### New Files

**UI Components** (`components/`):
- `components/work-package-card.tsx` - Status card for dashboard grid
  - Displays: document_type, requirement count, assigned user, status badge, "Open" button
  - Props: workPackage, onAssignmentChange, onStatusChange, onClick (navigate)
  - Uses shadcn Card, Select, Badge components
  - Match TenderCreator card design (shadow, rounded corners, padding)

- `components/work-package-dashboard.tsx` - Main dashboard grid container
  - Props: projectId, workPackages, onUpdate
  - 3-column grid layout (responsive)
  - Maps workPackages to WorkPackageCard components
  - "Add Custom Document" button at bottom (reuse Phase 2 dialog)
  - Empty state if no work packages
  - Progress summary header (X/Y completed)

- `components/user-select.tsx` - Assignment dropdown with mock users
  - Hardcoded users: [{ id: 'mock_admin', name: 'Admin' }, { id: 'mock_writer_a', name: 'Writer A' }, { id: 'mock_writer_b', name: 'Writer B' }]
  - shadcn Select component
  - On change: calls API to update assigned_to (saves current user's actual ID)
  - Display shows mock name, saves real user ID to DB

- `components/status-badge.tsx` - Status indicator component
  - Props: status ('not_started' | 'in_progress' | 'completed')
  - Color-coded badges: gray (not_started), yellow (in_progress), green (completed)
  - shadcn Badge component with custom variants

**API Routes** (`app/api/`):
- `app/api/work-packages/[id]/assign/route.ts` - PUT update assigned_to field
  - Body: { assigned_to: string } (accepts mock user ID, saves actual user ID)
  - Returns updated work package

- `app/api/work-packages/[id]/status/route.ts` - PUT update status field
  - Body: { status: 'not_started' | 'in_progress' | 'completed' }
  - Returns updated work package

**UI Pages** (`app/(dashboard)/`):
- `app/(dashboard)/work-packages/[id]/page.tsx` - Work package detail page (shell)
  - Server Component fetching work package by ID
  - Display work package metadata (document_type, requirements count, status)
  - Placeholder message: "Workflow coming in Phase 4"
  - "Back to Project" button navigating to parent project
  - Phase 4 will replace with full workflow (requirements → strategy → generate → edit)

**Repository Updates**:
- `libs/repositories/work-packages.ts` - Add functions:
  - `updateWorkPackageAssignment(supabase, id, userId)` - Update assigned_to field
  - `updateWorkPackageStatus(supabase, id, status)` - Update status field
  - `getWorkPackageWithProject(supabase, id)` - Get work package + parent project info

**Test Documentation**:
- `.claude/commands/e2e/test_phase_3_assignment.md` - E2E test for assignment and dashboard

## Acceptance Criteria

✓ Project detail page shows Work Package Dashboard when project status = 'in_progress'
✓ Dashboard displays all work packages in 3-column card grid layout
✓ Each card shows: document type, requirement count, assigned user, status badge, "Open" button
✓ Assignment dropdown per card shows mock users: Admin, Writer A, Writer B
✓ Selecting assignment saves current user's ID to work_packages.assigned_to field
✓ Assignment dropdown displays selected mock user name after save
✓ Status dropdown per card shows: Not Started, In Progress, Completed
✓ Selecting status updates work_packages.status field and badge color changes
✓ Status badges are color-coded: gray (not started), yellow (in progress), green (completed)
✓ Progress summary header shows "X of Y completed" count
✓ "Open" button navigates to `/work-packages/[id]` route
✓ Work package detail page displays work package metadata
✓ Work package detail page shows "Workflow coming in Phase 4" placeholder
✓ "Back to Project" button returns to project detail page
✓ "Add Custom Document" button still works from dashboard (Phase 2 functionality)
✓ Empty state displays when no work packages exist with "Add Custom Document" CTA
✓ Cards match TenderCreator design: rounded corners, shadows, proper padding
✓ Hover effects on cards (subtle background change or scale)
✓ Grid is responsive (3 cols desktop, 2 cols tablet, 1 col mobile)
✓ All API updates use repository pattern and return standard response format
✓ Database assigned_to field contains actual authenticated user ID (not mock ID)
✓ No TypeScript errors, build succeeds

## Step by Step Tasks

**EXECUTION RULES:**
- Execute ALL steps below in exact order
- Check Acceptance Criteria - all items are REQUIRED
- Do NOT skip UI/frontend steps if in acceptance criteria
- If blocked, document and continue other steps

### 1. Update Work Package Repository

**File:** `libs/repositories/work-packages.ts`

- Add `updateWorkPackageAssignment` function:
  ```typescript
  async function updateWorkPackageAssignment(
    supabase: SupabaseClient,
    workPackageId: string,
    userId: string
  ): Promise<WorkPackage>
  ```
  - Update work_packages.assigned_to = userId WHERE id = workPackageId
  - Return updated work package record
  - Throw error if not found or update fails

- Add `updateWorkPackageStatus` function:
  ```typescript
  async function updateWorkPackageStatus(
    supabase: SupabaseClient,
    workPackageId: string,
    status: 'not_started' | 'in_progress' | 'completed'
  ): Promise<WorkPackage>
  ```
  - Update work_packages.status = status WHERE id = workPackageId
  - Return updated work package record

- Add `getWorkPackageWithProject` function:
  ```typescript
  async function getWorkPackageWithProject(
    supabase: SupabaseClient,
    workPackageId: string
  ): Promise<{ workPackage: WorkPackage, project: Project }>
  ```
  - Fetch work package by ID
  - Join with projects table to get parent project
  - Return both work package and project data
  - Needed for work package detail page navigation

- Export all new functions from repository index

### 2. Create Assignment API Route

**File:** `app/api/work-packages/[id]/assign/route.ts`

- Implement PUT handler:
  - Extract work package ID from params
  - Validate auth using withAuth wrapper
  - Parse body: `{ assigned_to: string }` (mock user ID, ignored)
  - Get authenticated user ID from supabase.auth.getUser()
  - Call `updateWorkPackageAssignment(supabase, workPackageId, authenticatedUserId)`
  - Return standard success response with updated work package
  - Error handling: 404 if work package not found, 401 if unauthorized

### 3. Create Status Update API Route

**File:** `app/api/work-packages/[id]/status/route.ts`

- Implement PUT handler:
  - Extract work package ID from params
  - Validate auth
  - Parse body: `{ status: string }`
  - Validate status is one of: 'not_started', 'in_progress', 'completed'
  - Call `updateWorkPackageStatus(supabase, workPackageId, status)`
  - Return standard success response with updated work package
  - Error handling: 400 if invalid status, 404 if not found

---
✅ CHECKPOINT: Steps 1-3 complete (Backend/Repository layer). Continue to step 4.
---

### 4. Create Status Badge Component

**File:** `components/status-badge.tsx`

- Client Component (if using custom styling) or Server Component (if purely presentational)
- Props interface:
  ```typescript
  interface StatusBadgeProps {
    status: 'not_started' | 'in_progress' | 'completed'
    className?: string
  }
  ```
- Use shadcn Badge component with variant mapping:
  - 'not_started' → gray/secondary variant, text: "Not Started", icon: circle outline
  - 'in_progress' → yellow/warning variant, text: "In Progress", icon: half-filled circle
  - 'completed' → green/success variant, text: "Completed", icon: checkmark circle
- Import lucide-react icons: Circle, CircleDashed, CheckCircle
- Return Badge with appropriate variant and icon
- Match TenderCreator badge styling (reference ui_reference screenshots)

### 5. Create User Select Component

**File:** `components/user-select.tsx`

- Client Component ('use client')
- Props interface:
  ```typescript
  interface UserSelectProps {
    workPackageId: string
    currentAssignment?: string // Mock user ID for display
    onAssignmentChange: (mockUserId: string) => void
  }
  ```
- Hardcode mock users array:
  ```typescript
  const MOCK_USERS = [
    { id: 'mock_admin', name: 'Admin', avatar: 'A' },
    { id: 'mock_writer_a', name: 'Writer A', avatar: 'WA' },
    { id: 'mock_writer_b', name: 'Writer B', avatar: 'WB' }
  ]
  ```
- Use shadcn Select component:
  - Trigger shows selected user name or "Unassigned" if null
  - Options map MOCK_USERS array
  - On value change: call onAssignmentChange with mock user ID
- Parent component handles API call to save actual user ID
- Display only - actual DB stores real authenticated user ID

### 6. Create Work Package Card Component

**File:** `components/work-package-card.tsx`

- Client Component
- Props interface:
  ```typescript
  interface WorkPackageCardProps {
    workPackage: WorkPackage
    onAssignmentChange: (workPackageId: string, mockUserId: string) => Promise<void>
    onStatusChange: (workPackageId: string, status: string) => Promise<void>
    onOpen: (workPackageId: string) => void
  }
  ```
- Use shadcn Card component (CardHeader, CardContent, CardFooter)
- Card structure:
  - **Header**: Document type (heading), requirement count badge
  - **Content**:
    - Assignment row: "Assigned to:" label + UserSelect component
    - Status row: "Status:" label + StatusBadge + status Select dropdown
  - **Footer**: "Open" button (shadcn Button, variant outline)
- Styling:
  - Rounded corners (rounded-lg)
  - Subtle shadow (shadow-sm, shadow-md on hover)
  - Padding matching TenderCreator cards (p-6)
  - Hover effect: scale slightly or background color change
  - Smooth transitions (transition-all duration-200)
- Status dropdown (separate from badge):
  - Use shadcn Select component
  - Options: Not Started, In Progress, Completed
  - On change: call onStatusChange handler
  - Current status selected by default
- Assignment handling:
  - UserSelect onAssignmentChange calls parent onAssignmentChange
  - Parent makes API call, updates local state
  - Shows loading state during update (optional)
- Open button:
  - Click triggers onOpen(workPackage.id)
  - Parent handles navigation to work package detail route

### 7. Create Work Package Dashboard Component

**File:** `components/work-package-dashboard.tsx`

- Client Component
- Props interface:
  ```typescript
  interface WorkPackageDashboardProps {
    projectId: string
    workPackages: WorkPackage[]
    onUpdate: () => void // Callback to refresh data
  }
  ```
- Component structure:
  - **Header section**:
    - "Work Packages" heading
    - Progress summary: "{completedCount} of {totalCount} completed"
    - "Add Custom Document" button (right-aligned)
  - **Grid section**:
    - 3-column grid (grid-cols-1 md:grid-cols-2 lg:grid-cols-3)
    - Gap between cards (gap-6)
    - Map workPackages to WorkPackageCard components
  - **Empty state**:
    - If workPackages.length === 0
    - Show message: "No work packages yet"
    - Prominent "Add Custom Document" button
    - Use shadcn Alert or Card for empty state container
- Assignment change handler:
  - Make PUT request to `/api/work-packages/[id]/assign`
  - Body: { assigned_to: mockUserId } (backend ignores, uses auth user)
  - On success: call onUpdate to refresh
  - On error: show toast notification (shadcn Toast)
- Status change handler:
  - Make PUT request to `/api/work-packages/[id]/status`
  - Body: { status: newStatus }
  - On success: call onUpdate to refresh
  - On error: show toast
- Open handler:
  - Use Next.js router.push to navigate to `/work-packages/[id]`
  - Import { useRouter } from 'next/navigation'
- "Add Custom Document" button:
  - Opens AddDocumentDialog from Phase 2
  - Import existing component: `components/add-document-dialog.tsx`
  - On document added: call onUpdate to refresh
- Progress calculation:
  - completedCount = workPackages.filter(wp => wp.status === 'completed').length
  - totalCount = workPackages.length
  - Display as fraction and percentage (optional)

### 8. Update Project Detail Page

**File:** `app/(dashboard)/projects/[id]/page.tsx`

- This is a Server Component
- Current behavior (from Phase 2):
  - Fetches project and work packages
  - Shows AnalysisTrigger if status = 'setup'
  - Shows DocumentRequirementsMatrix if status = 'in_progress'
- **Change**: Replace DocumentRequirementsMatrix with WorkPackageDashboard
  - Import WorkPackageDashboard component
  - When project.status === 'in_progress', render:
    ```tsx
    <WorkPackageDashboard
      projectId={project.id}
      workPackages={workPackages}
      onUpdate={() => router.refresh()} // Revalidate server data
    />
    ```
- Keep existing functionality:
  - Project metadata display (name, client, deadline)
  - Edit project button
  - Delete project button
  - File upload for RFT documents (if status = 'setup')
  - AnalysisTrigger button (if status = 'setup')
- Add "Continue to Workflow" button:
  - Only show if workPackages.length > 0 AND status = 'in_progress'
  - Click navigates to first work package: `/work-packages/${workPackages[0].id}`
  - Use shadcn Button, variant default, size lg
  - Position below dashboard or in header
- Preserve Phase 2 "Add Custom Document" functionality:
  - Now embedded within WorkPackageDashboard component
  - No separate trigger needed on page

### 9. Create Work Package Detail Page

**File:** `app/(dashboard)/work-packages/[id]/page.tsx`

- Server Component
- Fetch work package and project using repository:
  ```typescript
  const supabase = createServerClient()
  const { workPackage, project } = await getWorkPackageWithProject(supabase, params.id)
  ```
- Verify user has access (RLS handles, but check for better error)
- Page structure:
  - Breadcrumb navigation: Project Name > Document Type
  - Work package metadata card:
    - Document type (heading)
    - Description (if exists)
    - Requirements count
    - Current status (StatusBadge)
    - Assigned to (display name - use UserSelect for consistency)
  - Placeholder section:
    - Large centered message: "Content Workflow Coming in Phase 4"
    - Subtitle: "Requirements → Strategy → Generate → Edit → Export"
    - Illustration or icon (optional)
  - Navigation buttons:
    - "← Back to Project" button (navigates to `/projects/${project.id}`)
    - "Continue to Workflow →" button (disabled, tooltip: "Available in Phase 4")
- Use shadcn Card for metadata display
- Match TenderCreator page layout (centered content, max-width container)
- This page is a shell - Phase 4 will replace placeholder with actual workflow tabs

---
✅ CHECKPOINT: Steps 4-9 complete (Frontend/UI layer). Continue to step 10.
---

### 10. Update Design Tokens for Card Styling

**File:** `app/globals.css`

- Review TenderCreator reference screenshots in `ai_docs/ui_reference/`
- Ensure CSS variables match card design:
  - Shadow values: `--shadow-sm`, `--shadow-md`, `--shadow-lg`
  - Card background: `--card` (should be white or off-white)
  - Card foreground: `--card-foreground`
  - Border radius: `--radius` (8px for cards)
  - Hover state colors for cards
- Add custom utility classes if needed:
  ```css
  .card-hover {
    transition: all 200ms ease;
  }
  .card-hover:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
  }
  ```
- Verify shadcn Card component uses these tokens correctly

### 11. Add Status Badge Variants to Tailwind Config

**File:** `tailwind.config.ts` (or `tailwind.config.js`)

- Extend theme with custom badge colors if not already present:
  ```typescript
  extend: {
    colors: {
      'badge-not-started': 'hsl(var(--muted))',
      'badge-in-progress': 'hsl(var(--warning))', // Yellow
      'badge-completed': 'hsl(var(--success))', // Green
    }
  }
  ```
- Add to `app/globals.css`:
  ```css
  :root {
    --warning: 45 93% 47%; /* Yellow HSL */
    --success: 142 71% 45%; /* Green HSL */
  }
  ```
- Ensure StatusBadge component uses these values

### 12. Create Mock User Avatar Component (Optional Enhancement)

**File:** `components/user-avatar.tsx` (optional)

- Small circular avatar showing user initials
- Props: `{ name: string, size?: 'sm' | 'md' | 'lg' }`
- Use shadcn Avatar component
- Display first letter of name in circle
- Random background color based on name hash (consistent per name)
- Use in UserSelect dropdown for visual polish
- Match TenderCreator user avatar design if visible in screenshots

### 13. Test Assignment Flow End-to-End

**Manual Test**:
- Sign in as test user
- Navigate to project with work packages (from Phase 2)
- Verify dashboard displays with cards
- Select "Writer A" in assignment dropdown on first card
- Open browser DevTools > Network tab
- Verify PUT request to `/api/work-packages/[id]/assign`
- Check request body contains assigned_to
- Verify response shows updated work package
- Refresh page
- Verify assignment persisted (UserSelect shows "Writer A")
- Check database: assigned_to should be authenticated user's actual ID, not mock ID

### 14. Test Status Transitions

**Manual Test**:
- On same work package card, open status dropdown
- Change from "Not Started" to "In Progress"
- Verify badge color changes to yellow immediately
- Verify PUT request to `/api/work-packages/[id]/status` in Network tab
- Refresh page
- Verify status persisted (badge shows "In Progress", dropdown selected)
- Change to "Completed"
- Verify badge turns green
- Check progress summary header updates: "1 of X completed"

### 15. Test Navigation Flow

**Manual Test**:
- Click "Open" button on a work package card
- Verify navigation to `/work-packages/[id]`
- Verify work package detail page loads showing:
  - Breadcrumb navigation
  - Work package metadata
  - "Workflow Coming in Phase 4" placeholder
- Click "Back to Project" button
- Verify returns to project detail page with dashboard
- From project page, click "Continue to Workflow" button
- Verify navigates to first work package in list

### 16. Test Add Custom Document from Dashboard

**Manual Test**:
- On project dashboard, click "Add Custom Document" button
- Verify AddDocumentDialog opens (Phase 2 component)
- Enter document type: "Insurance Certificates"
- Click "Search for Requirements" (if AI-assisted flow exists)
- Add document with or without requirements
- Verify new card appears in dashboard grid
- Verify card shows correct document type, requirement count, not_started status

### 17. Test Responsive Layout

**Manual Test**:
- Resize browser window to mobile width (<640px)
- Verify dashboard grid shows 1 column
- Resize to tablet width (640-1024px)
- Verify grid shows 2 columns
- Resize to desktop (>1024px)
- Verify grid shows 3 columns
- Check card content doesn't overflow or break at any width
- Test on actual mobile device if available

### 18. Verify UI Matches TenderCreator Design

**Manual Check**:
- Open `ai_docs/ui_reference/` screenshots
- Compare dashboard card design side-by-side:
  - Card shadows (should match TenderCreator)
  - Rounded corners (8px radius)
  - Padding inside cards (24px)
  - Font sizes (headings, labels, badges)
  - Color scheme (green primary, gray neutrals)
  - Button styling (filled vs outlined)
  - Badge colors and sizes
- Adjust CSS if deviations found
- Goal: User cannot distinguish from TenderCreator screenshots

### 19. Create E2E Test Documentation

**File:** `.claude/commands/e2e/test_phase_3_assignment.md`

Create detailed test following established format (see content in next step)

### 20. Run Validation Commands

Execute all validation commands to ensure Phase 3 works correctly.

## Validation Commands

Execute every command to validate the phase works correctly.

```bash
# 1. Build check (no TypeScript errors)
npm run build

# 2. Start dev server
npm run dev

# 3. Verify database schema supports assignment/status
# (Manual: Supabase dashboard > work_packages table)
# Check assigned_to column type (UUID nullable)
# Check status column has CHECK constraint with 3 values

# 4. Test assignment API endpoint
# (Manual: Bruno/Postman)
# PUT /api/work-packages/[id]/assign
# Body: { "assigned_to": "mock_admin" }
# Verify response contains updated work_package
# Verify assigned_to in DB is actual auth user ID

# 5. Test status API endpoint
# (Manual: Bruno/Postman)
# PUT /api/work-packages/[id]/status
# Body: { "status": "in_progress" }
# Verify response success
# Verify status updated in database

# 6. Visual regression check
# (Manual: Compare rendered UI to TenderCreator screenshots)
# Open ai_docs/ui_reference/
# Compare dashboard layout, card design, shadows, colors
# Document any deviations

# 7. Run E2E test
# Read .claude/commands/test_e2e.md for test credentials
# Execute .claude/commands/e2e/test_phase_3_assignment.md
# Complete all test steps
# Verify all acceptance criteria met

# 8. Test responsive breakpoints
# (Manual: Browser DevTools responsive mode)
# Test at: 375px (mobile), 768px (tablet), 1440px (desktop)
# Verify grid columns: 1, 2, 3 respectively
# Verify no horizontal scroll or overflow

# 9. Test empty state
# (Manual: Create new project, run analysis to get 0 work packages)
# OR delete all work packages from existing project
# Verify empty state shows with "Add Custom Document" CTA
# Add document, verify card appears

# 10. Test progress summary
# (Manual: Set multiple work packages to different statuses)
# Set 2 to completed, 1 to in_progress, 2 to not_started
# Verify header shows "2 of 5 completed"
# Complete one more, verify updates to "3 of 5 completed"

# 11. Test all navigation paths
# (Manual: Follow these paths)
# Projects list → Project detail → Work package detail → Back to project
# Project detail → Continue to workflow → (should go to first WP)
# Work package detail → Breadcrumb project name → (should return to project)

# 12. Check console for errors
# (Manual: Browser DevTools Console)
# Perform all assignment/status changes
# Verify no React errors, API errors, or warnings
# Check Network tab for 400/500 errors

# 13. Test concurrent updates
# (Manual: Open same work package in two browser tabs)
# Change assignment in tab 1
# Refresh tab 2, verify change reflected
# Change status in tab 2
# Refresh tab 1, verify change reflected

# 14. Verify repository pattern compliance
# (Code review: Check all API routes use repositories)
# No direct Supabase queries in API routes
# All database operations go through libs/repositories
# Error handling follows established pattern
```

**E2E Testing Strategy:**
- Use pre-configured test credentials from test_e2e.md (DO NOT create new users)
- Reference absolute paths for test fixtures in test_fixtures/
- Sign in via email/password: test@tendercreator.dev / TestPass123!
- Detailed workflow tests in `.claude/commands/e2e/test_phase_3_assignment.md`

# Implementation log created at:
# ai_docs/documentation/phases_spec/phase_3_work_package_assignment/phase_3_implementation.log

## Notes

### Critical Implementation Details

**Mock User vs Real User Mapping:**
- Frontend displays mock users: "Admin", "Writer A", "Writer B"
- User selects mock user in dropdown
- API receives mock user ID (e.g., "mock_writer_a")
- Backend ignores mock ID, retrieves authenticated user ID from session
- Database stores real user ID in assigned_to field
- Frontend maps: when displaying, if assigned_to matches current user, show selected mock user
- This prepares for future multi-user where assigned_to contains different real user IDs

**Assignment Display Logic:**
```typescript
// Frontend display mapping example
const getMockUserForDisplay = (workPackage: WorkPackage, currentUserId: string) => {
  if (!workPackage.assigned_to) return null
  if (workPackage.assigned_to === currentUserId) {
    // Show mock user based on some stored preference or default
    // For MVP, always show "Admin" since single user
    return MOCK_USERS[0] // "Admin"
  }
  return null // Future: look up actual user name
}
```

**Status Transition Rules:**
- not_started → in_progress: Manual via dropdown (Phase 3)
- in_progress → completed: Manual via dropdown (Phase 3)
- Auto-transition in Phase 4: When user clicks "Generate Content", auto-set to in_progress
- completed → in_progress: Allowed (user might need to re-edit)
- Any status can transition to any status (no enforcement for MVP)

**Navigation Structure:**
```
/projects/[id] (Project Detail)
  ├─ Shows dashboard when status = 'in_progress'
  ├─ "Continue to Workflow" → /work-packages/[first-id]
  └─ Each card "Open" → /work-packages/[card-id]

/work-packages/[id] (Work Package Detail - Shell in Phase 3)
  ├─ Breadcrumb → /projects/[project-id]
  ├─ "Back to Project" → /projects/[project-id]
  └─ Phase 4 will add workflow tabs here
```

**Progress Calculation:**
- Total count = workPackages.length
- Completed count = workPackages.filter(wp => wp.status === 'completed').length
- In progress count = workPackages.filter(wp => wp.status === 'in_progress').length
- Display: "X of Y completed" in header
- Optional: Progress bar visual (percentage completed)
- Consider: "2 completed, 3 in progress, 5 not started" detailed breakdown

**Dashboard vs Matrix:**
- Phase 2: Document Requirements Matrix (table view, analysis focus)
- Phase 3: Work Package Dashboard (card grid, workflow focus)
- Phase 2 matrix replaced entirely by Phase 3 dashboard
- Logic preserved: expand requirements, edit requirements, delete work package
- UI changed: table → cards for better visual hierarchy and workflow feel

**Card Layout Details:**
```
┌──────────────────────────────────────┐
│ Technical Specification         [8]  │ ← Document type + requirement count badge
├──────────────────────────────────────┤
│ Assigned to: [Writer A ▼]            │ ← Assignment dropdown
│ Status: ● In Progress [Change ▼]     │ ← Status badge + dropdown
├──────────────────────────────────────┤
│                      [Open →]        │ ← Action button
└──────────────────────────────────────┘
```

**TenderCreator Design Matching:**
- Reference screenshots in `ai_docs/ui_reference/`
- Card shadow: subtle, increases on hover
- Border radius: 8px (consistent with existing design)
- Padding: 24px inside cards
- Gap between cards: 24px
- Primary color: Green (#10B981 or similar from screenshots)
- Status colors: Gray (not started), Yellow/Orange (in progress), Green (completed)
- Font sizes: Heading 18px, body 14px, labels 12px
- Hover transition: 200ms ease, slight scale or shadow increase

**Empty State Design:**
- Large icon (lucide FileQuestion or similar)
- Heading: "No work packages yet"
- Body text: "Analyze your RFT documents to identify required submission documents, or add a custom document to get started."
- Primary CTA button: "Add Custom Document"
- Secondary CTA: "Analyze RFT" (if applicable, status = setup)
- Center-aligned, max-width 400px container

### Future Phase Prep

**Phase 4 Dependencies:**
- Work package detail route `/work-packages/[id]` established
- Status field ready for auto-transitions during workflow
- Navigation structure in place
- Phase 4 will add:
  - Tabbed workflow UI (Requirements, Strategy, Generate, Edit, Export)
  - Auto status change to 'in_progress' on content generation
  - "Mark as Completed" button on export
  - Back navigation to dashboard preserves state

**Post-MVP Enhancements:**
- Real multi-user: Replace mock users with actual organization users
- Assignment notifications: Email when work package assigned
- Drag-drop reordering of work package cards
- Kanban view option (columns by status)
- Bulk status changes (select multiple, change all)
- Work package templates (pre-fill common document types)
- Assignment load balancing (show how many packages per user)

### Responsive Design Breakpoints

```css
/* Mobile: 1 column */
@media (max-width: 639px) {
  .work-package-grid {
    grid-template-columns: 1fr;
  }
}

/* Tablet: 2 columns */
@media (min-width: 640px) and (max-width: 1023px) {
  .work-package-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Desktop: 3 columns */
@media (min-width: 1024px) {
  .work-package-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
```

Tailwind classes: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`

### Testing Scenarios

**Happy Path:**
1. User completes Phase 2 analysis → work packages created
2. Project detail page shows dashboard with cards
3. User assigns "Writer A" to Tech Spec → saves successfully
4. User changes status to "In Progress" → badge updates
5. User clicks "Open" → navigates to work package detail
6. User sees placeholder message for Phase 4
7. User clicks "Back to Project" → returns to dashboard
8. User clicks "Continue to Workflow" → goes to first work package

**Edge Cases:**
- Zero work packages: Empty state displays
- Single work package: Grid shows 1 card (not broken layout)
- 20+ work packages: Grid scrolls vertically, no performance issues
- Assignment to unassigned: Dropdown shows "Unassigned", can select user
- Rapid status changes: Debounce API calls, show loading state
- Navigation before save completes: Warn user or auto-save

**Error Scenarios:**
- API failure on assignment: Show toast error, revert dropdown to previous value
- API failure on status change: Show toast error, revert badge to previous status
- Network offline: Detect and show offline message, retry on reconnect
- Unauthorized access to work package: 403 error, redirect to projects list
- Work package deleted by another user: Handle 404, show message, remove card

### Performance Considerations

**Dashboard Rendering:**
- 10 work packages = 10 cards (fast, no virtualization needed)
- 50+ work packages = consider pagination or infinite scroll (post-MVP)
- Each card makes 0 API calls on render (data from parent)
- Status/assignment changes = optimistic UI update, then API call

**API Call Optimization:**
- Single update endpoint per action (assign, status)
- No cascading updates (changing one WP doesn't affect others)
- Optimistic updates: Change UI immediately, revert on error
- Debounce rapid changes (if user clicks multiple times)

**Database Queries:**
- listWorkPackages: Single query with join to users table (for assigned_to name)
- RLS ensures only org's work packages returned
- Index on work_packages.project_id (already in schema)
- Index on work_packages.status for filtering (future optimization)

### Accessibility Notes

**Keyboard Navigation:**
- All dropdowns keyboard accessible (shadcn Select is)
- Tab order: Assignment dropdown → Status dropdown → Open button
- Enter key on card focuses first interactive element
- Escape key closes dropdowns

**Screen Readers:**
- Card has aria-label: "Work package: {document_type}"
- Status badge has aria-label: "Status: {status}"
- Assignment has aria-label: "Assigned to {name}"
- Progress summary announced: "{X} of {Y} work packages completed"

**Color Contrast:**
- Status badges meet WCAG AA standards
- Text on cards has sufficient contrast
- Focus indicators visible on all interactive elements

## Research Documentation

No research sub-agents deployed for Phase 3. Implementation follows established patterns from:
- Phase 1 and Phase 2 component patterns
- shadcn/ui component documentation (Card, Select, Badge)
- Next.js App Router navigation patterns
- TenderCreator design reference (ai_docs/ui_reference/)

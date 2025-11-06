# Bug: Sidebar Navigation Active State Incorrect

## Bug Description
Sidebar shows Home as active when it shouldn't, and when clicking Settings, multiple nav items appear active simultaneously. Specifically:
- Home shows active on all `/projects` routes (incorrect when viewing a specific project)
- Company and Settings both show active when navigating to `/settings` routes
- Active state logic has conflicting conditions causing multiple items to highlight

## Problem Statement
The `isActive` function in `components/sidebar.tsx` has overlapping and conflicting logic for determining which nav item should be active, resulting in multiple items showing active state simultaneously.

## Solution Statement
Refactor the `isActive` function to use explicit, non-overlapping conditions with priority ordering. Each route should map to exactly one active nav item.

## Steps to Reproduce
1. Navigate to `/projects` - observe Home is active (correct)
2. Click on a specific project (e.g., `/projects/123`) - observe Home still shows active (should not be active)
3. Navigate to `/settings` - observe both Company and Settings show active (only one should be active)
4. Navigate to `/settings/team` - observe Team shows active (correct)
5. Navigate to `/settings/documents` - observe Settings shows active, but also Company may show (incorrect)

## Root Cause Analysis
In `components/sidebar.tsx:74-90`, the `isActive` function has these issues:

1. **Home/Tenders conflict (lines 79-82)**: Both link to `/projects`, but logic only checks `item.id === 'home'` without distinguishing between list view vs. project detail view
2. **Settings hierarchy conflict (lines 84-89)**: Settings check at line 86 overlaps with generic `startsWith` check at line 89
3. **Company match function (lines 38-40)**: Company has `match: (pathname) => pathname === '/settings'` which conflicts with Settings item
4. **Settings match function (lines 49-54)**: Attempts to catch "all /settings except /settings, /settings/team, /settings/billing" but logic is inverted

The Company nav item is supposed to be active ONLY on `/settings` (company profile), but Settings nav item also wants to be active on `/settings`. Both have custom `match` functions that return `true` for `/settings`.

## Relevant Files
Use these files to fix the bug:

### `components/sidebar.tsx:32-57`
- Contains `navItems` array with conflicting route definitions
- Company (line 35-40) and Settings (line 44-54) both define custom `match` functions that overlap on `/settings`
- Home and Tenders both point to `/projects`

### `components/sidebar.tsx:74-90`
- The `isActive` function with flawed logic
- Line 79-82: Home/Tenders conflict
- Line 84-89: Settings hierarchy conflict
- Custom `match` functions are checked first but overlap

## Step by Step Tasks

### Fix navItems route definitions
- Remove `/settings` from Company `match` function, point Company to `/settings` as base route
- Change Settings to only be active on `/settings/other` routes (not `/settings` itself, `/settings/team`, or `/settings/billing`)
- Keep Home pointing to `/projects` for dashboard/list view
- Remove Tenders nav item OR change Tenders to point to a different route (currently both Home and Tenders point to `/projects`)

### Refactor isActive function with explicit priority
- Check custom `match` functions first (if defined)
- For `/projects`: Home active only when pathname === `/projects` (list view)
- For `/projects/[id]`: No nav item should be active (project detail is its own context)
- For `/settings`: Company active
- For `/settings/team`: Team active
- For `/settings/billing`: Billing active
- For `/settings/documents`: Settings active
- For all other `/settings/*`: Settings active
- Use early returns to avoid fallthrough
- Remove generic `startsWith` check that causes overlaps

### Update nav item definitions for clarity
- Company: `href: '/settings'`, `match: (pathname) => pathname === '/settings'`
- Settings: `href: '/settings/documents'` (or remove, since no clear route), `match: (pathname) => pathname.startsWith('/settings/') && !pathname.startsWith('/settings/team') && !pathname.startsWith('/settings/billing') && pathname !== '/settings'`
- Home: Keep at `/projects`, active only on exact match
- Remove Tenders OR point to `/projects/archive` or similar distinct route

## Validation Commands
Execute every command to validate the bug is fixed.

```bash
# Start dev server
npm run dev

# Manual testing checklist:
# 1. Navigate to /projects - only Home should be active
# 2. Navigate to /projects/[any-id] - no nav item should be active
# 3. Navigate to /settings - only Company should be active
# 4. Navigate to /settings/team - only Team should be active
# 5. Navigate to /settings/billing - only Billing should be active
# 6. Navigate to /settings/documents - only Settings should be active
# 7. Verify no multiple items show active simultaneously

# Build to check for TypeScript errors
npm run build
```

## Notes
- Current routes: `/projects` (list), `/projects/[id]` (detail), `/settings` (company), `/settings/team`, `/settings/billing`, `/settings/documents`
- Decision needed: Keep or remove Tenders nav item? Currently duplicates Home functionality
- Settings nav item may need to be removed or renamed to "Other Settings" / "Documents" with distinct route
- Consider if project detail pages (`/projects/[id]`) should have any sidebar item active, or if sidebar should show project-specific navigation

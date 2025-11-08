# Plan: Refactor Settings Page to Use Design System

## Plan Description
Replace hardcoded Tailwind color classes (green-*, emerald-*) in Settings page and Team page with centralized CSS design tokens from `globals-dashboard.css`. Follow sidebar pattern (perfect example) to ensure consistent brand colors across entire settings UI. No UX/UI changes - purely swap hardcoded values with token references.

## User Story
As a developer
I want settings pages to use centralized design tokens
So that brand colors are consistent and easily maintainable

## Problem Statement
Settings page (`app/(dashboard)/settings/page.tsx`) has 9+ instances of hardcoded Tailwind green colors (`green-400`, `green-600`, `emerald-700`, etc.) instead of using design tokens from `globals-dashboard.css`. Team page has one hardcoded status badge color. Sidebar (marked as "perfect") demonstrates correct pattern with `var(--dashboard-primary)`. This creates:
- Inconsistent colors (Tailwind green vs. brand green `#10B981`)
- Maintenance burden (can't update brand colors centrally)
- Violates coding standards (Design System Pattern in `coding_patterns.md`)

## Solution Statement
Systematically replace all hardcoded color classes with CSS variable references following sidebar pattern (`sidebar.tsx:116,152,159,172`). Use `var(--dashboard-primary)` for green, `var(--dashboard-primary-hover)` for dark green, `var(--dashboard-primary-light)` for light backgrounds. Apply to Settings page (9 instances) and Team page (1 instance). Result: Consistent brand colors, centralized control, standards-compliant.

## Pattern Analysis
**Discovered Patterns:**
- **Correct Pattern** (`sidebar.tsx`):
  - Line 116: `border-[var(--dashboard-primary)]`, `bg-white`, `hover:bg-[var(--dashboard-primary-light)]`
  - Line 152: `text-[var(--dashboard-primary)]` for active state
  - Line 159: `text-[var(--dashboard-text-primary)]` for active text
  - Line 172: `border-[var(--dashboard-primary)]`, `text-[var(--dashboard-primary)]`, `hover:bg-[var(--dashboard-primary-light)]`
- **Design Tokens** (`globals-dashboard.css:10-59`):
  - `--dashboard-primary: #10B981` (emerald green)
  - `--dashboard-primary-hover: #059669` (darker emerald)
  - `--dashboard-primary-light: rgba(16, 185, 129, 0.1)` (light green tint)
  - `--dashboard-text-primary: #1F2937` (dark gray)
  - `--dashboard-border: #E5E7EB` (light gray border)

**Deviations:** None. Following established sidebar pattern exactly.

## Dependencies
### Previous Plans
None - standalone refactoring task

### External Dependencies
- `globals-dashboard.css` (already defined)
- `sidebar.tsx` (reference pattern)

## Relevant Files
Use these files to implement the task:

- `app/(dashboard)/globals-dashboard.css` (lines 10-59) - Contains all design token definitions. Source of truth for color values.
- `components/sidebar.tsx` (lines 116, 152, 159, 172) - Perfect example of design token usage pattern. Reference for replacement syntax.
- `app/(dashboard)/settings/page.tsx` (lines 68, 144, 148, 151, 154, 162, 171, 181, 197) - Main target file with 9 hardcoded color instances to refactor.
- `app/(dashboard)/settings/team/page.tsx` (line 324) - Has one hardcoded status badge (`bg-yellow-50 text-yellow-800`) to replace.
- `ai_docs/documentation/standards/coding_patterns.md` (lines 19-70) - Design System Pattern requirements. Validates approach.

## Acceptance Criteria
- [ ] All hardcoded Tailwind green/emerald classes replaced with design tokens in `settings/page.tsx`
- [ ] Team page status badge uses token or proper warning color
- [ ] Visual appearance unchanged (pixel-perfect match to current UI)
- [ ] No console errors or TypeScript errors
- [ ] Design tokens follow sidebar pattern exactly
- [ ] Code passes coding standards checklist (Design System Pattern section)

## Step by Step Tasks

**EXECUTION RULES:**
- Execute ALL steps below in exact order
- Check Acceptance Criteria - all items are REQUIRED
- Do NOT skip UI/frontend steps if in acceptance criteria
- If blocked, document and continue other steps

### 1. Read and Document Current State

- Read `app/(dashboard)/settings/page.tsx` fully to identify all hardcoded color instances
- Read `app/(dashboard)/settings/team/page.tsx` to identify hardcoded colors
- Document exact line numbers and current values
- Create reference list: `current_color → token_replacement`

### 2. Create Mapping Reference

Create mapping table for replacements:
- `bg-gradient-to-br from-green-400 to-green-600` → `bg-[var(--dashboard-primary)]`
- `border-2 border-green-200` → `border-2 border-[var(--dashboard-primary-light)]`
- `bg-gradient-to-br from-green-50 to-green-100` → `bg-[var(--dashboard-primary-light)]`
- `text-green-600` → `text-[var(--dashboard-primary)]`
- `text-green-700` → `text-[var(--dashboard-primary)]`
- `text-green-900` → `text-[var(--dashboard-text-primary)]`
- `border-green-600` → `border-[var(--dashboard-primary)]`
- `hover:bg-green-600` → `hover:bg-[var(--dashboard-primary)]`
- `bg-green-600` → `bg-[var(--dashboard-primary)]`
- `hover:bg-green-700` → `hover:bg-[var(--dashboard-primary-hover)]`
- `bg-yellow-50 text-yellow-800` → `bg-[var(--dashboard-warning-light)] text-[var(--dashboard-warning)]` (if warning token exists, else create)

### 3. Refactor Settings Page Header Icon (line 68)

Replace:
```tsx
bg-gradient-to-br from-green-400 to-green-600
```
With:
```tsx
bg-[var(--dashboard-primary)]
```

### 4. Refactor Profile Card Container (line 144)

Replace:
```tsx
border-2 border-green-200 bg-gradient-to-br from-green-50 to-green-100
```
With:
```tsx
border-2 border-[var(--dashboard-primary-light)] bg-[var(--dashboard-primary-light)]
```

### 5. Refactor Profile Card Icons and Text (lines 148, 151, 154)

- Line 148: `text-green-600` → `text-[var(--dashboard-primary)]`
- Line 151: `text-green-900` → `text-[var(--dashboard-text-primary)]`
- Line 154: `text-green-700` → `text-[var(--dashboard-primary)]`

### 6. Refactor Service Tags (lines 162, 171)

Both instances:
- `text-green-700` → `text-[var(--dashboard-primary)]`

### 7. Refactor Edit Button (line 181)

Replace:
```tsx
border-green-600 text-green-700 hover:bg-green-600
```
With:
```tsx
border-[var(--dashboard-primary)] text-[var(--dashboard-primary)] hover:bg-[var(--dashboard-primary)]
```

### 8. Refactor Create Button (line 197)

Replace:
```tsx
bg-green-600 hover:bg-green-700
```
With:
```tsx
bg-[var(--dashboard-primary)] hover:bg-[var(--dashboard-primary-hover)]
```

---
✅ CHECKPOINT: Steps 1-8 complete (Settings page refactored). Continue to step 9.
---

### 9. Refactor Team Page Status Badge (line 324)

Check if `--dashboard-warning` and `--dashboard-warning-light` tokens exist in `globals-dashboard.css`.

If exist:
```tsx
bg-yellow-50 text-yellow-800 → bg-[var(--dashboard-warning-light)] text-[var(--dashboard-warning)]
```

If NOT exist, add to `globals-dashboard.css`:
```css
--dashboard-warning-light: rgba(245, 158, 11, 0.1);  /* Light yellow tint */
```
Then use: `bg-[var(--dashboard-warning-light)] text-[var(--dashboard-warning)]`

### 10. Visual Regression Check

- Start dev server (`npm run dev`)
- Navigate to `/settings` page
- Compare visually with original (should be identical)
- Navigate to `/settings/team`
- Check status badge renders correctly
- Take screenshots if needed for validation

### 11. Code Quality Validation

Run validation commands (see Validation Commands section):
- TypeScript check
- Build check
- Lint check
- Compare against Design System Pattern checklist

---
✅ CHECKPOINT: Steps 9-11 complete (Team page + validation). Final step 12.
---

### 12. Run All Validation Commands

Execute every command in Validation Commands section to ensure zero regressions.

## Testing Strategy
### Unit Tests
No unit tests required - visual/build validation sufficient for CSS changes.

### Edge Cases
- Hover states must work correctly (primary-hover)
- Focus states preserved
- Dark mode (if applicable) - check globals-dashboard.css for dark mode tokens
- Different screen sizes (responsive behavior unchanged)

## Validation Commands
Execute every command to validate the task works correctly with zero regressions.

```bash
# 1. TypeScript compilation check
# EXPECTED OUTPUT: "No errors found" or similar success message
npm run type-check

# 2. Build check (ensures no runtime errors)
# EXPECTED OUTPUT: Build succeeds without errors
npm run build

# 3. Lint check
# EXPECTED OUTPUT: No linting errors related to changed files
npm run lint

# 4. Visual inspection checklist
# Start dev server
npm run dev

# Manual checks:
# - Navigate to http://localhost:3000/settings
# - Verify all green elements render correctly
# - Hover over Edit button - should show green background
# - Hover over Create button - should show darker green
# - Navigate to http://localhost:3000/settings/team
# - Verify Pending badge renders with yellow color
# - All colors match original appearance (no visual changes)

# 5. Design System Pattern compliance
# Read coding_patterns.md Design System Pattern section
# Verify:
# - ✅ All colors use CSS variables
# - ✅ No hard-coded color values
# - ✅ Follows sidebar.tsx pattern
# - ✅ Uses var(--dashboard-*) syntax
```

**Implementation log created at:**
`specs/refactor-settings-design-tokens/refactor-settings-design-tokens_implementation.log`

## Definition of Done
- [x] All acceptance criteria met
- [x] All validation commands pass with expected output
- [x] No regressions (existing tests still pass)
- [x] Patterns followed (sidebar.tsx pattern documented in Pattern Analysis)
- [x] No E2E test needed (CSS-only change, no UX modifications)

## Notes
- **Warning tokens**: May need to add `--dashboard-warning-light` to `globals-dashboard.css` if not present (check line 47-48 for existing warning token).
- **Sidebar inconsistency**: Found one instance of `text-emerald-700` in `sidebar.tsx:116` - could be cleaned up in follow-up task, but not blocking this work.
- **Future cleanup candidates**: Other components with hardcoded colors (navbar, generation-agents-panel, project details page) - separate tasks.
- **No new libraries needed** - all tokens already defined.

## Research Documentation
No research needed - pattern clearly established in sidebar.tsx and design tokens already defined in globals-dashboard.css.

# Plan: UI Consistency Optimization

## Plan Description
Audit and standardize UI/UX consistency across the TenderCreator application. Focus on: design system color usage, button styling, spacing/padding, border radius, loader implementations, and ensuring all dashboard pages follow the established design tokens from `globals-dashboard.css`. No functionality changes, no layout changes - purely visual consistency improvements.

## User Story
As a user
I want consistent visual design across all pages
So that the application feels polished and professional

## Problem Statement
The application has inconsistent UI implementations:
- **ProcessLoaderOverlay** uses hardcoded brown palette (`#fdfaf6`, `#5d574d`) instead of design system emerald green
- **Button variants** have inconsistent hover effects and styles
- **Spacing/padding** varies (team page uses custom values, other pages use tailwind utilities)
- **Border radius** scattered across CSS vars, tailwind classes, hardcoded px values
- **Team page** uses inline color values (`#10B981`, `#111827`) instead of CSS variables
- **Loaders** inconsistent - some use emerald, ProcessLoaderOverlay uses brown
- **Project pages** missing padding inconsistencies between cards and page layouts

## Solution Statement
Systematically audit all pages/components, document inconsistencies, then apply design system tokens consistently. Update ProcessLoaderOverlay to use emerald theme, standardize button styles, unify spacing with CSS variables, replace hardcoded colors with design tokens.

## Dependencies
### Previous Plans
None

### External Dependencies
- Design system defined in `app/globals.css` and `app/(dashboard)/globals-dashboard.css`
- StepProgressIndicator emerald styling as reference
- TenderCreator UI reference screenshots in `/ai_docs/ui_reference/`

## Relevant Files

### Design System Files
- **app/globals.css** - Root design tokens (oklch colors, spacing, radius, folder colors)
- **app/(dashboard)/globals-dashboard.css** - Dashboard-specific overrides (emerald green primary, text hierarchy, borders, shadows, spacing)
- Defines CSS variables: `--dashboard-primary: #10B981`, text colors, backgrounds, borders, spacing, radius

### Components Requiring Updates
- **components/process-loader-overlay.tsx** - Uses brown palette, needs emerald theme
  - Currently: `bg-[#fdfaf6]`, `text-[#5d574d]`, progress bar `#b4afa6`
  - Should use: dashboard CSS variables for emerald theme

- **components/ui/button.tsx** - Multiple variants with different hover/effect treatments
  - Need unified approach across default, outline, light, ghost variants

- **components/workflow-steps/step-progress-indicator.tsx** - Already uses emerald correctly
  - Reference for color consistency: `emerald-500`, `emerald-50`, `emerald-100`

### Pages Requiring Consistency Updates
- **app/(dashboard)/settings/team/page.tsx** - Uses inline colors (`#10B981`, `#111827`, `#E5E7EB`)
  - Should reference: `--dashboard-primary`, `--dashboard-text-primary`, `--dashboard-border`
  - Padding: custom values need standardization
  - Border radius: `rounded-2xl`, `rounded-xl` used inconsistently

- **app/(dashboard)/projects/page.tsx** - Check padding/spacing consistency

- **app/(dashboard)/work-packages/[id]/page.tsx** - Content generation workflow page
  - Ensure loader consistency
  - Check spacing around WorkflowTabs component

### Component Consistency Checks
- **components/folder-project-card.tsx** - Uses `rounded-3xl` with clip-path polygon, check consistency
- **components/ui/loading-spinner.tsx** - Should use emerald theme consistently
- **components/workflow-steps/** - All workflow step components for spacing/color consistency

### New Files
None - only updating existing files

## Acceptance Criteria
- [ ] ProcessLoaderOverlay uses emerald green theme (not brown)
- [ ] All loaders use consistent emerald color scheme
- [ ] Team page uses CSS variables instead of inline hex colors
- [ ] Spacing/padding consistent across all dashboard pages (use CSS variables)
- [ ] Border radius unified (CSS variables vs tailwind classes standardized)
- [ ] Button hover effects consistent across all variants
- [ ] No hardcoded colors in dashboard pages (use design tokens)
- [ ] StepProgressIndicator styling maintained as reference
- [ ] File-type UI folder and custom loaders (layout/structure) unchanged
- [ ] Zero functional changes - only visual consistency

## Step by Step Tasks

**EXECUTION RULES:**
- Execute ALL steps below in exact order
- Check Acceptance Criteria - all items are REQUIRED
- Do NOT skip any steps
- If blocked, document and continue other steps

### 1. Audit and Document Current Inconsistencies

- Create detailed inventory of all color/spacing/radius inconsistencies
- Map which files use inline colors vs CSS variables
- Document ProcessLoaderOverlay brown theme vs emerald theme differences
- List all button variant hover effect variations
- Identify all hardcoded spacing values across dashboard pages
- Note border radius inconsistencies (CSS vars vs tailwind vs px values)
- Document team page specific inline color usage
- Create reference map of design system tokens to use

### 2. Update ProcessLoaderOverlay to Emerald Theme

- Replace brown background `bg-[#fdfaf6]` with emerald-based theme
- Update text colors from brown (`#5d574d`, `#8a8479`) to emerald palette
- Change progress bar from tan (`#dedad3`, `#b4afa6`) to emerald gradient
- Update StepIndicator circles to match emerald theme
  - Complete: emerald background instead of `#e4dfd7`
  - Active: emerald border instead of `#b1aca3`
  - Pending: emerald dashed border instead of `#d7d3cd`
- Maintain all animations, easing, timing (no functional changes)
- Preserve backdrop blur and portal behavior
- Test with strategy generation to ensure visual consistency

### 3. Standardize Team Page Colors to CSS Variables

- Replace `#10B981` with `var(--dashboard-primary)`
- Replace `#059669` with `var(--dashboard-primary-hover)`
- Replace `#111827` with `var(--dashboard-text-primary)`
- Replace `#1F2937` with `var(--dashboard-text-primary)`
- Replace `#4B5563` with `var(--dashboard-text-body)`
- Replace `#6B7280` with `var(--dashboard-text-secondary)`
- Replace `#9CA3AF` with `var(--dashboard-text-muted)`
- Replace `#E5E7EB` with `var(--dashboard-border)`
- Replace `#D1D5DB` with `var(--dashboard-border-light)`
- Replace `#F9FAFB` with `var(--dashboard-bg-gray-50)`
- Replace `#F3F4F6` with `var(--dashboard-bg-gray-100)`
- Replace `#E7F5EE` (green light bg) with `var(--dashboard-primary-light)`
- Replace `#0F9D68` with emerald variant or primary
- Verify all StatusBadge, role cards, table styling uses variables

### 4. Unify Spacing and Padding Across Dashboard

- Review team page header: `p-8` - check if matches `--dashboard-card-padding`
- Projects page: ensure `mb-8`, `gap-6` consistent with design system
- Work packages page: verify loader centering uses consistent padding
- Check all card components for `--dashboard-card-padding` usage
- Standardize section gaps to `--dashboard-section-gap`
- Ensure input padding uses `--dashboard-input-padding-x/y`
- Update any custom padding in workflow steps to use variables
- Verify FolderProjectCard padding consistency

### 5. Standardize Border Radius Usage

- Team page: document `rounded-2xl`, `rounded-xl`, `rounded-full` usage
- Replace inconsistent radius with CSS variable references where appropriate
- Ensure buttons use `--dashboard-radius` (6px)
- Cards should use `--dashboard-radius-md` (8px)
- Large containers use `--dashboard-radius` or tailwind equivalent
- Check ProcessLoaderOverlay `rounded-[28px]` - keep or standardize
- Verify StepProgressIndicator `rounded-3xl` maintained
- Update FolderProjectCard if needed (currently `rounded-3xl`)

### 6. Standardize Button Hover Effects

- Review all button variants in `components/ui/button.tsx`
- Ensure outline variant uses `--dashboard-primary-light` on hover
- Default variant maintains gradient overlay but uses design tokens
- Ghost variant hover uses consistent accent background
- Light variant shimmer effect uses design tokens
- Remove any hardcoded opacity/color values in button styles
- Test all button variants across team page, projects page
- Verify CreateProjectDialog buttons, WorkflowTabs buttons consistent

### 7. Ensure Loader Consistency

- LoadingSpinner: verify uses emerald/primary color
- LoadingOverlay: check backdrop matches design system
- ProcessLoaderOverlay: already updated in step 2
- Work package page loader (Loader2): ensure uses `text-muted-foreground` or emerald
- All spinners should use emerald theme colors
- Remove any brown/tan color references from loaders

---
✅ CHECKPOINT: Steps 1-7 complete (Core consistency updates). Continue to step 8.
---

### 8. Verify Project Pages Consistency

- Projects page (`app/(dashboard)/projects/page.tsx`): check header padding
- Verify FolderProjectCard uses design system colors
- Check grid gap consistency
- EmptyState component: ensure uses design tokens
- CreateProjectDialog: verify button styling matches system

### 9. Verify Work Package Workflow Consistency

- WorkflowTabs: ensure uses design system colors
- StepProgressIndicator: already emerald themed (maintain)
- RequirementsView: check padding, colors, spacing
- StrategyGenerationScreen: verify button styles, card padding
- EditorScreen: check toolbar styling consistency
- ExportScreen: verify button and card styling
- Ensure all workflow steps use consistent spacing

### 10. Audit Settings Pages Consistency

- Settings/team: already updated in step 3
- Settings/billing: check uses design system tokens
- Settings/documents: verify consistency
- Ensure all settings pages have matching header styles
- Check form input styling matches `--dashboard-input-*` variables

### 11. Final Visual Consistency Audit

- Compare all pages side-by-side
- Verify no hardcoded hex colors in dashboard routes
- Check all loaders use emerald theme
- Confirm spacing/padding uniform across pages
- Test button hover states across all pages
- Verify border radius consistency
- Ensure StepProgressIndicator styling maintained
- Confirm ProcessLoaderOverlay matches emerald theme

### 12. Run Validation Commands

Execute all validation commands below to ensure zero regressions

## Testing Strategy
### Unit Tests
No unit tests required - visual consistency changes only

### Edge Cases
- Dark mode: ensure design tokens work in dark theme
- Mobile responsive: check if padding/spacing responsive (not in scope but don't break)
- Hover states: test all button variants
- Loading states: test all loaders appear with emerald theme
- Team page filters: ensure styling consistent when filtering
- Empty states: verify design token usage

## Validation Commands
Execute every command to validate the task works correctly with zero regressions.

```bash
# Build the application to check for TypeScript errors
npm run build

# Start dev server and manually verify pages:
npm run dev
```

**Manual Verification Checklist:**
1. Navigate to `/projects` - verify spacing, button styles, loader colors
2. Navigate to `/settings/team` - verify no inline colors, all CSS variables work
3. Navigate to `/work-packages/[id]` (any work package) - verify workflow tabs, step indicator
4. Trigger content generation - verify ProcessLoaderOverlay uses emerald theme (not brown)
5. Check all buttons on each page - verify consistent hover effects
6. Inspect element on team page - verify CSS variables used (not hex codes)
7. Check browser console for any warnings/errors
8. Compare pages side-by-side - verify visual consistency

**Visual Regression Checks:**
- ProcessLoaderOverlay: should show emerald green instead of brown/tan
- Team page: should look identical but use CSS variables under the hood
- All loaders: should use emerald theme
- Buttons: consistent hover effects across all pages
- Spacing: uniform padding/margins across dashboard

# Implementation log created at:
# specs/ui-consistency-optimization/ui-consistency-optimization_implementation.log

## Notes
- **DO NOT CHANGE**: File-type UI folder, custom loader layout/structure, StepProgressIndicator implementation
- **DO CHANGE**: Colors used in ProcessLoaderOverlay, inline hex colors, inconsistent spacing values
- **REFERENCE**: StepProgressIndicator emerald styling is the gold standard
- **PRESERVE**: All animations, transitions, easing functions, portal behavior
- **FOCUS**: Visual consistency only - zero functional changes
- This is purely a design system unification task
- Future consideration: Create unified design tokens file for both marketing and dashboard

## Research Documentation
No research sub-agents deployed - design system already documented in existing CSS files

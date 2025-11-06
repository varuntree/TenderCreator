# UI Inconsistencies Audit

## Color Inconsistencies

### ProcessLoaderOverlay (components/process-loader-overlay.tsx)
**Current (Brown Theme):**
- Background: `bg-[#fdfaf6]` (warm cream)
- Border: `border-white/70`
- Progress bar base: `bg-[#dedad3]` (tan)
- Progress bar gradient: `from-[#b4afa6] via-[#9f9a90] to-[#b4afa6]` (brown gradient)
- Text primary: `text-[#5d574d]` (dark brown)
- Text secondary: `text-[#8a8479]` (light brown)
- Text muted: `text-[#b1aca3]` (muted brown)
- Icon background: `bg-[#f1eee8]` (cream), `text-[#5d574d]`
- Complete step: `bg-[#e4dfd7]`, `text-[#6c655a]`
- Active step border: `border-[#b1aca3]`, `text-[#857f75]`
- Pending step: `border-[#d7d3cd]`
- Backdrop: `bg-[#cfcaca]/70`

**Should Be (Emerald Theme - reference StepProgressIndicator):**
- Background: emerald-based (use `bg-emerald-50` or similar)
- Progress bar: emerald gradient
- Text colors: emerald palette
- Complete: `bg-emerald-50 text-emerald-700`
- Active: `border-emerald-500 bg-emerald-100 text-emerald-800`
- Pending: use border/muted colors

### Team Page (app/(dashboard)/settings/team/page.tsx)
**Inline Hex Colors (Should use CSS variables):**
- `#10B981` → `var(--dashboard-primary)`
- `#059669` / `#0E9F6E` → `var(--dashboard-primary-hover)`
- `#111827` → `var(--dashboard-text-primary)`
- `#1F2937` → `var(--dashboard-text-primary)`
- `#4B5563` → `var(--dashboard-text-body)`
- `#6B7280` → `var(--dashboard-text-secondary)`
- `#9CA3AF` → `var(--dashboard-text-muted)`
- `#E5E7EB` → `var(--dashboard-border)`
- `#D1D5DB` → `var(--dashboard-border-light)`
- `#F9FAFB` → `var(--dashboard-bg-gray-50)`
- `#F3F4F6` → `var(--dashboard-bg-gray-100)`
- `#E7F5EE` → `var(--dashboard-primary-light)`
- `#0F9D68` → emerald variant
- `#FFFFFF` → `var(--dashboard-bg-white)` or `white`
- `#0B1220` → darker primary variant
- `#FEF3C7` → warning/yellow variant (StatusBadge pending)
- `#92400E` → warning text
- `rgba(16, 185, 129, 0.1)` / `rgba(16, 185, 129, 0.05)` → `var(--dashboard-primary-light)`

## Spacing/Padding Inconsistencies

### Team Page
- Header: `p-8` (32px) - matches `--dashboard-card-padding: 1.5rem` (24px)? NO - should verify
- Section: `p-8` (32px)
- Card padding: varies
- Gap: `gap-3`, `gap-4`, `gap-6` - mixed usage

### Projects Page
- Header margin: `mb-8`
- Grid gap: `gap-6`

### General Pattern
- Mix of tailwind classes (`p-8`, `gap-6`) vs CSS variables (`--dashboard-card-padding`)
- Need to standardize whether to use tailwind or CSS vars

## Border Radius Inconsistencies

### Team Page
- Cards/sections: `rounded-2xl` (16px)
- Buttons: `rounded-xl` (12px)
- Badges: `rounded-full`
- Table: `rounded-2xl`
- Dropdowns: `rounded-xl`
- Avatar: `rounded-full`
- Inputs/selects: `rounded-xl`

### ProcessLoaderOverlay
- Container: `rounded-[28px]` (hardcoded 28px)

### StepProgressIndicator
- Container: `rounded-3xl` (24px)

### FolderProjectCard
- Container: `rounded-3xl` (24px)

### CSS Variables Available
- `--dashboard-radius-sm: 0.25rem` (4px)
- `--dashboard-radius: 0.375rem` (6px)
- `--dashboard-radius-md: 0.5rem` (8px)
- Tailwind: `rounded-xl` (12px), `rounded-2xl` (16px), `rounded-3xl` (24px)

**Pattern:** Larger containers use `rounded-2xl` or `rounded-3xl`, buttons/inputs use `rounded-xl`

## Button Variant Hover Effects

### Current Button Variants (components/ui/button.tsx)
1. **default**: Complex gradient overlay with before/after pseudo-elements
   - `bg-primary` with `shadow-xl`
   - Hover: `hover:bg-primary/90 hover:before:bg-primary/80`
   - After pseudo-element with `translate-y-full` animation

2. **outline**: Simple border hover
   - `border bg-background hover:bg-accent hover:text-accent-foreground`

3. **ghost**: Minimal hover
   - `hover:bg-accent hover:text-accent-foreground`

4. **light**: Complex shimmer effect
   - `bg-chart-4` with before/after pseudo-elements
   - After pseudo with `bg-primary/30` and blur

**Inconsistency:** Default and light have complex effects, outline/ghost are simple. No unified approach.

## Loader Implementations

### LoadingSpinner (components/ui/loading-spinner.tsx)
- Uses `Loader2` icon with `animate-spin`
- No hardcoded colors mentioned in plan audit
- Should use emerald/primary theme

### ProcessLoaderOverlay
- Already documented above - uses brown theme, needs emerald

### Work Package Page Loader
- Uses `Loader2` with `text-muted-foreground`
- Inconsistent with emerald theme

## Design System Reference Map

### From globals-dashboard.css
```
--dashboard-primary: #10B981 (emerald-500)
--dashboard-primary-hover: #059669 (emerald-600)
--dashboard-primary-light: rgba(16, 185, 129, 0.1)
--dashboard-primary-foreground: #FFFFFF

--dashboard-text-primary: #1F2937 (gray-800)
--dashboard-text-body: #4B5563 (gray-700)
--dashboard-text-secondary: #6B7280 (gray-500)
--dashboard-text-muted: #9CA3AF (gray-400)

--dashboard-bg-white: #FFFFFF
--dashboard-bg-gray-50: #F9FAFB
--dashboard-bg-gray-100: #F3F4F6
--dashboard-bg-sidebar: #F3F4F6

--dashboard-border: #E5E7EB (gray-200)
--dashboard-border-light: #D1D5DB (gray-300)
--dashboard-border-subtle: #E0E3EA
--dashboard-border-dashed: #D1D5DB

--dashboard-success: #10B981
--dashboard-warning: #F59E0B
--dashboard-error: #EF4444
--dashboard-muted: #6B7280

--dashboard-shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.1)
--dashboard-shadow-md: 0 4px 12px rgba(0, 0, 0, 0.15)
--dashboard-shadow-dropdown: 0 4px 6px rgba(0, 0, 0, 0.1)

--dashboard-card-padding: 1.5rem (24px)
--dashboard-section-gap: 2rem (32px)
--dashboard-input-padding-x: 1rem (16px)
--dashboard-input-padding-y: 0.75rem (12px)

--dashboard-radius-sm: 0.25rem (4px)
--dashboard-radius: 0.375rem (6px)
--dashboard-radius-md: 0.5rem (8px)
```

### Tailwind Emerald Colors (for ProcessLoaderOverlay)
- emerald-50: #ECFDF5
- emerald-100: #D1FAE5
- emerald-500: #10B981
- emerald-600: #059669
- emerald-700: #047857
- emerald-800: #065F46

## Files to Update

### High Priority
1. **components/process-loader-overlay.tsx** - Brown to emerald theme
2. **app/(dashboard)/settings/team/page.tsx** - Inline colors to CSS variables

### Medium Priority
3. **components/ui/button.tsx** - Standardize hover effects (review only, may not need changes)
4. **components/ui/loading-spinner.tsx** - Verify emerald theme
5. **app/(dashboard)/work-packages/[id]/page.tsx** - Loader consistency

### Low Priority (Verification)
6. **app/(dashboard)/projects/page.tsx** - Spacing consistency
7. **components/folder-project-card.tsx** - Color/spacing verification
8. **components/workflow-steps/*.tsx** - Spacing verification
9. Other settings pages - Consistency verification

## Summary

**Main Issues:**
1. ProcessLoaderOverlay uses completely different color palette (brown) vs rest of app (emerald)
2. Team page has 15+ inline hex colors instead of CSS variables
3. Spacing uses mix of tailwind classes and CSS variables without clear pattern
4. Border radius scattered across different values without standardization
5. Button hover effects inconsistent across variants
6. Loaders don't consistently use emerald theme

**Approach:**
1. Update ProcessLoaderOverlay to emerald (biggest visual impact)
2. Replace all team page inline colors with CSS variables
3. Standardize spacing to use tailwind classes consistently (p-8, gap-6 pattern already established)
4. Keep existing border radius patterns (rounded-2xl for cards, rounded-xl for inputs)
5. Verify button hover effects work with design system
6. Ensure all loaders use emerald/primary colors

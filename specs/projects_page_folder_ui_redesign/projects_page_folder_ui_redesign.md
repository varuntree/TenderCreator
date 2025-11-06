# Plan: Projects Page Folder UI Redesign

## Plan Description
Completely redesign the Projects listing page UI from bland card-based layout to professional folder-shaped cards. Transform project cards to resemble actual folders with tab design, hover effects, and visual depth. Maintain all existing functionality (navigation, status badges, metadata display) while implementing a sleek, folder-based visual design using CSS clip-path and shadcn/ui components.

## User Story
As a tender response manager
I want to see my projects displayed as professional folder-shaped cards
So that the interface feels more intuitive and visually appealing while maintaining the same organizational workflow

## Problem Statement
Current projects page uses generic rectangular cards that lack visual interest and don't convey the organizational nature of projects. The UI is functional but bland - no visual metaphor connecting "projects as containers" to the interface design. User wants folder-shaped cards that look professional and sleek, matching modern file management UIs.

## Solution Statement
Redesign project cards to use folder-shaped geometry created with CSS clip-path polygons. Each project will be represented as a folder with:
- Folder tab at top (contains project name)
- Folder body (contains metadata: client, deadline, status)
- Subtle gradient backgrounds with multiple color variants
- Hover animations (scale, shadow, shine effects)
- Status badge integrated into folder design
- All existing functionality preserved (click to open, status display, etc.)

Implementation uses pure CSS (no images/SVGs), ensuring lightweight, responsive, GPU-accelerated rendering compatible with existing design system.

## Dependencies
### Previous Plans
- None (pure visual redesign, no functionality changes)

### External Dependencies
- lucide-react (already installed) - for folder icons
- Tailwind CSS (already configured) - for styling
- shadcn/ui components (already in use) - for badges, buttons
- CSS clip-path polygon support (all modern browsers, Chrome 55+, Firefox 52+, Safari 15.1+, Edge 15+)

## Relevant Files
Use these files to implement the task:

### Existing Files

**app/(dashboard)/projects/page.tsx** (62 lines)
- Main projects listing page
- Currently renders grid of ProjectCard components (line 53: `grid gap-6 md:grid-cols-2 lg:grid-cols-3`)
- Shows empty state when no projects
- Need to update to use new FolderProjectCard component
- Maintain existing data fetching and structure

**components/project-card.tsx** (40 lines)
- Current card implementation using shadcn/ui Card component
- Shows project name, client, deadline, status badge
- Link wrapper for navigation to project detail
- Need to replace with folder-shaped design while maintaining props interface
- Keep hover transition (line 19: `transition-shadow hover:shadow-lg`)

**ai_docs/ui_reference/ui1.png**
- TenderCreator design reference
- Shows clean, professional aesthetic to match
- Color scheme: green primary (#10B981), gray text
- Reference for overall design consistency

**ai_docs/documentation/standards/coding_patterns.md** (240 lines)
- Design system rules: use CSS variables only (line 19-70)
- No hard-coded colors or spacing allowed
- Must use shadcn/ui components
- Follow Tailwind + CSS variable pattern

### New Files

**components/folder-project-card.tsx**
- New folder-shaped project card component
- Replace ProjectCard with folder geometry
- Use CSS clip-path for folder tab and body shapes
- Props interface identical to ProjectCard (drop-in replacement)
- Folder tab: project name
- Folder body: client name, deadline, status badge
- Color variants (5 colors rotating based on project index)
- Hover effects: scale, shadow, shine animation
- lucide-react Folder icon overlay

**styles/folder-animations.css** (optional)
- Custom CSS animations for folder interactions
- Hover shine effect
- Scale and shadow transitions
- Could be inline in component or separate file

**specs/projects_page_folder_ui_redesign/folder-design-research.md**
- Research documentation from Explore agent
- Contains 5 implementation approaches
- CSS techniques, code examples
- Browser compatibility notes
- Reference for implementation details

### Files to Read

**.claude/commands/test_e2e.md**
- E2E testing format and credentials
- Pre-configured test user credentials
- Testing workflow patterns

**.claude/commands/e2e/test_basic_query.md**
- Example E2E test format
- Screenshot workflow
- Success criteria patterns

## Acceptance Criteria
1. Projects page displays folder-shaped cards (not rectangular cards)
2. Each folder has visible tab at top with project name
3. Folder body shows client name, deadline, status badge
4. 5 color variants rotate across projects (subtle gradients)
5. Hover animations work smoothly (scale, shadow, optional shine)
6. Clicking folder navigates to project detail (existing behavior)
7. Status badges integrated into folder design
8. Empty state unchanged ("No projects yet")
9. Grid layout maintained (responsive: 1 col mobile, 2 col tablet, 3 col desktop)
10. Zero functionality regressions (all navigation, data display works)
11. Design system compliance (CSS variables, shadcn/ui only)
12. Professional and sleek aesthetic matching TenderCreator style

## Step by Step Tasks

**EXECUTION RULES:**
- Execute ALL steps below in exact order
- Check Acceptance Criteria - all items are REQUIRED
- Do NOT skip UI/frontend steps if in acceptance criteria
- If blocked, document and continue other steps

### 1. Review Research and Reference Materials

- Read `specs/projects_page_folder_ui_redesign/folder-design-research.md` (created by Explore agent)
- Study CSS clip-path polygon techniques for folder shapes
- Review 5 implementation approaches documented
- Note recommended Approach 4 (Hybrid CSS + lucide-react icon)
- Review reference image provided by user (shows desired folder grid layout)
- Read `ai_docs/ui_reference/ui1.png` for TenderCreator design aesthetic
- Note color scheme: green primary, gray text, clean professional look

### 2. Define Folder Color Palette

- Open `app/globals.css`
- Add CSS custom properties for 5 folder color variants
- Use subtle gradients (light to slightly darker)
- Colors: blue, green, purple, orange, pink (professional pastels)
- Format: `--folder-1-from`, `--folder-1-to`, etc.
- Ensure colors work with dark text and status badges
- Keep colors muted/professional (avoid bright/garish)

Example variables:
```css
--folder-blue-from: hsl(210, 40%, 92%);
--folder-blue-to: hsl(210, 40%, 88%);
```

### 3. Create Folder Project Card Component

- Create `components/folder-project-card.tsx`
- Interface: `FolderProjectCardProps` matching existing ProjectCardProps
- Accept: `project: { id, name, client_name?, deadline?, status }` and `colorIndex: number`
- Implement folder geometry using CSS:
  - Folder tab: `clip-path: polygon(0 100%, 0 20%, 20% 0, 60% 0, 70% 20%, 100% 20%, 100% 100%)`
  - Folder body: standard rounded rectangle below tab
  - Or use single shape with tab integrated
- Color: Use `colorIndex % 5` to select from 5 color variants
- Content structure:
  - Tab section: project name (bold, truncate if long)
  - Body section: client name (if exists), deadline, status badge
- Hover state: `hover:scale-105 hover:shadow-xl transition-all duration-300`
- Import Folder icon from lucide-react, position at top of folder body
- Wrap entire component in Link to `/projects/${project.id}`
- Use existing Badge component for status
- Use Tailwind classes + CSS variables (no hard-coded colors)

### 4. Implement Folder Shape CSS

Within the FolderProjectCard component, implement the folder shape:

```tsx
// Folder tab (top section)
<div className="relative">
  <div
    className="folder-tab h-8 bg-gradient-to-r"
    style={{
      clipPath: 'polygon(0 100%, 0 20%, 20% 0, 60% 0, 70% 20%, 100% 20%, 100% 100%)',
      backgroundImage: `linear-gradient(135deg, var(--folder-${colorVariant}-from), var(--folder-${colorVariant}-to))`
    }}
  >
    <div className="px-4 py-1 text-sm font-semibold truncate">
      {project.name}
    </div>
  </div>

  {/* Folder body */}
  <div
    className="folder-body rounded-b-lg p-6 bg-gradient-to-br"
    style={{
      backgroundImage: `linear-gradient(135deg, var(--folder-${colorVariant}-from), var(--folder-${colorVariant}-to))`
    }}
  >
    {/* Icon, metadata, badge */}
  </div>
</div>
```

Adjust clip-path polygon to achieve desired folder tab shape.

### 5. Add Hover Animations

- Add hover classes to folder card container:
  - `transition-all duration-300 ease-in-out`
  - `hover:scale-105`
  - `hover:shadow-2xl`
  - `hover:-translate-y-1`
- Optional: Add shine effect on hover using pseudo-element
  - `before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent`
  - `before:translate-x-[-200%] hover:before:translate-x-[200%]`
  - `before:transition-transform before:duration-700`
- Test animations are smooth (GPU-accelerated, 60fps)
- Ensure animations don't interfere with Link click behavior

---
✅ CHECKPOINT: Steps 1-5 complete (Folder component created). Continue to step 6.
---

### 6. Update Projects Page to Use Folder Cards

- Open `app/(dashboard)/projects/page.tsx`
- Replace ProjectCard import with FolderProjectCard import
- Update map function (line 54-56):
  ```tsx
  {projects.map((project, index) => (
    <FolderProjectCard
      key={project.id}
      project={project}
      colorIndex={index}
    />
  ))}
  ```
- Keep existing grid layout classes (`grid gap-6 md:grid-cols-2 lg:grid-cols-3`)
- Keep empty state component unchanged
- Keep page header and "Create Project" button unchanged
- Test page renders without errors

### 7. Test Color Variant Distribution

- Create or navigate to page with 5+ projects
- Verify colors rotate: project 0 (blue), project 1 (green), project 2 (purple), project 3 (orange), project 4 (pink), project 5 (blue again)
- Ensure all colors are visible and distinguishable
- Verify colors maintain professional appearance
- Test that status badges remain readable on all color backgrounds
- Adjust color saturation/lightness in CSS variables if needed

### 8. Test All Interactive States

- Hover over each folder card:
  - Verify scale animation works
  - Verify shadow increases
  - Verify optional shine effect (if implemented)
  - Verify animation is smooth (no jank)
- Click on folder card:
  - Verify navigation to project detail works
  - Verify no animation interference with click
- Test with keyboard navigation:
  - Tab to folder card (Link should be focusable)
  - Verify focus ring visible
  - Press Enter to navigate

### 9. Responsive Design Testing

- Test on desktop (1920px+): 3 columns, folders clearly visible
- Test on tablet (768px-1024px): 2 columns, folders scale appropriately
- Test on mobile (< 768px): 1 column, folders full width
- Verify folder tab text truncates properly on narrow screens
- Verify metadata (client, deadline) wraps or truncates gracefully
- Ensure no horizontal scroll or layout breaks

### 10. Accessibility Review

- Verify folder cards are keyboard navigable (Link component)
- Verify focus indicators visible and clear
- Test with screen reader (optional, but note ARIA if needed):
  - Project name announced
  - Status announced
  - Link destination clear
- Ensure color is not the only indicator (status has badge text)
- Verify contrast ratios meet WCAG AA standards:
  - Text on folder backgrounds
  - Status badge text

### 11. Design System Compliance Check

- Review `components/folder-project-card.tsx`
- Verify no hard-coded colors (all use CSS variables)
- Verify no hard-coded spacing (use Tailwind classes)
- Verify uses shadcn/ui Badge component (not custom)
- Verify uses lucide-react icon (existing dependency)
- Verify follows patterns from `coding_patterns.md`
- Run TypeScript compiler: `npx tsc --noEmit`
- Fix any type errors

### 12. Create E2E Test File

- Create `.claude/commands/e2e/test_projects_folder_ui.md`
- Follow format from `test_basic_query.md`
- Test workflow:
  1. Sign in with test credentials (test@tendercreator.dev / TestPass123!)
  2. Navigate to /projects
  3. Verify folder-shaped cards visible (not rectangular)
  4. Take screenshot of projects grid
  5. Hover over folder card, verify hover animation
  6. Take screenshot of hover state
  7. Click folder card
  8. Verify navigation to project detail
  9. Go back to projects page
  10. Verify multiple color variants visible (if 5+ projects)
  11. Take final screenshot
- Success criteria:
  - Folder tab visible at top of each card
  - Project name in tab
  - Client, deadline, status in body
  - Colors rotate across projects
  - Hover animations smooth
  - Navigation works
- Use pre-configured test credentials from test_e2e.md
- Use absolute paths for screenshots

---
✅ CHECKPOINT: Steps 6-12 complete (Integration and testing). Continue to step 13.
---

### 13. Run Validation Commands

- Execute all commands in Validation Commands section below
- Fix any TypeScript errors
- Fix any runtime errors
- Re-test until all validation passes
- Document any issues or decisions in implementation log

## Testing Strategy
### Unit Tests
- Not required for pure UI component
- Visual regression via E2E screenshots sufficient

### Edge Cases
- Zero projects (empty state - unchanged)
- Single project (one folder, color index 0)
- 5+ projects (all color variants visible)
- Long project names (text truncation in tab)
- Missing client_name (show only deadline)
- Missing deadline (show only client)
- Missing both client and deadline (show only status)
- All status types (setup, analysis, in_progress, completed) - badge colors
- Very narrow viewport (mobile - 1 column, folder still recognizable)
- Dark mode (if implemented - colors should adapt)

## Validation Commands
Execute every command to validate the task works correctly with zero regressions.

```bash
# Verify new component created
ls -la components/folder-project-card.tsx

# Verify E2E test created
ls -la .claude/commands/e2e/test_projects_folder_ui.md

# Verify no TypeScript errors
npx tsc --noEmit

# Verify no ESLint errors
npm run lint

# Start dev server (if not running)
npm run dev

# Manual testing:
# 1. Navigate to http://localhost:3000/projects
# 2. Verify folder-shaped cards visible
# 3. Verify hover animations work
# 4. Click folder, verify navigation works
# 5. Test with 5+ projects to see color rotation

# Run E2E test
# Read .claude/commands/test_e2e.md
# Then execute .claude/commands/e2e/test_projects_folder_ui.md
```

**E2E Testing Strategy:**
- Use pre-configured test credentials from test_e2e.md (DO NOT create new users)
- Sign in via email/password: test@tendercreator.dev / TestPass123!
- Navigate to /projects page
- Take screenshots of folder grid (before/after comparison)
- Verify folder shape visible in screenshots
- Test hover states visually
- Verify all navigation functional

# Implementation log created at:
# specs/projects_page_folder_ui_redesign/projects_page_folder_ui_redesign_implementation.log

## Notes

### Design Inspiration
Based on user-provided reference image showing clean folder-based grid layout. Inspiration from macOS Finder, Google Drive folder icons, but adapted to TenderCreator's clean, professional SaaS aesthetic.

### CSS Technique: clip-path
Using `clip-path: polygon()` for folder shapes:
- **Pros**: Lightweight, GPU-accelerated, responsive, no external assets
- **Cons**: Requires modern browser (but 95%+ support as of 2024)
- **Fallback**: Not needed (all target browsers support, degrades to rectangle if unsupported)

### Color Variants
5 subtle gradient colors:
1. Blue - primary/default
2. Green - aligns with TenderCreator brand color
3. Purple - creative projects
4. Orange - urgent/active projects
5. Pink - collaborative projects

Colors are visual only (no semantic meaning), rotate by index to add visual interest.

### Performance Considerations
- CSS clip-path is GPU-accelerated (smooth 60fps animations)
- No images/SVGs loaded (pure CSS shapes)
- Gradient backgrounds cached by browser
- Hover animations use `transform` and `box-shadow` (efficient properties)
- Expected no performance impact even with 50+ projects

### Future Enhancements (Out of Scope)
- User-selectable folder colors
- Folder icon variations (folder-open on hover, different icons per project type)
- Drag-and-drop reordering of folders
- Folder grouping/nesting
- Custom folder labels/tags
- These are feature enhancements, defer post-MVP

### Design System Compliance
- All colors defined as CSS variables in globals.css
- Uses existing shadcn/ui Badge component (no custom badge)
- Uses lucide-react Folder icon (existing dependency)
- Follows Tailwind CSS class patterns
- No hard-coded spacing or colors
- Maintains accessibility standards (focus, contrast, keyboard nav)

### Accessibility Notes
- Folder shape is decorative, does not affect semantics
- Link wraps entire card (standard pattern)
- Status badge has text (not color-only indicator)
- Focus ring visible on keyboard navigation
- Screen readers announce project name, status, and link destination
- Color variants add visual interest but do not convey information

### Browser Compatibility
- **clip-path polygon**: Chrome 55+, Firefox 52+, Safari 15.1+, Edge 15+ (2016+ browsers)
- **CSS gradients**: All modern browsers
- **Hover animations**: All modern browsers
- **Target**: Desktop users (per MVP scope), modern browsers expected
- **Fallback**: If clip-path unsupported, folder degrades to rounded rectangle (acceptable)

## Research Documentation
See `specs/projects_page_folder_ui_redesign/folder-design-research.md` for:
- 5 implementation approaches evaluated
- CSS polygon techniques
- Browser compatibility details
- Code examples and variations
- Advanced hover effects
- Production-ready components

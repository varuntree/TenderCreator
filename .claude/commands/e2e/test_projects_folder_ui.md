# E2E Test: Projects Page Folder UI

## Test Overview
Validate folder-shaped project cards are displayed correctly on projects page with proper styling, hover effects, and navigation functionality.

## Prerequisites
- Dev server running (`npm run dev`)
- Test user account exists: test@tendercreator.dev / TestPass123!
- At least 5 projects exist for color variant testing (create if needed)

## Test Steps

### 1. Sign In
```
Navigate to: http://localhost:3000
Click "Sign In" or go to /sign-in
Enter email: test@tendercreator.dev
Enter password: TestPass123!
Click "Sign In" button
Verify: Redirected to dashboard
```

### 2. Navigate to Projects Page
```
Click "Projects" in sidebar navigation
OR navigate directly to: http://localhost:3000/projects
Verify: Projects page loads successfully
Verify: Page title shows "Projects"
Verify: "Create Project" button visible in header
```

### 3. Verify Folder-Shaped Cards
```
Observe project cards in grid layout
Verify: Each card has folder tab at top (not rectangular)
Verify: Folder tab contains folder icon and project name
Verify: Folder body below tab contains metadata
Verify: Cards are NOT plain rectangles (clip-path applied)
Take screenshot: "projects-folder-grid.png"
```

### 4. Verify Color Variants
```
If 5+ projects exist:
  Verify: Project 1 has blue gradient
  Verify: Project 2 has green gradient
  Verify: Project 3 has purple gradient
  Verify: Project 4 has orange gradient
  Verify: Project 5 has pink gradient
  Verify: Project 6 cycles back to blue
  Verify: Colors are subtle/professional (not garish)
Take screenshot: "projects-color-variants.png"
```

### 5. Verify Card Content
```
For each project card, verify:
  - Folder tab section:
    - Folder icon visible (lucide-react)
    - Project name displayed and readable
    - Text truncates if name too long
  - Folder body section:
    - Status badge in top-right (outline style, semi-transparent background)
    - Client name displayed (if exists)
    - Deadline displayed (if exists)
    - Format: "Due: MM/DD/YYYY"
```

### 6. Test Hover Animations
```
Hover over a folder card
Verify: Card scales up slightly (scale-105)
Verify: Card translates up slightly (-translate-y-1)
Verify: Shadow increases (shadow-2xl)
Verify: Shine effect sweeps across (optional, may be subtle)
Verify: Animation is smooth (no jank)
Verify: Hover cursor shows pointer (clickable)
Take screenshot while hovering: "projects-hover-state.png"
```

### 7. Test Navigation
```
Click on any folder card
Verify: Navigate to project detail page
Verify: URL changes to /projects/[project-id]
Verify: Project detail page loads correctly
Go back to projects page (browser back button)
Verify: Return to projects list
Verify: Folder cards still display correctly
```

### 8. Test Keyboard Navigation
```
Press Tab key repeatedly
Verify: Focus moves through folder cards
Verify: Focus ring visible on focused card
Select a focused folder card
Press Enter key
Verify: Navigate to project detail page
```

### 9. Test Responsive Layout
```
Resize browser to desktop width (1920px)
Verify: 3 columns of folder cards
Verify: Folders clearly visible and properly shaped

Resize to tablet width (768-1024px)
Verify: 2 columns of folder cards
Verify: Folders scale appropriately

Resize to mobile width (<768px)
Verify: 1 column of folder cards
Verify: Folders take full width
Verify: Folder tab text truncates properly
Take screenshot at each breakpoint
```

### 10. Test Empty State
```
If test account has zero projects:
  Verify: Empty state displays
  Verify: Shows "No projects yet" message
  Verify: Shows folder icon (FolderOpen)
  Verify: Shows "Create your first project..." description
  Verify: Empty state unchanged from before (not affected by folder UI)
```

### 11. Test Edge Cases
```
Test with project with very long name:
  Verify: Text truncates in folder tab
  Verify: No overflow or layout break

Test with project missing client_name:
  Verify: Only deadline displays (no client row)
  Verify: Layout still looks good

Test with project missing deadline:
  Verify: Only client displays (no deadline row)
  Verify: Layout still looks good

Test with project missing both:
  Verify: Only status badge shows
  Verify: Folder body not empty/broken
```

### 12. Final Validation
```
Take final screenshot: "projects-folder-final.png"
Verify all acceptance criteria met:
  ✓ Folder-shaped cards (not rectangular)
  ✓ Folder tab at top with name
  ✓ Folder body shows client, deadline, status
  ✓ 5 color variants visible (if 5+ projects)
  ✓ Hover animations smooth
  ✓ Navigation works
  ✓ Grid layout maintained (1/2/3 cols responsive)
  ✓ Design system compliance (colors via CSS variables)
```

## Success Criteria

### Visual
- [ ] Folder tab visible at top of each card
- [ ] Clip-path polygon creates folder shape (not rectangle)
- [ ] Folder icon displayed in tab
- [ ] Project name in tab section
- [ ] Client, deadline, status in body section
- [ ] 5 color variants rotate across projects
- [ ] Colors are professional/subtle gradients
- [ ] Status badge semi-transparent on gradient background

### Interactive
- [ ] Hover animations work (scale, shadow, translate, shine)
- [ ] Hover animations are smooth (60fps, no jank)
- [ ] Click navigation works (to project detail)
- [ ] Keyboard navigation works (Tab, Enter)
- [ ] Focus ring visible

### Functional
- [ ] Zero regressions (all existing functionality works)
- [ ] Empty state still displays correctly
- [ ] Grid layout responsive (1/2/3 cols)
- [ ] Text truncation works (long names)
- [ ] Handles missing data gracefully (client, deadline)

### Design System
- [ ] Uses CSS variables (no hard-coded colors)
- [ ] Uses shadcn/ui Badge component
- [ ] Uses lucide-react icons
- [ ] Matches TenderCreator professional aesthetic
- [ ] Works in dark mode (if theme toggle available)

## Screenshots Required
1. `projects-folder-grid.png` - Full grid of folder cards
2. `projects-color-variants.png` - Showing all 5 colors
3. `projects-hover-state.png` - Hover effect visible
4. `projects-folder-final.png` - Final state after all tests

## Expected Issues / Notes
- Shine effect may be subtle and hard to capture in screenshot
- Color differentiation may vary by monitor calibration
- Hover screenshots require quick timing or dev tools
- If <5 projects, won't see all color variants (create more projects if needed)

## Pass/Fail Criteria
**PASS:** All visual, interactive, functional, and design system criteria met. Navigation works. No regressions.

**FAIL:** Folder shape not visible, rectangular cards still showing, animations broken, navigation broken, or design system violations (hard-coded colors, wrong components).

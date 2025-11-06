# E2E Test: Editor Single Page Layout

Validate that the Edit tab renders Gemini output with proper formatting and that only the editor surface scrolls while the rest of the workflow page stays fixed.

## User Story

As a proposal writer  
I want the generated document to render like a finished document and keep navigation visible  
So that I can confidently edit content without losing context or UI controls

## Pre-configured Test User

Use credentials defined in `.claude/commands/test_e2e.md` (test@tendercreator.dev / TestPass123!).

## Prerequisites

- Dev server running at http://localhost:3000
- Test project with at least one work package that already has generated content (Phase 4 workflow)
- Work package ID recorded or accessible from dashboard

## Test Steps

### 1. Open Work Package Editor
- Navigate to http://localhost:3000 and sign in as the test user.
- From the dashboard, open any project that contains generated work packages.
- Click the "Open" action on a work package that shows status `In Progress` or `Completed`.
- **Verify** URL pattern `/work-packages/[id]` is loaded and the Edit tab becomes available.
- Take Screenshot 1: Requirements tab default state.

### 2. Enter Edit Tab & Verify Formatting
- Click the Edit tab.
- Wait for the editor to hydrate (word count + save status visible).
- **Verify** the document body shows formatted headings (no literal `#` or `##` text).
- **Verify** bold/italic text renders with proper emphasis (no raw `**` nor `_` tokens).
- **Verify** bullet/numbered lists are rendered as list items.
- Take Screenshot 2: Editor showing formatted headings/lists.

### 3. Confirm Editor-Only Scrolling
- Record the current `document.scrollingElement.scrollTop` value via the browser console (expect `0`).
- Scroll through the document using mouse/trackpad while observing:
  - Breadcrumbs, workflow tabs, and action buttons remain fixed on screen.
  - The scroll indicator inside the editor moves while the page scroll position stays the same.
- Re-check `document.scrollingElement.scrollTop` (should still equal `0` or negligible < 5px variance).
- **Verify** the editor container’s `scrollTop` value increases when scrolling.
- Take Screenshot 3: Editor scrolled mid-document while the header/tabs remain visible.

### 4. Regression Quick Checks
- Type a short sentence at the end of the document to ensure editing still works.
- Wait for auto-save and confirm status cycles `Saving...` → `Saved`.
- Navigate back to Generate tab and return to Edit to ensure formatting persists.

## Success Criteria

- The editor renders Markdown without raw Markdown symbols (headings, emphasis, and lists displayed correctly).
- Breadcrumbs, tabs, and the Continue/Back buttons stay visible while scrolling the content.
- Page-level scroll position stays fixed during editor scroll interactions.
- Screenshots captured for steps 1-3.
- Auto-save still triggers successfully after editing.

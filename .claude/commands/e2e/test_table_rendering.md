# E2E Test: Table Rendering in Editor

Validate that markdown tables from AI-generated content render as proper HTML tables with borders, headers, and cell content, and that table toolbar controls work correctly.

## User Story

As a proposal writer
I want tables in generated documents to display properly with borders and structure
So that I can clearly present data like project phases, costs, and compliance matrices

## Pre-configured Test User

Use credentials defined in `.claude/commands/test_e2e.md` (test@tendercreator.dev / TestPass123!).

## Prerequisites

- Dev server running at http://localhost:3000
- Test project with a work package that contains or can generate table content
- Work package in Generate or Edit phase

## Test Steps

### 1. Sign In and Navigate to Work Package
- Navigate to http://localhost:3000 and sign in with test credentials.
- From the dashboard, open any project with work packages.
- Click "Open" on a work package to enter the workflow.
- Navigate to the Generate tab if not already there.
- Take Screenshot 1: Work package workflow page.

### 2. Generate or View Content with Tables
- If content not yet generated:
  - Ensure win themes are generated (Strategy tab)
  - Click "Generate Content" button on Generate tab
  - Wait for generation to complete
- If content already exists, proceed to Edit tab
- **Verify** content generation completes without errors
- Take Screenshot 2: Generated content in Generate tab.

### 3. Enter Edit Tab and Verify Table Rendering
- Click the Edit tab.
- Wait for the editor to hydrate (word count + save status visible).
- **Verify** any markdown tables in the content render as HTML `<table>` elements (not raw pipe characters).
- **Verify** table has visible borders (gray lines around cells).
- **Verify** table header row has distinct styling (gray background).
- **Verify** table cells contain proper content (no escaped HTML, inline formatting works).
- Scroll to table if needed (should be visible in Phase table or similar).
- Take Screenshot 3: Editor showing properly rendered table with borders and headers.

### 4. Test Table Toolbar Controls - Insert Table
- Click in an empty paragraph area of the document.
- Click the Table icon button in the toolbar.
- **Verify** a new 3x3 table is inserted at the cursor position.
- **Verify** the new table has headers in the first row.
- **Verify** table cells are editable (click and type in a cell).
- Take Screenshot 4: Newly inserted table with cursor in cell.

### 5. Test Table Toolbar Controls - Add/Remove Row
- Click inside the newly inserted table.
- Click the "Row+" button in the toolbar.
- **Verify** a new row is added after the current row.
- Click the "Row-" button in the toolbar.
- **Verify** the current row is deleted.
- Take Screenshot 5: Table after adding and removing row.

### 6. Test Table Toolbar Controls - Add/Remove Column
- With cursor still in the table, click the "Col+" button.
- **Verify** a new column is added after the current column.
- Click the "Col-" button in the toolbar.
- **Verify** the current column is deleted.
- Take Screenshot 6: Table after adding and removing column.

### 7. Verify Table Editing and Auto-Save
- Type some text in several table cells.
- Wait for auto-save indicator (should show "Saving..." then "Saved").
- **Verify** save status cycles correctly.
- Navigate to Generate tab and back to Edit tab.
- **Verify** table content and structure persists after navigation.
- Take Screenshot 7: Editor after navigation showing persisted table edits.

### 8. Verify Non-Table Content Still Works
- Scroll to non-table content (headings, paragraphs, lists).
- **Verify** all existing formatting still renders correctly.
- **Verify** no regressions in list rendering, heading rendering, or paragraph formatting.
- Take Screenshot 8: Non-table content showing proper formatting.

## Success Criteria

- Markdown tables from AI generation render as proper HTML tables with borders and headers
- Table toolbar controls (insert, add/remove row/column) all function correctly
- Table cells are editable and support inline formatting
- Auto-save works correctly with table content
- Table content persists after navigation
- No regressions in non-table content rendering (headings, lists, paragraphs)
- All 8 screenshots captured successfully

## Screenshot Directory

test_results/table_rendering/

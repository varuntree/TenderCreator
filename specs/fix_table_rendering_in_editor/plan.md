# Plan: fix_table_rendering_in_editor

## Plan Description
Fix table rendering issue in the TipTap editor where tables from AI-generated content are not properly displayed. Currently, the markdown-to-HTML converter in `content-editor.tsx` only handles headings, lists, and paragraphs, causing tables to render as plain text with pipe characters. This plan adds TipTap Table extension and enhances the markdown parser to properly convert GFM pipe-delimited tables to HTML.

## Plan Objectives
- Add TipTap Table extension to editor for proper table display and editing
- Enhance markdown-to-HTML converter to parse GFM pipe tables (`| col1 | col2 |`)
- Enable basic table editing (add/remove rows/columns)
- Validate table rendering with E2E test

## Problem Statement
When AI (Gemini) generates content with tables in markdown format, the ContentEditor's `convertMarkdownToHtml` function doesn't recognize table syntax. Tables appear as raw text with pipe separators instead of proper HTML `<table>` elements. This affects user experience when editing AI-generated documents that commonly include tables (e.g., project phases, bill of quantities, compliance matrices).

## Solution Statement
Install `@tiptap/extension-table` family of extensions and integrate into the TipTap editor configuration. Update the `convertMarkdownToHtml` function in `content-editor.tsx` to detect and parse GFM pipe-delimited tables into proper HTML `<table>`, `<thead>`, `<tbody>`, `<tr>`, `<th>`, and `<td>` elements. Add table controls to the editor toolbar for basic row/column management.

## Dependencies

### Previous Plans
None - standalone bug fix

### External Dependencies
- `@tiptap/extension-table` - TipTap table extension
- `@tiptap/extension-table-row` - Table row handling
- `@tiptap/extension-table-cell` - Table cell handling
- `@tiptap/extension-table-header` - Table header handling

## Relevant Files

### Core Files to Modify

- **components/workflow-steps/content-editor.tsx** - Main editor component
  - Add Table extensions to TipTap configuration (line 111-121)
  - Update `convertMarkdownToHtml` function to parse table syntax (line 29-88)
  - Enhance editor prose styling for tables

- **components/workflow-steps/editor-toolbar.tsx** - Editor toolbar
  - Add table control buttons (insert table, add/remove row/column)
  - Position alongside existing formatting buttons

### Files to Read for Context

- **libs/ai/content-generation.ts** - Understand content generation output format
- **libs/ai/prompts/generate-content.ts** - Check if prompt requests markdown tables
- **.claude/commands/test_e2e.md** - E2E test framework instructions
- **.claude/commands/e2e/test_editor_single_page.md** - Existing editor E2E test reference

### New Files

- **.claude/commands/e2e/test_table_rendering.md** - E2E test for table functionality

## Acceptance Criteria

1. ✅ TipTap Table extensions installed and configured in ContentEditor
2. ✅ GFM pipe tables in markdown content render as proper HTML tables
3. ✅ Tables display correctly in editor with borders, headers, and cell content
4. ✅ Toolbar has table controls (insert table, add/remove row/column)
5. ✅ Users can add/remove rows and columns via toolbar buttons
6. ✅ Editor prose styling includes proper table CSS (borders, padding, alignment)
7. ✅ Existing content without tables continues to work (no regressions)
8. ✅ E2E test validates table rendering from AI-generated content

## Step by Step Tasks

**EXECUTION RULES:**
- Execute ALL steps below in exact order
- Check Acceptance Criteria - all items are REQUIRED
- Do NOT skip UI/frontend steps if in acceptance criteria
- If blocked, document and continue other steps

### 1. Install TipTap Table Extensions

- Run `npm install @tiptap/extension-table @tiptap/extension-table-row @tiptap/extension-table-header @tiptap/extension-table-cell`
- Verify installation in package.json

### 2. Update ContentEditor with Table Extensions

- Open `components/workflow-steps/content-editor.tsx`
- Import table extensions at top:
  ```typescript
  import Table from '@tiptap/extension-table'
  import TableRow from '@tiptap/extension-table-row'
  import TableHeader from '@tiptap/extension-table-header'
  import TableCell from '@tiptap/extension-table-cell'
  ```
- Add to extensions array in `useEditor` config (after StarterKit):
  ```typescript
  Table.configure({
    resizable: false,
    HTMLAttributes: {
      class: 'border-collapse border border-gray-300',
    },
  }),
  TableRow,
  TableHeader,
  TableCell,
  ```
- Update editor prose classes to include table styling:
  ```typescript
  class: 'prose prose-sm sm:prose lg:prose-lg dark:prose-invert prose-table:border-collapse prose-th:border prose-th:border-gray-300 prose-th:bg-gray-100 prose-th:p-2 prose-td:border prose-td:border-gray-300 prose-td:p-2 mx-auto h-full min-h-full overflow-y-auto px-4 py-4 focus:outline-none'
  ```

### 3. Enhance Markdown-to-HTML Converter for Tables

- In `content-editor.tsx`, update `convertMarkdownToHtml` function
- Add table detection and parsing logic before the line loop (around line 30):
  ```typescript
  const parseTable = (lines: string[], startIndex: number): { html: string; endIndex: number } => {
    const tableLines: string[] = []
    let i = startIndex

    // Collect table lines
    while (i < lines.length && lines[i].trim().includes('|')) {
      tableLines.push(lines[i].trim())
      i++
      if (i < lines.length && !lines[i].trim()) break
    }

    if (tableLines.length < 2) {
      return { html: '', endIndex: startIndex }
    }

    // Parse header
    const headerCells = tableLines[0]
      .split('|')
      .map(cell => cell.trim())
      .filter(cell => cell)

    // Skip separator line (tableLines[1] with dashes)

    // Parse body rows
    const bodyRows = tableLines.slice(2).map(line =>
      line.split('|').map(cell => cell.trim()).filter(cell => cell)
    )

    // Build HTML
    let html = '<table><thead><tr>'
    headerCells.forEach(cell => {
      html += `<th>${applyInlineFormatting(escapeHtml(cell))}</th>`
    })
    html += '</tr></thead><tbody>'

    bodyRows.forEach(row => {
      html += '<tr>'
      row.forEach(cell => {
        html += `<td>${applyInlineFormatting(escapeHtml(cell))}</td>`
      })
      html += '</tr>'
    })

    html += '</tbody></table>'

    return { html, endIndex: i }
  }
  ```
- Modify main loop in `convertMarkdownToHtml` to detect tables:
  ```typescript
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const trimmed = line.trim()

    if (!trimmed) {
      closeList()
      continue
    }

    // Check for table
    if (trimmed.includes('|') && i + 1 < lines.length && lines[i + 1].includes('---')) {
      closeList()
      const { html: tableHtml, endIndex } = parseTable(lines, i)
      if (tableHtml) {
        html.push(tableHtml)
        i = endIndex - 1
        continue
      }
    }

    // ... rest of existing logic (headings, lists, paragraphs)
  }
  ```

### 4. Create Table Toolbar Controls

- Open `components/workflow-steps/editor-toolbar.tsx`
- Import table icon from lucide-react: `import { Table as TableIcon } from 'lucide-react'`
- Add table button group after existing formatting buttons:
  ```tsx
  <div className="flex items-center gap-1 border-l pl-2">
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
      title="Insert Table"
    >
      <TableIcon className="size-4" />
    </Button>
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={() => editor.chain().focus().addRowAfter().run()}
      disabled={!editor.can().addRowAfter()}
      title="Add Row"
    >
      Row+
    </Button>
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={() => editor.chain().focus().deleteRow().run()}
      disabled={!editor.can().deleteRow()}
      title="Delete Row"
    >
      Row-
    </Button>
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={() => editor.chain().focus().addColumnAfter().run()}
      disabled={!editor.can().addColumnAfter()}
      title="Add Column"
    >
      Col+
    </Button>
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={() => editor.chain().focus().deleteColumn().run()}
      disabled={!editor.can().deleteColumn()}
      title="Delete Column"
    >
      Col-
    </Button>
  </div>
  ```

### 5. Test Table Rendering Manually

- Start dev server (`npm run dev`)
- Navigate to work package editor with generated content containing tables
- Verify tables render properly with headers and borders
- Test table toolbar buttons (insert table, add/remove rows/columns)
- Check that non-table content still renders correctly

---
✅ CHECKPOINT: Steps 1-5 complete (Table rendering implemented). Continue to step 6.
---

### 6. Create E2E Test File

- Read `.claude/commands/test_e2e.md` for test framework structure
- Read `.claude/commands/e2e/test_editor_single_page.md` for reference
- Create `.claude/commands/e2e/test_table_rendering.md` with:
  - User story: Validate table rendering in editor
  - Test steps:
    1. Sign in with test credentials
    2. Navigate to work package with table content (or create one)
    3. Trigger content generation (if needed)
    4. Verify table renders as proper HTML table element
    5. Verify table has headers, borders, and proper cell content
    6. Test table toolbar controls (add row, add column)
    7. Verify content saves correctly with table modifications
  - Success criteria: Tables display properly, toolbar works, no regressions
  - Screenshots: Initial editor, table rendered, after toolbar actions

### 7. Run Validation Commands

Execute all validation commands listed below

## Validation Commands

Execute every command to validate the task works correctly.

```bash
# 1. Verify table extensions installed
grep -E "@tiptap/extension-table" package.json

# 2. Check ContentEditor has table imports
grep -E "import.*@tiptap/extension-table" components/workflow-steps/content-editor.tsx

# 3. Verify parseTable function exists
grep -A 5 "parseTable" components/workflow-steps/content-editor.tsx

# 4. Check toolbar has table controls
grep -E "insertTable|addRowAfter|deleteRow" components/workflow-steps/editor-toolbar.tsx

# 5. Build check (no TypeScript errors)
npm run build

# 6. Run E2E test for table rendering
# Read .claude/commands/test_e2e.md, then execute .claude/commands/e2e/test_table_rendering.md
```

**E2E Testing Strategy:**
- Use pre-configured test credentials from test_e2e.md (DO NOT create new users)
- Reference absolute paths for test fixtures in test_fixtures/
- Sign in via email/password: test@tendercreator.dev / TestPass123!
- Execute detailed tests in format of workflow in `.claude/commands/test_e2e.md`

# Implementation log created at:
# specs/fix_table_rendering_in_editor/fix_table_rendering_in_editor_implementation.log

## Notes

### Table Format Support
- Supporting GFM (GitHub Flavored Markdown) pipe tables only
- Format: `| Header 1 | Header 2 |\n|----------|----------|\n| Cell 1   | Cell 2   |`
- Second line must contain dashes (separator row) - this is how we detect tables

### Styling Considerations
- Using Tailwind prose classes for consistent table styling
- Tables will have borders, padding, and header background color
- Responsive on desktop (MVP scope)

### Future Enhancements (Out of Scope)
- Cell merging/splitting
- Column resizing
- Table alignment options
- Grid-style tables (ASCII art format)
- HTML table imports from external sources

### Testing Notes
- Test with various table sizes (2x2, 5x10, etc.)
- Test with empty cells
- Test with inline formatting in cells (bold, italic, code)
- Test with malformed tables (missing pipes, misaligned columns)

## Research Documentation
None required - standard TipTap table implementation

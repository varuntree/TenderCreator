# E2E Test: Selection Edit Flow

## User Story
As a tender writer
I want to highlight a paragraph in the draft document, prompt the AI with a custom instruction, and see the highlighted section replaced with a confident rewrite
So that I can trust the AI bubble to target only the selected text.

## Test Steps
1. Navigate to the `Application URL` and log in using the pre-configured test credentials from `.claude/commands/test_e2e.md` (`test@tendercreator.dev` / `TestPass123!`).
2. Open the first project card on the Projects page, or use the first work package listed under the default project if only one exists.
3. Click the `Open` button for the first work package row to land on `/work-packages/{id}`. Switch to the **Edit** tab inside the workflow tabs.
4. In the TipTap editor, type the placeholder sentence `Our team can deliver this proposal on time.` if the editor is empty, then select that sentence so the green AI highlight covers the text.
5. Wait for the AI instruction bubble to appear, type `Rewrite this sentence with a more confident, client-focused tone referencing the organization name.`, then submit the instruction.
6. Take a screenshot showing the selected text and instruction bubble before submission (`test_results/test_selection_edit_flow/01_selection_before.png`).
7. After the toast confirms success and the highlighted text is replaced, verify the paragraph now contains the word `confident` or a synonym such as `assured`.
8. Take a screenshot of the updated editor content (`test_results/test_selection_edit_flow/02_selection_after.png`).
9. Return the JSON report following the format in `.claude/commands/test_e2e.md` and include both screenshot paths.

## Success Criteria
- The selection bubble stays open while the AI request is running
- The replaced text only changes the highlighted sentence
- The final paragraph contains a stronger adjective (e.g., `confident`, `assured`, `bold`)
- Two screenshots are saved (`01_selection_before.png`, `02_selection_after.png`)

## Output Format
```json
{
  "test_name": "Selection Edit Flow",
  "status": "passed|failed",
  "screenshots": [
    "test_results/test_selection_edit_flow/01_selection_before.png",
    "test_results/test_selection_edit_flow/02_selection_after.png"
  ],
  "error": null
}
```

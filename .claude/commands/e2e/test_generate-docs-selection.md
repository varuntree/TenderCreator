# E2E Test: Generate Documents Selection Flow

## User Story
As a tender writer working inside an active project  
I want to launch the “Generate documents” dialog, choose multiple work packages, and kick off generation in parallel  
So that I can see accurate status feedback without waiting for one long-running call.

## Test Steps
1. Navigate to the `Application URL` and sign in with the provided test credentials.
2. From the dashboard, click **Projects** and open the first available project that already contains work packages.
3. Scroll to the **Work Packages** table and capture a screenshot of the initial state (showing at least three documents with mixed statuses).
4. Click the **Generate All Documents** button.
5. **Verify** the selection dialog appears with every work package listed, displaying checkboxes, requirement counts, and StatusBadges.
6. Capture a screenshot of the dialog before making any selections.
7. Select exactly two pending work packages and confirm the primary CTA text updates to `Generate 2 documents`.
8. Capture a screenshot showing the updated CTA label and the per-row progress badges still idle.
9. Click **Generate 2 documents**.
10. **Verify** the dialog stays open, the rows display `Queued`/`Generating…` badges, and the header summary inside the table updates to indicate generation progress.
11. Wait for generation to finish. **Verify** completed rows display green “Completed” badges and the dialog error banner stays hidden.
12. Capture a screenshot of the finished state (dialog still open, badges showing `Completed`).
13. Close the dialog and confirm the Work Packages table reflects the new statuses (completed rows in green, accurate counts).

## Success Criteria
- Dialog lists all work packages with accurate requirement counts and status badges.
- CTA label switches between singular/plural copy based on selection count.
- Generation progress badges transition through `Queued` → `Generating…` → `Completed` without the dialog crashing.
- Table header copies update while generation runs, then revert to standard pending summary.
- Work package statuses persist as `completed` after closing/reopening the dialog.
- Three screenshots saved to `test_results/test_generate-docs-selection/` capturing: initial table, dialog with updated CTA, dialog after completion.

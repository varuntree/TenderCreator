# E2E Test: Generate All Documents (Two-Document Batch)

Validate the repaired "Generate All Documents" flow, including selection limits, per-document progress, and post-run status updates.

## User Story

As a tender author working inside a project workspace  
I want to generate two documents in one batch with truthful status feedback  
So that I can trust the platform to create multiple deliverables without manual babysitting.

## Test Steps

1. Navigate to the `Application URL` and sign in with the credentials from `.claude/commands/test_e2e.md`.
2. Land on the Projects dashboard and open the first project that has at least two pending work packages (e.g., "Demo Tender").
3. Scroll to the Work Packages table and click the `Generate All Documents` button.
4. **Verify** the dialog headline explains the two-document limit and only two checkboxes are pre-selected.  
   - Take Screenshot `test_results/test_generate_all_documents_fix/01_dialog_limit.png`.
5. Attempt to select a third pending document and **verify** the UI shows the "Limit reached" helper and the checkbox stays disabled.
6. Deselect one of the pre-selected documents, select another pending one, and **verify** the selected counter updates correctly.
7. Click `Generate 2 documents`.
8. **Verify** the dialog stays open, progress badges update to `Queued`/`Generating…`, and any instructions about fallback appear if triggered.  
   - Take Screenshot `test_results/test_generate_all_documents_fix/02_progress.png`.
9. Wait for the Generation Agents panel to display completion stats (success + any failures).  
   - If a document fails, note the error toast, leave the failed box selected, and continue once statuses settle.
10. Close the dialog and confirm the Work Packages table now shows updated statuses (`Completed` or `Not Started`) for the processed rows.  
    - Take Screenshot `test_results/test_generate_all_documents_fix/03_dashboard_status.png`.
11. Reopen the dialog and **verify** completed documents are disabled while remaining pending docs are available for the next batch.

## Success Criteria
- Dialog enforces a maximum of two selected documents with clear helper text.
- Progress badges transition through queued → generating → success/error while dialog remains open.
- Generation Agents panel reflects accurate counts and any fallback notice when applicable.
- Work Packages table reflects new statuses immediately after the run.
- Exactly three screenshots saved using the specified filenames.

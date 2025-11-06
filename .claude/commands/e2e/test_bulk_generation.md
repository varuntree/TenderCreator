# E2E Test: Bulk Document Generation

Test bulk document generation functionality in the TenderCreator application.

## User Story

As a tender response admin
I want to generate all pending tender documents at once
So that I can quickly create complete tender packages without manually processing each document

## Test Steps

### Setup Phase

1. Navigate to `http://localhost:3000`
2. Sign in with credentials:
   - Email: test@tendercreator.dev
   - Password: TestPass123!
3. Take a screenshot of the homepage after sign-in
4. **Verify** user is signed in successfully

### Project Navigation Phase

5. Navigate to the "Projects" page
6. **Verify** at least one project exists in the list
7. Click on a project that has multiple work packages
8. Take a screenshot of the project detail page
9. **Verify** page shows work packages section

### Pre-Generation Verification Phase

10. Scroll to the work packages table
11. Take a screenshot of the work packages table
12. **Verify** "Generate All Documents (N)" button is visible (where N > 0)
13. **Verify** the button shows the correct count of pending documents
14. **Verify** Status column exists in the table
15. **Verify** Status column shows "Not Started" for pending documents
16. **Verify** Status column shows "Completed" for any completed documents

### Bulk Generation Phase

17. Click the "Generate All Documents (N)" button
18. **Verify** browser confirmation dialog appears
19. Accept the confirmation dialog
20. Take a screenshot immediately after clicking (should show loaders)
21. **Verify** loaders (spinning icons) appear in Status column for pending documents
22. **Verify** the "Generate All Documents" button is disabled during generation
23. **Verify** toast notification appears: "Starting generation of N documents..."

### Progress Monitoring Phase

24. Wait for generation to complete (may take 2-5 minutes depending on document count)
25. Monitor the Status column for updates
26. Take a screenshot when first document completes (Status changes to "Completed")
27. **Verify** Status updates progressively as each document completes
28. **Verify** "Generating..." spinner disappears when document completes
29. **Verify** "Completed" badge (green) appears for finished documents

### Completion Verification Phase

30. Wait for all documents to finish generating
31. Take a screenshot of final state
32. **Verify** toast notification shows success: "Generated X of Y documents successfully"
33. **Verify** all Status cells show "Completed" (green badge with checkmark)
34. **Verify** button text changes to "All Documents Generated"
35. **Verify** button is disabled (all documents complete)

### Content Verification Phase

36. Click "Open" button on one of the generated documents
37. Take a screenshot of the work package detail page
38. **Verify** page loads successfully
39. **Verify** "Edit" tab is accessible (content was generated)
40. Click on the "Edit" tab
41. **Verify** TipTap editor shows generated content (not empty)
42. Take a screenshot of the editor with content
43. Navigate back to the project page

### Error Handling Test (Optional)

44. If any documents failed during generation:
    - **Verify** toast shows partial success message
    - **Verify** failed documents still show "Not Started" or error state
    - **Verify** console shows error details

## Success Criteria

- Sign in successful
- Project with work packages loads
- "Generate All Documents" button visible with correct count
- Button confirmation dialog works
- Loaders appear immediately when generation starts
- Status column updates progressively during generation
- All pending documents generate successfully
- Final toast shows success count
- Button changes to "All Documents Generated" when complete
- Generated documents contain content in editor
- At least 5 screenshots captured at key steps
- No JavaScript errors in console during generation

## Notes

- This test may take 3-7 minutes depending on number of documents
- Test requires at least 2 pending work packages to demonstrate bulk generation
- If test project has no pending documents, create a new project first
- Monitor browser console for any errors during generation
- Generation happens in parallel, so multiple documents complete simultaneously

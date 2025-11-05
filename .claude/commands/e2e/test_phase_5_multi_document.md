# E2E Test: Phase 5 Multi-Document Orchestration

Test complete multi-document workflow from RFT analysis through bulk export.

**CRITICAL:** Fix failures immediately, then restart from step 1.

## Test Objectives

- Validate shared context works across multiple work packages
- Verify workflow navigation between documents
- Test bulk export with 8-10 documents
- Ensure state management handles multiple concurrent workflows
- Validate aggregate progress tracking

## Pre-configured Test User

Email: test@tendercreator.dev
Password: TestPass123!

## Test Steps

### 1. Setup - Create Multi-Document Project

- Sign in as test user
- Create new project: "Multi-Document Tender Test"
- Upload `test_fixtures/sample_rft_multi_document.txt` as RFT
- Click "Analyze RFT"
- Wait for analysis
- **Verify** 8-10 work packages created
- Screenshot: `01_multi_document_analysis.png`

**Expected:** All required documents identified, all status='not_started'

### 2. Complete First Work Package Workflow

- Click "Open" on first work package
- Navigate to Strategy → Generate Win Themes → wait
- **Verify** 3-5 themes generated
- Continue to Generation → Generate Content → wait
- **Verify** content appears
- Screenshot: `02_first_document_generated.png`
- Navigate to Export → Export as Word
- **Verify** export succeeds
- Screenshot: `03_first_document_exported.png`

**Expected:** Complete workflow, status changes to 'completed'

### 3. Test Workflow Navigation

- On export success screen
- **Verify** "Continue to Next Document →" button appears
- Screenshot: `04_next_document_navigation.png`
- Click "Continue to Next Document"
- **Verify** navigates to second work package
- Screenshot: `05_second_document_loaded.png`

**Expected:** Smooth navigation to next incomplete work package

### 4. Complete Second Work Package

- Already on second work package
- Strategy → Generate Win Themes → wait
- Generation → Generate Content → wait
- **Verify** content is document-specific
- Screenshot: `06_second_document_content.png`
- Export → Export as Word
- **Verify** status='completed'

**Expected:** Second document completes, context sharing works

### 5. Verify Dashboard Progress

- Click "Back to Dashboard"
- **Verify** 2 work packages show 'completed'
- **Verify** progress: "2 of 10 completed"
- Screenshot: `07_dashboard_progress.png`

**Expected:** Dashboard shows updated progress

### 6. Complete 2-3 More Work Packages

- For third work package: Strategy → Generate → Export
- Repeat for fourth work package
- Goal: 4-5 completed work packages total
- Screenshots: `08_third_complete.png`, `09_fourth_complete.png`

**Expected:** Multiple completions work correctly

### 7. Test Bulk Export

- Return to project dashboard
- **Verify** "Export All Completed" button visible with count
- Screenshot: `10_bulk_export_button.png`
- Click "Export All Completed"
- **Verify** progress modal appears
- Wait for completion
- Screenshot: `11_bulk_export_progress.png`
- **Verify** ZIP downloads
- Screenshot: `12_bulk_export_success.png`

**Expected:** Bulk export succeeds, ZIP downloads

### 8. Verify ZIP Contents

- Open Downloads folder
- Locate ZIP: `Multi_Document_Tender_Test_TenderDocuments_[Date].zip`
- Extract ZIP
- **Verify** 4-5 .docx files present
- **Verify** filenames: `[DocumentType]_[ProjectName].docx`
- Open 2-3 Word files
- **Verify** content present with formatting
- Screenshots: `13_zip_contents.png`, `14_word_file_sample.png`

**Expected:** ZIP contains correct files with proper content

### 9. Test Edge Case - No Completed Packages

- Create another project
- Upload RFT and analyze
- **Verify** "Export All Completed" button NOT visible/disabled
- Screenshot: `15_no_completed_export.png`

**Expected:** Bulk export unavailable when nothing completed

### 10. Test Edge Case - All Complete

- Return to original test project
- Complete all remaining work packages
- On last export screen
- **Verify** button changes to "All Documents Complete"
- Screenshot: `16_all_complete_navigation.png`
- Dashboard shows 100% completion

**Expected:** Navigation adapts when no more work packages

## Success Criteria

✓ Analysis creates 8-10 work packages
✓ Complete workflow for 2 work packages (detailed)
✓ Complete workflow for 2-3 more (fast track)
✓ Navigation between documents works
✓ Shared context works correctly
✓ Content appropriate for each document type
✓ Dashboard progress tracking correct
✓ Bulk export creates ZIP with all completed
✓ ZIP and document naming correct
✓ Word files contain proper content
✓ 16 screenshots captured
✓ No console errors
✓ All API calls succeed

## Performance Validation

- Win themes: <30s per document
- Content generation: <2 min per document
- Bulk export: <30s for 5 documents
- No timeout errors
- Cold starts <5s

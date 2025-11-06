# Plan: bulk-document-generation

## Plan Description
Add bulk document generation feature allowing users to generate all pending work package documents in parallel with real-time progress tracking. When user clicks "Generate All Documents" in work packages table, system auto-generates win themes and content for all pending documents concurrently, shows progress status per document with loaders, and skips already-completed documents.

## User Story
As a tender response admin
I want to generate all required tender documents at once
So that I can quickly create complete tender packages without manually processing each document

## Problem Statement
Current workflow requires users to:
1. Open each work package individually
2. Click through 4-step workflow per document (Requirements → Strategy/Generate → Edit → Export)
3. Wait for each document to complete before starting next
4. Track progress manually across 5-15 documents

For projects with 10+ documents, this takes 20-30 minutes of clicking + waiting. Users want "Generate All" button to batch-process pending documents.

## Solution Statement
**Add "Generate All Documents" feature:**
- New button in work packages table header
- Parallel generation of all pending documents (status != 'completed')
- Skip documents already completed
- Show real-time progress in new Status column with loaders
- Use existing APIs (/win-themes, /generate-content) in parallel
- Simple, robust implementation using Promise.all pattern
- Auto-update table status as each document completes

**Flow:**
1. User clicks "Generate All Documents" button
2. System identifies pending documents
3. Shows loaders for all pending documents in new Status column
4. Calls win-themes + generate-content APIs in parallel
5. Updates progress per document as each completes
6. Shows summary message when all done

## Dependencies

### Previous Plans
None - extends existing work package generation workflow

### External Dependencies
- Existing APIs: `/api/work-packages/[id]/win-themes`, `/api/work-packages/[id]/generate-content`
- Existing Gemini AI integration (no changes)
- Supabase database (no schema changes needed)

## Relevant Files

### Modified Files

**components/work-package-table.tsx**
- Add "Status" column showing: Not Started | Generating... | Completed
- Show loader/spinner in Status column during generation
- Add "Generate All Documents" button in table header
- Update real-time as documents complete
- Disable button if all documents completed

**app/(dashboard)/projects/[id]/page.tsx**
- Pass bulk generation handler to WorkPackageTable
- Refresh work packages after bulk generation completes

**libs/utils/bulk-generation.ts** (NEW)
- Core bulk generation logic
- Parallel API calls using Promise.all
- Progress tracking state management
- Error handling per document

### New Files

**libs/utils/bulk-generation.ts**
- `bulkGenerateDocuments(workPackages: WorkPackage[]): Promise<BulkGenerationResult>`
- For each pending WP: call /win-themes → /generate-content sequentially
- Run all WPs in parallel with Promise.allSettled
- Return results with success/failure per document

**.claude/commands/e2e/test_bulk_generation.md**
- E2E test validating:
  - Generate All button visible when pending docs exist
  - Button disabled when all docs completed
  - Loaders appear during generation
  - Status updates as each completes
  - Final message shows completion summary
  - Can open generated documents and see content

## Acceptance Criteria

1. ✅ "Generate All Documents" button visible in work packages table header
2. ✅ Button shows count: "Generate All Documents (5)" for 5 pending docs
3. ✅ Button disabled if all documents already completed (shows "All Documents Generated")
4. ✅ New "Status" column in table shows: Not Started | Generating... | Completed
5. ✅ Clicking button immediately shows loaders for all pending documents
6. ✅ Progress updates per document as each completes
7. ✅ Skips documents already completed (status = 'completed')
8. ✅ All documents generate in parallel (not sequential blocking)
9. ✅ Shows toast/message on completion: "Generated X of Y documents successfully"
10. ✅ Error handling: if one fails, others continue
11. ✅ Table auto-refreshes after generation completes
12. ✅ Can open generated documents and see content in editor
13. ✅ E2E test passes validating full bulk generation workflow

## Step by Step Tasks

**EXECUTION RULES:**
- Execute ALL steps below in exact order
- Check Acceptance Criteria - all items are REQUIRED
- Do NOT skip UI/frontend steps if in acceptance criteria
- If blocked, document and continue other steps

### 1. Create Bulk Generation Utility

- Create `libs/utils/bulk-generation.ts`
- Define types:
  ```typescript
  type BulkGenerationProgress = {
    workPackageId: string
    status: 'pending' | 'generating_themes' | 'generating_content' | 'completed' | 'error'
    error?: string
  }

  type BulkGenerationResult = {
    succeeded: string[] // work package IDs
    failed: { id: string; error: string }[]
    skipped: string[] // already completed
  }
  ```
- Implement `generateSingleDocument(workPackageId: string)`:
  - Call POST `/api/work-packages/${id}/win-themes`
  - Wait for completion
  - Call POST `/api/work-packages/${id}/generate-content`
  - Return success/error
  - Use try/catch for error handling
- Implement `bulkGenerateDocuments(workPackages: WorkPackage[], onProgress: (progress: BulkGenerationProgress[]) => void)`:
  - Filter pending documents (status != 'completed')
  - Create progress array with initial 'pending' status
  - Map pending docs to `generateSingleDocument()` calls
  - Use `Promise.allSettled()` for parallel execution
  - Update progress callback as each completes
  - Return BulkGenerationResult with success/failure counts
- Add comprehensive error handling (network, API, timeout)

### 2. Add Status Column to Work Package Table

- Open `components/work-package-table.tsx`
- Add new "Status" column after "Assigned To" column
- Column shows:
  - "Not Started" badge (gray) for `status = 'pending'`
  - "Generating..." with spinner for generating state
  - "Completed" badge (green) for `status = 'completed'`
- Use existing badge component pattern from codebase
- Add loading state prop: `generatingIds: string[]` to track which docs are generating
- Show spinner when `workPackage.id` in `generatingIds` array
- Update column width to accommodate status badges

### 3. Add Generate All Documents Button

- In `components/work-package-table.tsx` header section
- Add button above table:
  ```tsx
  <Button
    onClick={onGenerateAll}
    disabled={allCompleted || isGenerating}
  >
    {allCompleted
      ? "All Documents Generated"
      : `Generate All Documents (${pendingCount})`
    }
  </Button>
  ```
- Calculate `pendingCount` from work packages with status != 'completed'
- Calculate `allCompleted` when pendingCount === 0
- Add loading state `isGenerating` during bulk operation
- Style button prominently (primary color, larger size)
- Position in table header section

### 4. Implement Bulk Generation Handler

- In `components/work-package-table.tsx`
- Add state:
  ```typescript
  const [generatingIds, setGeneratingIds] = useState<string[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  ```
- Implement `handleGenerateAll` function:
  - Get pending work packages
  - If none, show toast "All documents already generated"
  - Set `isGenerating = true`
  - Set `generatingIds` to all pending IDs (shows loaders)
  - Call `bulkGenerateDocuments()` with progress callback
  - Progress callback updates `generatingIds` (remove completed ones)
  - On completion:
    - Set `isGenerating = false`
    - Clear `generatingIds`
    - Show toast with results
    - Call parent refresh callback
  - Handle errors gracefully
- Add toast notifications using existing toast pattern

---
✅ CHECKPOINT: Steps 1-4 complete (Core bulk generation logic). Continue to step 5.
---

### 5. Update Project Page Integration

- Open `app/(dashboard)/projects/[id]/page.tsx`
- Add refresh callback to `WorkPackageTable`:
  ```tsx
  <WorkPackageTable
    workPackages={workPackages}
    onRefresh={loadWorkPackages}
  />
  ```
- Ensure `loadWorkPackages()` function fetches fresh data
- Add loading state during refresh (optional)
- No other changes needed (table handles bulk generation internally)

### 6. Add API Error Handling

- In `libs/utils/bulk-generation.ts`
- Add retry logic for failed API calls (max 2 retries)
- Add timeout handling (30s per document generation)
- Graceful degradation: if win-themes fails, skip document
- Log errors to console for debugging
- Return detailed error messages in BulkGenerationResult

### 7. Add Loading States and Animations

- In `components/work-package-table.tsx` Status column
- Use spinner component from shadcn/ui
- Add loading animation during generation
- Smooth transition from "Generating..." to "Completed"
- Add subtle pulse/fade animation for status changes
- Ensure loaders appear immediately when button clicked

### 8. Handle Edge Cases

- No pending documents: show message, disable button
- All documents completed: change button text
- Single document pending: still works (generates one)
- API failures: continue generating others, show summary
- User navigates away: cancel pending requests (cleanup)
- Concurrent requests: debounce button, prevent double-click
- Very large projects (20+ docs): ensure UI doesn't freeze

### 9. Create E2E Test File

- Read `.claude/commands/test_e2e.md` for E2E format
- Read `.claude/commands/e2e/test_basic_query.md` for reference
- Create `.claude/commands/e2e/test_bulk_generation.md`:
  1. Sign in as test@tendercreator.dev
  2. Navigate to project with multiple pending work packages
  3. Verify "Generate All Documents (N)" button visible
  4. Verify Status column shows "Not Started" for pending docs
  5. Click "Generate All Documents"
  6. Verify loaders appear immediately in Status column
  7. Wait for generation to complete
  8. Verify Status column updates to "Completed"
  9. Verify toast notification shows success count
  10. Verify button text changes to "All Documents Generated"
  11. Open one generated document
  12. Verify content exists in editor
  13. Take screenshots at key steps
- Include timeout handling (max 5 min for generation)

---
✅ CHECKPOINT: Steps 5-9 complete (Integration + testing). Continue to step 10.
---

### 10. Run Validation Commands

- Execute all commands in "Validation Commands" section
- Fix TypeScript errors
- Fix build errors
- Manual test in dev environment
- Run E2E test
- Verify zero regressions

## Testing Strategy

### Unit Tests
- `bulkGenerateDocuments()` function:
  - Handles empty work packages array
  - Filters completed documents correctly
  - Calls APIs in correct sequence (themes → content)
  - Returns accurate success/failure counts
  - Handles API errors gracefully
- Progress callback invoked correctly
- State management in table component

### Edge Cases
- No pending documents (all completed)
- Single pending document
- All API calls fail (network error)
- Some succeed, some fail (partial success)
- User navigates away mid-generation
- Concurrent generate all clicks
- Very large projects (20+ documents)
- Documents with no requirements
- API timeout handling (>30s per doc)

## Validation Commands

Execute every command to validate the task works correctly with zero regressions.

```bash
# Check TypeScript errors
npm run type-check

# Build application
npm run build

# Run dev server
npm run dev
# Open http://localhost:3000
# Navigate to project with work packages
# Click "Generate All Documents"
# Verify loaders appear
# Verify status updates
# Verify all documents generated
# Check no console errors

# Run E2E test
# Read .claude/commands/test_e2e.md for setup
# Execute .claude/commands/e2e/test_bulk_generation.md
```

**E2E Testing Strategy:**
- Use pre-configured test credentials from test_e2e.md (DO NOT create new users)
- Reference absolute paths for test fixtures in test_fixtures/
- Sign in via email/password: test@tendercreator.dev / TestPass123!
- Detailed E2E workflow in `.claude/commands/e2e/test_bulk_generation.md`

# Implementation log created at:
# specs/bulk-document-generation/bulk-document-generation_implementation.log

## Notes

### Design Decisions

**Why parallel generation?**
- Gemini API supports concurrent requests
- Faster completion (5-10 min vs 30+ min sequential)
- Better UX (see all progress at once)
- Existing bulk-export uses Promise.all pattern

**Why Promise.allSettled vs Promise.all?**
- `allSettled` continues if one fails (resilient)
- `all` would abort entire batch on single failure
- Better error reporting with allSettled

**Why not background jobs/queue?**
- MVP scope: simple, robust implementation
- No new infrastructure needed
- Existing bulk-export pattern (in-request processing)
- Vercel timeout: 10s (hobby), 60s (pro) - use Edge functions
- Edge functions support longer execution

**Status column vs new Progress column?**
- Reuse existing status field
- No database migration needed
- Simple state management (3 states)
- Matches existing patterns

### Alternative Approaches Considered

**1. Sequential generation (rejected)**
- Pros: Simpler error handling
- Cons: Very slow (5-15 min for 10 docs)

**2. SSE streaming progress (rejected for MVP)**
- Pros: Real-time updates, better UX
- Cons: More complex, needs WebSocket/SSE setup
- Future enhancement

**3. Background job queue (rejected for MVP)**
- Pros: Handles long operations, retry logic
- Cons: New infrastructure, complexity
- Overkill for MVP

**4. Batch size limits (future consideration)**
- Current: No limit (generate all)
- Future: Max 10 concurrent, batch processing
- Gemini rate limits may require throttling

### Performance Considerations

**Estimated times:**
- Win themes generation: 5-10s per document
- Content generation: 30-60s per document
- Total per document: 35-70s
- 10 documents parallel: ~1-2 min total

**Gemini rate limits:**
- Free tier: 60 requests/min
- Each doc = 2 requests (themes + content)
- Max ~30 docs/min (should be fine for MVP)

**Optimizations (future):**
- Cache assembled context (don't rebuild per doc)
- Batch theme generation (single API call for all)
- Stream content generation (show partial results)

### Error Recovery

**Per-document errors:**
- Continue generating others
- Mark failed document in results
- User can retry individually later

**Network errors:**
- Retry 2x before marking failed
- Exponential backoff

**API timeout:**
- 30s timeout per API call
- Show error, allow manual retry

**User abort:**
- Cleanup pending requests
- Show partial results
- Allow re-run for failed docs

### Migration Path

**Existing work packages:**
- No changes needed (backward compatible)
- Status field already exists
- New feature is additive

**Future enhancements:**
- Smart generation (analyze dependencies)
- Cross-document context sharing
- Template-based generation
- Quality scoring before completion

## Research Documentation

Research conducted by Explore agent documented in task output (workflow architecture, API patterns, existing bulk-export implementation).

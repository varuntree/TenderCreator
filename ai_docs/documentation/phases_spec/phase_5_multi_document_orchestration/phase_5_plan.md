# Phase: Multi-Document Orchestration

## Phase Description

Phase 5 scales the single-document workflow from Phase 4 to handle all work packages in a project simultaneously, enabling users to create 5-15+ different tender documents from one RFT. This phase validates that the shared context architecture (all org docs + RFT available to every work package) works correctly across multiple document generations, implements bulk export functionality creating a ZIP file containing all completed documents with proper naming conventions, and adds workflow navigation enhancements suggesting next incomplete work packages. The phase ensures multi-document state management works correctly (tracking status per work package, allowing any order of completion, showing aggregate progress), while maintaining Phase 4's workflow quality for each individual document. Critical for MVP demo: users can analyze one RFT → generate 10+ different documents → bulk export complete tender package, demonstrating the platform's core differentiator vs competitors.

## Phase Objectives

- Validate shared context architecture works across all work packages in project
- Ensure each work package can independently complete Phase 4 workflow (requirements → strategy → generate → edit → export)
- Implement bulk export creating ZIP file with all completed documents
- Add workflow navigation suggesting next incomplete work package after completion
- Verify multi-document state management (status tracking, any-order completion)
- Test complete flow: 1 RFT analysis → 5+ work packages → all workflows → bulk export
- Ensure aggregate progress tracking visible on project dashboard
- Optimize for Vercel free plan deployment (function timeouts, cold starts, bundle size)

## Problem Statement

After Phase 4, users can complete single work package workflows but face limitations preventing real-world tender response:
- **No bulk operations** - Must export each document individually (inefficient for 10+ documents)
- **No workflow guidance** - After completing one document, unclear which to tackle next
- **Untested at scale** - Phase 4 tested single document, unclear if context/state management works for 10+ simultaneous work packages
- **No aggregate visibility** - Can't see overall project completion status across all documents
- **Deployment risk** - Vercel free plan has 10s timeout, Phase 4 operations take 30-90s (potential production failures)

Without Phase 5, platform can't handle real tenders (which require 5-15+ documents), making MVP demo incomplete.

## Solution Statement

Implement bulk export API endpoint accepting project_id, fetching all completed work packages, generating Word documents in parallel (or sequentially for memory management), creating ZIP archive using JSZip library, returning download URL. Add "Export All Completed" button to project dashboard (Phase 3) showing count of completed documents, triggering bulk export with loading progress (X of Y documents exported). Enhance workflow completion screen (Phase 4 export) with "Continue to Next Document →" button that identifies next work package with status='not_started', navigating user directly to maintain workflow momentum. Create comprehensive E2E test completing full workflow for 2 work packages back-to-back, then bulk exporting all, validating context sharing and state management. Optimize critical API routes for Vercel free plan: convert AI generation routes to Edge Runtime with streaming responses (bypass 10s timeout), keep export routes as Node.js runtime (need file system access for docx library), configure next.config.js with standalone output and bundle optimization. Test with realistic RFT creating 8-10 work packages to validate performance and correctness at scale.

## Dependencies

### Previous Phases

**Phase 1 (Core Schema & Project Structure)** - Required:
- Project and work_packages tables fully functional
- Supabase Storage configured for exports
- Multi-tenant isolation via RLS working

**Phase 2 (AI Analysis & Document Decomposition)** - Required:
- Analysis creates 5-15+ work packages per project
- Requirements extracted per work package
- Context assembly pattern established

**Phase 3 (Work Package Assignment)** - Required:
- Project dashboard showing all work packages
- Status tracking per work package (not_started/in_progress/completed)
- Dashboard already calculates aggregate progress (X of Y completed)

**Phase 4 (Single Document Workflow)** - Required:
- Complete workflow functional (requirements → export)
- Content generation using shared context works
- Individual export to Word working
- work_package_content.content populated
- Status auto-transitions on generate/export

### External Dependencies

**New npm packages required:**
- `jszip` - ZIP file creation for bulk export
- `@types/jszip` - TypeScript types

**Already installed (from Phase 4):**
- `docx` - Word document generation
- `file-saver` - File download utility
- All other dependencies present

## Relevant Files

**Read these files to understand E2E test format:**
- `.claude/commands/test_e2e.md` - E2E test runner instructions and credentials
- `.claude/commands/e2e/test_basic_query.md` - Example E2E test format
- `.claude/commands/e2e/test_phase_4_workflow.md` - Phase 4 workflow test (reference for Phase 5)

**Existing files from previous phases:**
- `libs/utils/export-docx.ts` - Word export utility (reuse for bulk export)
- `libs/repositories/work-packages.ts` - Work package operations (extend for bulk queries)
- `libs/repositories/work-package-content.ts` - Content operations (batch fetch)
- `app/(dashboard)/projects/[id]/page.tsx` - Project dashboard (add bulk export button)
- `components/workflow/export-screen.tsx` - Individual export (add navigation to next WP)
- `app/api/work-packages/[id]/generate-content/route.ts` - Generation route (optimize for Vercel)
- `app/api/work-packages/[id]/win-themes/route.ts` - Win themes route (optimize for Vercel)

### New Files

**API Routes** (`app/api/`):
- `app/api/projects/[id]/export/route.ts` - POST bulk export all completed work packages

**Repository Extensions** (`libs/repositories/`):
- `libs/repositories/work-packages.ts` - Add functions:
  - `listCompletedWorkPackages(supabase, projectId): Promise<WorkPackage[]>` - Get all completed WPs
  - `getNextIncompleteWorkPackage(supabase, projectId): Promise<WorkPackage | null>` - Find next not_started WP

**Utilities** (`libs/utils/`):
- `libs/utils/bulk-export.ts` - Bulk export utilities
  - `createBulkExportZip(workPackages: WorkPackage[], contents: WorkPackageContent[]): Promise<Blob>`
  - `generateDocumentFilename(workPackage: WorkPackage, project: Project): string`

**UI Components** (`components/`):
- `components/bulk-export-button.tsx` - Bulk export trigger with progress modal
  - Shows count of completed documents
  - Progress during export: "Exporting X of Y..."
  - Download link on completion

**Vercel Configuration**:
- `next.config.js` - Update with Vercel optimizations
- `vercel.json` - Optional: Route-specific configurations
- Update route configs:
  - `app/api/work-packages/[id]/generate-content/route.ts` - Add `export const runtime = 'edge'`
  - `app/api/work-packages/[id]/win-themes/route.ts` - Add `export const runtime = 'edge'`

**Test Files**:
- `.claude/commands/e2e/test_phase_5_multi_document.md` - Complete multi-document E2E test

**Research Documentation**:
- `ai_docs/documentation/phases_spec/phase_5_multi_document_orchestration/vercel_deployment_research.md` - Already created

**Phase Documentation**:
- `ai_docs/documentation/phases_spec/phase_5_multi_document_orchestration/phase_5_implementation.log` - Implementation tracking

## Acceptance Criteria

✓ User can complete Phase 4 workflow for multiple work packages in same project
✓ Each work package independently generates content using same shared context (org docs + RFT)
✓ Context assembly works correctly for all work packages (no stale data)
✓ Project dashboard shows "Export All Completed" button when at least 1 work package completed
✓ Bulk export button shows count: "Export All Completed (5)"
✓ Clicking bulk export shows progress modal with status
✓ Bulk export generates Word documents for all completed work packages
✓ Bulk export creates ZIP file with proper structure
✓ ZIP file naming convention: `[ProjectName]_TenderDocuments_[Date].zip`
✓ Individual file naming: `[DocumentType]_[ProjectName].docx` (consistent with Phase 4)
✓ Bulk export downloads automatically when complete
✓ After individual export (Phase 4), "Continue to Next Document →" button appears
✓ "Continue to Next" button navigates to first work package with status='not_started'
✓ If no incomplete work packages, button shows "Back to Dashboard" instead
✓ Dashboard aggregate progress updates correctly across multiple work packages
✓ All AI generation routes configured with Edge Runtime for Vercel free plan
✓ Export routes remain Node.js runtime (need docx library)
✓ next.config.js configured with standalone output and optimization
✓ Cold start performance acceptable (<5s initial load)
✓ E2E test validates complete workflow for 2 work packages + bulk export
✓ Test fixture creates realistic project with 8-10 work packages
✓ No TypeScript errors, build succeeds
✓ Build size within Vercel free plan limits
✓ Function execution times within Vercel limits (Edge: no limit, Node: 10s)

## Step by Step Tasks

**EXECUTION RULES:**
- Execute ALL steps below in exact order
- Check Acceptance Criteria - all items are REQUIRED
- Do NOT skip UI/frontend steps if in acceptance criteria
- If blocked, document and continue other steps

### 1. Install Dependencies

**Command:**
```bash
npm install jszip
npm install --save-dev @types/jszip
```

**Verify:**
- Check package.json for jszip
- Run `npm run build` to ensure no conflicts

### 2. Extend Work Package Repository

**File:** `libs/repositories/work-packages.ts`

**Add functions:**

```typescript
/**
 * Get all completed work packages for a project
 * Used for bulk export
 */
export async function listCompletedWorkPackages(
  supabase: SupabaseClient,
  projectId: string
): Promise<WorkPackage[]> {
  const { data, error } = await supabase
    .from('work_packages')
    .select('*')
    .eq('project_id', projectId)
    .eq('status', 'completed')
    .order('order', { ascending: true })

  if (error) throw error
  return data || []
}

/**
 * Get next incomplete work package for workflow navigation
 * Returns first work package with status='not_started'
 * Returns null if all complete
 */
export async function getNextIncompleteWorkPackage(
  supabase: SupabaseClient,
  projectId: string
): Promise<WorkPackage | null> {
  const { data, error } = await supabase
    .from('work_packages')
    .select('*')
    .eq('project_id', projectId)
    .eq('status', 'not_started')
    .order('order', { ascending: true })
    .limit(1)
    .single()

  if (error && error.code !== 'PGRST116') throw error // PGRST116 = no rows
  return data || null
}
```

**Export:** Update exports in `libs/repositories/index.ts`

### 3. Create Bulk Export Utility

**File:** `libs/utils/bulk-export.ts`

**Import:** `import JSZip from 'jszip'`
**Import:** `import { convertMarkdownToDocx } from './export-docx'`

**Function 1:** `generateDocumentFilename`
```typescript
/**
 * Generate filename for individual document in bulk export
 * Format: [DocumentType]_[ProjectName].docx
 */
export function generateDocumentFilename(
  workPackage: WorkPackage,
  project: Project
): string {
  const docType = workPackage.document_type.replace(/[^a-zA-Z0-9]/g, '_')
  const projectName = project.name.replace(/[^a-zA-Z0-9]/g, '_')
  return `${docType}_${projectName}.docx`
}
```

**Function 2:** `createBulkExportZip`
```typescript
/**
 * Create ZIP file containing all completed work package documents
 *
 * @param workPackages - Array of completed work packages
 * @param contents - Array of work package contents (matched by work_package_id)
 * @param project - Project metadata for filenames
 * @returns Blob containing ZIP file
 */
export async function createBulkExportZip(
  workPackages: WorkPackage[],
  contents: WorkPackageContent[],
  project: Project
): Promise<Blob> {
  const zip = new JSZip()

  // Create map for quick content lookup
  const contentMap = new Map(
    contents.map(c => [c.work_package_id, c])
  )

  // Generate and add each document to ZIP
  for (const wp of workPackages) {
    const content = contentMap.get(wp.id)
    if (!content || !content.content) {
      console.warn(`[Bulk Export] No content for work package ${wp.id}, skipping`)
      continue
    }

    // Generate filename
    const filename = generateDocumentFilename(wp, project)

    // Convert markdown to Word document
    const docxBlob = await convertMarkdownToDocx(content.content, {
      title: wp.document_type,
      author: project.created_by, // or user email
      date: new Date()
    })

    // Add to ZIP
    zip.file(filename, docxBlob)
  }

  // Generate ZIP blob
  const zipBlob = await zip.generateAsync({ type: 'blob' })
  return zipBlob
}
```

### 4. Create Bulk Export API Route

**File:** `app/api/projects/[id]/export/route.ts`

**Runtime:** Node.js (need file system for docx library)

```typescript
import { NextResponse } from 'next/server'
import { createServerClient } from '@/libs/supabase/server'
import {
  listCompletedWorkPackages,
  getProject
} from '@/libs/repositories'
import { getWorkPackageContent } from '@/libs/repositories/work-package-content'
import { createBulkExportZip } from '@/libs/utils/bulk-export'

export const runtime = 'nodejs' // Need docx library

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerClient()

    // Verify auth
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const projectId = params.id

    // Get project
    const project = await getProject(supabase, projectId)
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Get all completed work packages
    const workPackages = await listCompletedWorkPackages(supabase, projectId)

    if (workPackages.length === 0) {
      return NextResponse.json({
        error: 'No completed work packages to export'
      }, { status: 400 })
    }

    // Fetch content for all work packages
    const contents = await Promise.all(
      workPackages.map(wp => getWorkPackageContent(supabase, wp.id))
    )

    // Filter out null contents
    const validContents = contents.filter(c => c !== null) as WorkPackageContent[]

    if (validContents.length === 0) {
      return NextResponse.json({
        error: 'No content found for completed work packages'
      }, { status: 400 })
    }

    console.log(`[Bulk Export] Exporting ${validContents.length} documents for project ${projectId}`)

    // Create ZIP file
    const zipBlob = await createBulkExportZip(workPackages, validContents, project)

    // Generate ZIP filename
    const date = new Date().toISOString().split('T')[0] // YYYY-MM-DD
    const projectName = project.name.replace(/[^a-zA-Z0-9]/g, '_')
    const zipFilename = `${projectName}_TenderDocuments_${date}.zip`

    // Upload to Supabase Storage
    const filePath = `${project.organization_id}/exports/${projectId}/${zipFilename}`
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('documents')
      .upload(filePath, zipBlob, { upsert: true })

    if (uploadError) {
      console.error('[Bulk Export] Upload error:', uploadError)
      throw uploadError
    }

    // Get signed URL for download (1 hour expiry)
    const { data: urlData } = await supabase.storage
      .from('documents')
      .createSignedUrl(filePath, 3600)

    console.log(`[Bulk Export] Success: ${validContents.length} documents exported`)

    return NextResponse.json({
      success: true,
      download_url: urlData?.signedUrl,
      filename: zipFilename,
      document_count: validContents.length
    })
  } catch (error) {
    console.error('[Bulk Export] Error:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Export failed'
    }, { status: 500 })
  }
}
```

### 5. Create Bulk Export Button Component

**File:** `components/bulk-export-button.tsx`

**Client Component** ('use client')

```typescript
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Download, Loader2 } from 'lucide-react'
import { toast } from '@/components/ui/use-toast'

interface BulkExportButtonProps {
  projectId: string
  completedCount: number
}

export function BulkExportButton({ projectId, completedCount }: BulkExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false)
  const [showProgress, setShowProgress] = useState(false)

  const handleExport = async () => {
    setIsExporting(true)
    setShowProgress(true)

    try {
      const response = await fetch(`/api/projects/${projectId}/export`, {
        method: 'POST'
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Export failed')
      }

      // Download file
      if (data.download_url) {
        window.location.href = data.download_url
      }

      toast({
        title: 'Export Complete',
        description: `${data.document_count} documents exported successfully`
      })

      setShowProgress(false)
    } catch (error) {
      console.error('Bulk export error:', error)
      toast({
        title: 'Export Failed',
        description: error instanceof Error ? error.message : 'Failed to export documents',
        variant: 'destructive'
      })
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <>
      <Button
        onClick={handleExport}
        disabled={completedCount === 0 || isExporting}
        className="gap-2"
      >
        <Download className="h-4 w-4" />
        Export All Completed ({completedCount})
      </Button>

      <Dialog open={showProgress} onOpenChange={setShowProgress}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Exporting Documents</DialogTitle>
          </DialogHeader>
          <div className="flex items-center gap-3 py-4">
            <Loader2 className="h-6 w-6 animate-spin" />
            <p>Exporting {completedCount} documents...</p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
```

### 6. Update Project Dashboard with Bulk Export

**File:** `app/(dashboard)/projects/[id]/page.tsx`

**Add bulk export button to dashboard:**

```typescript
// In the Server Component, calculate completed count
const completedWorkPackages = workPackages.filter(wp => wp.status === 'completed')
const completedCount = completedWorkPackages.length

// Add to page header or dashboard section
<div className="flex items-center justify-between mb-6">
  <div>
    <h2>Work Packages</h2>
    <p className="text-sm text-muted-foreground">
      {completedCount} of {workPackages.length} completed
    </p>
  </div>

  {completedCount > 0 && (
    <BulkExportButton
      projectId={project.id}
      completedCount={completedCount}
    />
  )}
</div>
```

**Import:** `import { BulkExportButton } from '@/components/bulk-export-button'`

### 7. Add Next Work Package Navigation

**File:** `components/workflow/export-screen.tsx`

**Update export success state to include navigation:**

```typescript
'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'

// Add props
interface ExportScreenProps {
  workPackageId: string
  workPackage: WorkPackage
  projectId: string // Add this
}

// In component, after successful export:
const [nextWorkPackage, setNextWorkPackage] = useState<WorkPackage | null>(null)

useEffect(() => {
  // Fetch next incomplete work package
  fetch(`/api/projects/${projectId}/next-work-package`)
    .then(res => res.json())
    .then(data => setNextWorkPackage(data.work_package))
}, [projectId])

// In success state UI:
<div className="space-y-4">
  <div className="flex items-center gap-3">
    <CheckCircle className="h-8 w-8 text-green-600" />
    <div>
      <h3 className="font-semibold">Export Successful!</h3>
      <p className="text-sm text-muted-foreground">
        {workPackage.document_type} has been exported
      </p>
    </div>
  </div>

  <div className="flex gap-3">
    <Button
      variant="outline"
      onClick={() => router.push(`/projects/${projectId}`)}
    >
      Back to Dashboard
    </Button>

    {nextWorkPackage ? (
      <Button
        onClick={() => router.push(`/work-packages/${nextWorkPackage.id}`)}
        className="gap-2"
      >
        Continue to Next Document
        <ArrowRight className="h-4 w-4" />
      </Button>
    ) : (
      <Button
        onClick={() => router.push(`/projects/${projectId}`)}
      >
        All Documents Complete
      </Button>
    )}
  </div>
</div>
```

### 8. Create Next Work Package API Route

**File:** `app/api/projects/[id]/next-work-package/route.ts`

```typescript
import { NextResponse } from 'next/server'
import { createServerClient } from '@/libs/supabase/server'
import { getNextIncompleteWorkPackage } from '@/libs/repositories'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerClient()

    // Verify auth
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const projectId = params.id

    // Get next incomplete work package
    const workPackage = await getNextIncompleteWorkPackage(supabase, projectId)

    return NextResponse.json({
      work_package: workPackage
    })
  } catch (error) {
    console.error('Next work package error:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Failed to fetch next work package'
    }, { status: 500 })
  }
}
```

---
✅ CHECKPOINT: Steps 1-8 complete (Core functionality). Continue to step 9.
---

### 9. Configure Vercel Optimizations

**File:** `next.config.js`

**Update with Vercel-specific optimizations:**

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Standalone output for Vercel (reduces bundle size)
  output: 'standalone',

  // Optimize for production
  swcMinify: true,

  // External packages (don't bundle)
  experimental: {
    serverComponentsExternalPackages: ['docx'],
  },

  // Image optimization (if using)
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
    ],
  },
}

module.exports = nextConfig
```

### 10. Add Edge Runtime to AI Routes

**File:** `app/api/work-packages/[id]/generate-content/route.ts`

**Add at top of file:**
```typescript
export const runtime = 'edge' // Bypass Vercel 10s timeout
```

**Note:** Gemini SDK should work on Edge Runtime. If issues, keep as 'nodejs' and implement streaming.

**File:** `app/api/work-packages/[id]/win-themes/route.ts`

**Add at top:**
```typescript
export const runtime = 'edge' // Bypass Vercel 10s timeout
```

**File:** `app/api/work-packages/[id]/editor-action/route.ts`

**Add at top:**
```typescript
export const runtime = 'edge' // Fast AI actions
```

### 11. Verify Export Routes Stay Node.js

**Files to check:**
- `app/api/work-packages/[id]/export/route.ts` - Should have `export const runtime = 'nodejs'`
- `app/api/projects/[id]/export/route.ts` - Should have `export const runtime = 'nodejs'`

**Reason:** docx library requires Node.js runtime (uses file system APIs)

### 12. Create Test Fixture for Multi-Document

**File:** `test_fixtures/sample_rft_multi_document.txt`

**Create realistic RFT that will generate 8-10 work packages:**

```text
NSW GOVERNMENT - COMMUNITY CENTRE REDEVELOPMENT
Request for Tender (RFT)

Project Reference: GOV-CC-2025-001
Closing Date: March 31, 2025

SECTION 1: SUBMISSION REQUIREMENTS

All tenderers must submit the following documents:

1. Technical Specification (MANDATORY)
   - Detailed construction methodology
   - Timeline with milestones
   - Resource allocation plan

2. Bill of Quantities (MANDATORY)
   - Itemized cost breakdown
   - Labor and materials
   - Contingency allowances

3. Project Methodology (MANDATORY)
   - Overall approach
   - Phase breakdown
   - Quality assurance processes

4. Risk Register (MANDATORY)
   - Identified risks (minimum 10)
   - Mitigation strategies
   - Risk ownership

5. Work Health & Safety Plan (MANDATORY)
   - Site safety procedures
   - Emergency response protocols
   - Training requirements

6. Quality Management Plan (MANDATORY)
   - Quality standards
   - Inspection procedures
   - Documentation requirements

7. Environmental Management Plan (MANDATORY)
   - Environmental impact assessment
   - Mitigation measures
   - Compliance documentation

8. Subcontractor Management Plan (MANDATORY)
   - List of proposed subcontractors
   - Capability statements
   - Management approach

9. Company Profile (MANDATORY)
   - Company overview
   - Relevant experience
   - Key personnel CVs

10. Insurance Certificates (MANDATORY)
    - Public liability insurance
    - Professional indemnity
    - Workers compensation

SECTION 2: TECHNICAL SPECIFICATION REQUIREMENTS

[Detailed requirements for Technical Specification - 8-10 requirements]
- Must describe construction approach using modular methodology
- Must include detailed timeline with monthly milestones
- Must specify resource allocation (labor, equipment, materials)
- Must address site constraints and access limitations
[etc.]

SECTION 3: BILL OF QUANTITIES REQUIREMENTS

[Detailed requirements for BoQ - 5-7 requirements]
- Must provide itemized breakdown by construction phase
- Must include labor costs with skill categories
- Must include materials with supplier details
[etc.]

[Continue for each document type with 5-8 specific requirements]
```

**Purpose:** E2E test will use this to create project with 8-10 work packages

### 13. Create Multi-Document E2E Test

**File:** `.claude/commands/e2e/test_phase_5_multi_document.md`

```markdown
# E2E Test: Phase 5 Multi-Document Orchestration

Test complete multi-document workflow from RFT analysis through bulk export.

**CRITICAL EXECUTION RULE:** If any test step fails, immediately fix the issue (debug, update code, resolve error), then restart from step 1. Iterate until ALL steps pass without errors.

## Test Objectives

- Validate shared context works across multiple work packages
- Verify workflow navigation between documents
- Test bulk export with 8-10 documents
- Ensure state management handles multiple concurrent workflows
- Validate aggregate progress tracking

## Pre-configured Test User

Use credentials from test_e2e.md:
- Email: test@tendercreator.dev
- Password: TestPass123!

## Test Steps

### 1. Setup - Create Multi-Document Project

**Steps:**
- Sign in as test user
- Create new project: "Multi-Document Tender Test"
- Upload `test_fixtures/sample_rft_multi_document.txt` as RFT
- Click "Analyze RFT"
- Wait for analysis to complete
- **Verify** 8-10 work packages created
- Take screenshot: `01_multi_document_analysis.png`

**Expected:**
- Analysis identifies all required documents
- Work packages show on dashboard
- All status = 'not_started'

### 2. Complete First Work Package Workflow

**Steps:**
- Click "Open" on first work package (e.g., "Technical Specification")
- Navigate to Strategy tab
- Click "Generate Win Themes"
- Wait for generation (~10-15 seconds)
- **Verify** 3-5 themes generated
- Click "Continue to Generation"
- Click "Generate Content"
- Wait for content generation (~30-60 seconds)
- **Verify** content appears in editor
- Take screenshot: `02_first_document_generated.png`
- Make minor edit in editor
- Wait 5 seconds (auto-save)
- Navigate to Export tab
- Click "Export as Word"
- **Verify** export succeeds
- Take screenshot: `03_first_document_exported.png`

**Expected:**
- Complete workflow works same as Phase 4
- Status changes: not_started → in_progress → completed
- Export screen shows success

### 3. Test Workflow Navigation

**Steps:**
- On export success screen, look for navigation buttons
- **Verify** "Continue to Next Document →" button appears
- Take screenshot: `04_next_document_navigation.png`
- Click "Continue to Next Document"
- **Verify** navigates to second work package (status='not_started')
- Take screenshot: `05_second_document_loaded.png`

**Expected:**
- Navigation button finds next incomplete work package
- Smooth transition to next document
- Correct work package loaded (check document type)

### 4. Complete Second Work Package (Abbreviated)

**Steps:**
- Already on second work package (e.g., "Bill of Quantities")
- Strategy tab → Generate Win Themes (wait)
- Generation tab → Generate Content (wait)
- **Verify** content generated successfully
- **Verify** content is different from first document (document-specific)
- Take screenshot: `06_second_document_content.png`
- Navigate to Export tab
- Export as Word
- **Verify** status = 'completed'

**Expected:**
- Second document workflow completes successfully
- Context sharing works (both use same org docs + RFT)
- Generated content appropriate for document type

### 5. Verify Dashboard Progress

**Steps:**
- Click "Back to Dashboard"
- **Verify** project dashboard shows updated status
- **Verify** 2 work packages show status = 'completed' (green badges)
- **Verify** remaining packages show 'not_started' (gray badges)
- **Verify** progress summary: "2 of 10 completed" (or similar)
- Take screenshot: `07_dashboard_progress.png`

**Expected:**
- Dashboard reflects completed work packages
- Aggregate progress correct
- Status badges color-coded correctly

### 6. Complete 2-3 More Work Packages (Fast Track)

**Steps:**
- For third work package:
  - Open → Strategy (generate themes) → Generate (content) → Export
  - Skip detailed verification, focus on completion
- Repeat for fourth work package
- **Optional:** Complete fifth work package
- Goal: Get to 4-5 completed work packages total
- Take screenshot after each: `08_third_complete.png`, `09_fourth_complete.png`

**Expected:**
- Rapid workflow completion works
- No errors with multiple generations
- All documents export successfully

### 7. Test Bulk Export

**Steps:**
- Return to project dashboard
- **Verify** "Export All Completed" button visible
- **Verify** button shows correct count: "Export All Completed (4)" or similar
- Take screenshot: `10_bulk_export_button.png`
- Click "Export All Completed"
- **Verify** progress modal appears: "Exporting X documents..."
- Wait for bulk export to complete (~10-20 seconds)
- Take screenshot: `11_bulk_export_progress.png`
- **Verify** ZIP file downloads automatically
- Take screenshot: `12_bulk_export_success.png`

**Expected:**
- Bulk export button shows correct count
- Export completes without errors
- ZIP file downloaded

### 8. Verify ZIP Contents

**Steps:**
- Open Downloads folder
- Locate ZIP file: `Multi_Document_Tender_Test_TenderDocuments_[Date].zip`
- Extract ZIP file
- **Verify** 4-5 .docx files present (one per completed work package)
- **Verify** filenames follow pattern: `[DocumentType]_[ProjectName].docx`
- Open 2-3 Word files
- **Verify** content present with formatting
- **Verify** each file contains different content (document-specific)
- Take screenshots: `13_zip_contents.png`, `14_word_file_sample.png`

**Expected:**
- ZIP contains correct number of files
- Filenames follow convention
- Word files open without errors
- Content is correct and formatted

### 9. Test Edge Case - No Completed Work Packages

**Steps:**
- Create another new project
- Upload RFT and analyze (creates work packages)
- Return to dashboard with all status='not_started'
- **Verify** "Export All Completed" button NOT visible OR disabled
- Take screenshot: `15_no_completed_export.png`

**Expected:**
- Bulk export unavailable when nothing completed
- Clear messaging (button disabled or hidden)

### 10. Test Edge Case - All Work Packages Complete

**Steps:**
- Return to original test project
- Complete all remaining work packages (if not already done)
- On last work package export screen
- **Verify** "Continue to Next Document" button changes to "All Documents Complete" OR "Back to Dashboard"
- Take screenshot: `16_all_complete_navigation.png`
- Return to dashboard
- **Verify** all work packages show status = 'completed'
- **Verify** bulk export button shows full count

**Expected:**
- Navigation adapts when no more work packages
- Dashboard shows 100% completion
- Bulk export includes all documents

## Success Criteria

✓ Analysis creates 8-10 work packages
✓ Complete workflow for 2 work packages (detailed testing)
✓ Complete workflow for 2-3 more work packages (fast track)
✓ Workflow navigation between documents works
✓ Shared context works (each document gets same org docs + RFT)
✓ Generated content appropriate for each document type
✓ Dashboard progress tracking correct
✓ Bulk export creates ZIP with all completed documents
✓ ZIP file naming correct
✓ Individual document naming correct
✓ Word files contain proper content and formatting
✓ All screenshots captured (16 total)
✓ No console errors during workflow
✓ All API calls succeed

## Performance Validation

- Win themes generation: <30s per document
- Content generation: <2 minutes per document
- Bulk export: <30s for 5 documents
- No timeout errors on Vercel (if deployed)
- Cold starts acceptable (<5s)

## Vercel Deployment Validation (if deployed)

- Edge Runtime routes don't timeout
- Node.js export routes complete successfully
- Function execution times within limits
- No memory issues during bulk export
- Build succeeded on Vercel
- Environment variables set correctly
```

### 14. Test Build Locally

**Command:**
```bash
npm run build
```

**Verify:**
- No TypeScript errors
- Build completes successfully
- Check build output size (should be reasonable)
- No warnings about Edge Runtime incompatibilities

**If build fails:**
- Check for Edge Runtime incompatibilities (some libraries don't work)
- Verify docx library not bundled in Edge routes
- Check for circular dependencies

### 15. Test Multi-Document Flow Manually

**Manual test checklist:**

1. **Create project with 6-8 work packages**
   - Use sample_rft_multi_document.txt
   - Verify analysis creates expected count

2. **Complete 2 work packages fully**
   - First: Technical Specification
   - Second: Bill of Quantities
   - Verify both export successfully

3. **Test navigation**
   - After first export, click "Continue to Next"
   - Verify loads second work package
   - After second export, verify navigation still works

4. **Test bulk export**
   - Return to dashboard
   - Click "Export All Completed (2)"
   - Verify ZIP downloads
   - Extract and verify 2 Word files

5. **Monitor performance**
   - Check console for generation times
   - Verify no timeout errors
   - Check network tab for API calls

6. **Complete 2 more work packages**
   - Third and fourth documents
   - Bulk export again
   - Verify ZIP now has 4 files

### 16. Test Vercel Deployment Locally

**Use Vercel CLI to simulate deployment:**

```bash
# Install Vercel CLI (if not installed)
npm i -g vercel

# Run local Vercel environment
vercel dev
```

**Test in Vercel dev environment:**
- Complete workflow for 1 work package
- Verify Edge Runtime routes work
- Verify export routes work
- Check function execution times in console

**If issues:**
- Check Vercel logs for errors
- Verify environment variables loaded
- Test Edge Runtime compatibility

### 17. Optimize Bundle Size

**Check bundle size:**
```bash
npm run build
# Review .next/static/chunks/ sizes
```

**If bundle too large:**
- Use dynamic imports for heavy components
- Split TipTap editor into separate chunk
- Lazy load docx library

**Add to components if needed:**
```typescript
// Dynamic import for heavy components
const TipTapEditor = dynamic(() => import('@/components/workflow/content-editor'), {
  ssr: false,
  loading: () => <div>Loading editor...</div>
})
```

### 18. Run Full E2E Test

**Command:**
```bash
# Read E2E test instructions
Read .claude/commands/test_e2e.md

# Execute Phase 5 E2E test
Execute .claude/commands/e2e/test_phase_5_multi_document.md
```

**Expected:**
- All 10 test steps pass
- 16 screenshots captured
- No errors in console
- All performance criteria met

**If test fails:**
- Note which step failed
- Review error logs
- Fix issue
- Re-run from step 1

---
✅ CHECKPOINT: Steps 9-18 complete (Optimization & Testing). Continue to step 19.
---

### 19. Create Implementation Log

**File:** `ai_docs/documentation/phases_spec/phase_5_multi_document_orchestration/phase_5_implementation.log`

```
Phase 5: Multi-Document Orchestration - Implementation Log

Start Date: [DATE]
End Date: [DATE]
Status: [Complete / In Progress]

## Summary

Phase 5 successfully scales Phase 4 single-document workflow to handle multiple work packages in parallel, implements bulk export creating ZIP archives, adds workflow navigation between documents, and optimizes for Vercel free plan deployment.

## Key Decisions

1. **Bulk Export Implementation:**
   - Used JSZip library for ZIP creation
   - Only export completed work packages (status='completed')
   - Sequential file generation to manage memory
   - Upload to Supabase Storage with signed URL download

2. **Context Sharing:**
   - Maintained Phase 4 pattern: assemble context per generation
   - No caching implemented (acceptable performance for MVP)
   - Each work package independently fetches org docs + RFT
   - Validated no stale data issues across multiple generations

3. **Workflow Navigation:**
   - "Continue to Next Document" button after export
   - Finds first work package with status='not_started'
   - Gracefully handles case when all complete
   - Improves user flow and demonstrates orchestration

4. **Vercel Optimization:**
   - AI routes (win-themes, generate-content, editor-action): Edge Runtime
   - Export routes (individual, bulk): Node.js Runtime (need docx library)
   - next.config.js: standalone output, external packages
   - No streaming needed (Edge Runtime bypasses timeout)

## Implementation Highlights

**Bulk Export Flow:**
1. Fetch all completed work packages
2. Fetch corresponding work_package_content records
3. Generate Word document for each (using Phase 4 convertMarkdownToDocx)
4. Create ZIP using JSZip
5. Upload ZIP to Supabase Storage
6. Return signed download URL

**Navigation Logic:**
```typescript
getNextIncompleteWorkPackage(projectId) {
  // Query work_packages WHERE status='not_started'
  // ORDER BY order ASC
  // LIMIT 1
  // Returns null if all complete
}
```

**Vercel Configuration:**
```javascript
// next.config.js
output: 'standalone',
experimental: {
  serverComponentsExternalPackages: ['docx']
}

// Route configs
// AI routes: export const runtime = 'edge'
// Export routes: export const runtime = 'nodejs'
```

## Testing Results

**E2E Test: Phase 5 Multi-Document**
- Status: [Passed / Failed]
- Work packages tested: [X]
- Documents completed: [Y]
- Bulk export validated: [Yes/No]
- Screenshots captured: [16/16]

**Performance Metrics:**
- Win themes generation (per document): avg [X]s
- Content generation (per document): avg [X]s
- Bulk export (5 documents): avg [X]s
- Context assembly: avg [X]ms
- Cold start (Vercel local): avg [X]s

**Multi-Document Validation:**
- Tested with [X] work packages in project
- Completed [Y] full workflows
- Bulk exported [Z] documents
- ZIP file size: avg [X] MB
- All Word files opened successfully: [Yes/No]

## Issues Encountered

### Issue 1: [Description]
**Problem:** [What went wrong]
**Solution:** [How it was fixed]
**Files affected:** [List files]

### Issue 2: [If any]
...

## Vercel Deployment

**Local Testing (vercel dev):**
- Edge Runtime routes: [Working/Issues]
- Node.js export routes: [Working/Issues]
- Function execution times: [Within limits/Exceeded]
- Environment variables: [Loaded/Missing]

**Optimization Applied:**
- Bundle size before: [X] MB
- Bundle size after: [Y] MB
- Edge Runtime conversion: [X] routes
- External packages: [docx]

**Known Limitations:**
- Bulk export maximum: ~20 documents (memory constraint)
- ZIP file maximum: ~50 MB (Vercel response limit)
- Cold starts: 1-3s on Vercel free plan
- No context caching (acceptable for MVP)

## Integration with Previous Phases

**Phase 4 Dependencies:**
- work_package_content.content field populated
- convertMarkdownToDocx utility reused
- Individual export pattern extended to bulk
- Status management maintained

**Phase 3 Dashboard:**
- Added bulk export button
- Progress tracking already present (X of Y completed)
- Status badges updated correctly

**Phase 2 Context:**
- Shared context architecture validated
- Multiple work packages use same org docs + RFT
- No interference between parallel generations

## Next Steps

Phase 5 completes MVP core functionality. Ready for Phase 6 (Polish & Demo Prep):
- UI refinement to match TenderCreator exactly
- Loading states and animations
- Error handling improvements
- Demo data setup
- Demo script preparation

## Deployment Checklist

For Vercel deployment:
- [ ] Environment variables set (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, GEMINI_API_KEY)
- [ ] Build succeeds locally
- [ ] Edge Runtime routes tested
- [ ] Node.js export routes tested
- [ ] Bundle size acceptable
- [ ] Cold start performance tested
- [ ] RLS policies enabled on Supabase
- [ ] Storage bucket configured
- [ ] Domain configured (if applicable)

Completed by: [NAME/AI]
Date: [DATE]
```

### 20. Update README (Optional)

**File:** `README.md` (if exists at project root)

**Add Phase 5 completion note:**

```markdown
## Implementation Status

- ✅ Phase 1: Core Schema & Project Structure
- ✅ Phase 2: AI Analysis & Document Decomposition
- ✅ Phase 3: Work Package Assignment & Dashboard
- ✅ Phase 4: Single Document Workflow
- ✅ Phase 5: Multi-Document Orchestration
- ⏳ Phase 6: Polish & Demo Prep

### Phase 5 Features
- Multi-document workflow orchestration
- Bulk export (ZIP file with all completed documents)
- Workflow navigation between documents
- Shared context across all work packages
- Optimized for Vercel free plan deployment
```

### 21. Run Final Validation

**Execute all validation commands from Validation Commands section below**

**Checklist:**
- [ ] Build succeeds (npm run build)
- [ ] Dev server runs (npm run dev)
- [ ] Can complete 2 work package workflows
- [ ] Workflow navigation works
- [ ] Bulk export creates ZIP
- [ ] ZIP contains correct files
- [ ] All Vercel optimizations applied
- [ ] E2E test passes
- [ ] No console errors
- [ ] Performance acceptable

---
✅ CHECKPOINT: Steps 19-21 complete (Documentation & Final Validation). Phase 5 complete.
---

## Validation Commands

Execute every command to validate the phase works correctly.

```bash
# 1. Build check (no TypeScript errors)
npm run build

# 2. Verify build output size
# Check .next/ directory size, should be reasonable (<100MB)
du -sh .next

# 3. Start dev server
npm run dev

# 4. Verify Edge Runtime configuration
# (Code review: Check AI routes have 'export const runtime = "edge"')
# app/api/work-packages/[id]/generate-content/route.ts
# app/api/work-packages/[id]/win-themes/route.ts
# app/api/work-packages/[id]/editor-action/route.ts

# 5. Verify Node.js Runtime configuration
# (Code review: Check export routes have 'export const runtime = "nodejs"')
# app/api/work-packages/[id]/export/route.ts
# app/api/projects/[id]/export/route.ts

# 6. Test multi-document workflow manually
# (Manual: Create project with 8-10 work packages)
# Complete 2 work packages fully
# Verify context sharing (both use same org docs)
# Verify status tracking correct

# 7. Test workflow navigation
# (Manual: After completing first work package)
# Click "Continue to Next Document"
# Verify navigates to second work package
# Complete second work package
# Verify navigation still works

# 8. Test bulk export
# (Manual: With 2+ completed work packages)
# Click "Export All Completed (X)"
# Verify ZIP downloads
# Extract ZIP and verify contents
# Open Word files, verify content correct

# 9. Test bulk export edge cases
# (Manual: Create project with no completed work packages)
# Verify bulk export button hidden or disabled
# Complete all work packages
# Verify bulk export includes all documents

# 10. Test Vercel local environment
vercel dev
# Complete workflow in Vercel dev mode
# Verify Edge Runtime routes work
# Verify export routes work
# Check function execution times

# 11. Run E2E test
# Read .claude/commands/test_e2e.md
# Execute .claude/commands/e2e/test_phase_5_multi_document.md
# Complete all 10 test steps
# Verify all success criteria met
# Confirm 16 screenshots captured

# 12. Performance validation
# (Manual: Monitor during E2E test)
# Win themes generation per document: <30s
# Content generation per document: <2 min
# Bulk export (5 documents): <30s
# No timeout errors

# 13. Verify shared context
# (Manual: Complete 2 work packages with different document types)
# Check generated content references org docs
# Verify both documents use same knowledge base
# Confirm no context pollution between documents

# 14. Verify aggregate progress
# (Manual: On project dashboard)
# Complete 2 of 8 work packages
# Verify progress: "2 of 8 completed"
# Complete 2 more
# Verify progress: "4 of 8 completed"

# 15. Check bundle size
# (After build)
ls -lh .next/static/chunks
# Verify no single chunk >5MB
# TipTap editor should be separate chunk

# 16. Check console for errors
# (Manual: Browser DevTools Console)
# Complete full workflow
# Verify zero errors
# Check for warnings (acceptable if minor)

# 17. Verify API response formats
# (Manual: Network tab during operations)
# All bulk export responses include download_url
# All navigation responses include work_package or null
# All errors return { error: string } format

# 18. Test with realistic data
# (Manual: Use sample_rft_multi_document.txt fixture)
# Analyze RFT
# Verify 8-10 work packages created
# Complete workflows for 5 documents
# Bulk export all
# Verify ZIP structure and file quality

# 19. Validate against acceptance criteria
# (Manual: Review Acceptance Criteria section above)
# Check each item, ensure all ✓
# Document any ✗ or ⚠
# Fix issues before considering phase complete

# 20. Final smoke test
# (Manual: Complete flow without documentation)
# Create project → Upload RFT → Analyze
# Complete 3 work package workflows
# Use workflow navigation
# Bulk export
# Verify all steps smooth
```

**E2E Testing Strategy:**
- Use pre-configured test credentials from test_e2e.md (DO NOT create new users)
- Reference absolute paths for test fixtures in test_fixtures/
- Sign in via email/password: test@tendercreator.dev / TestPass123!
- Detailed workflow tests in `.claude/commands/e2e/test_phase_5_multi_document.md`

# Implementation log created at:
# ai_docs/documentation/phases_spec/phase_5_multi_document_orchestration/phase_5_implementation.log

## Notes

### Critical Implementation Details

**Bulk Export Architecture:**

The bulk export process follows this flow:
1. Query all completed work packages for project
2. Fetch work_package_content for each (parallel Promise.all)
3. Filter out work packages without content (safety check)
4. Generate Word document for each (sequential, using Phase 4 utility)
5. Add each document to JSZip instance
6. Generate ZIP blob
7. Upload to Supabase Storage
8. Return signed download URL

**Memory Management:**
- Generating multiple Word documents can be memory-intensive
- For MVP, sequential generation acceptable (5-10 documents = ~10-30 seconds)
- Future optimization: Worker threads or chunked processing
- Vercel Node.js runtime: 1024 MB memory (sufficient for 20 documents)

**Workflow Navigation Logic:**

```typescript
// After export success, determine next step
const nextWorkPackage = await getNextIncompleteWorkPackage(projectId)

if (nextWorkPackage) {
  // Show "Continue to Next Document →" button
  // Navigate to /work-packages/[nextWorkPackage.id]
} else {
  // All work packages complete
  // Show "All Documents Complete" or "Back to Dashboard"
}
```

Query finds first work package with:
- Same project_id
- Status = 'not_started'
- Ordered by 'order' field (maintains analysis sequence)

**Context Sharing Validation:**

Each work package generation independently calls:
```typescript
const context = await assembleProjectContext(supabase, projectId)
```

This ensures:
- All work packages see same org documents
- All work packages see same RFT documents
- No stale data from previous generations
- Simple implementation (no caching complexity)

Performance acceptable:
- Context assembly: ~500ms-1s (fetching from DB)
- Gemini generation: 30-90s (dominates total time)
- Additional 1s overhead negligible

**Vercel Free Plan Considerations:**

**Edge Runtime Benefits:**
- No timeout limit (vs 10s on Node.js)
- Faster cold starts (~100ms vs ~500ms)
- Smaller runtime overhead

**Edge Runtime Limitations:**
- No file system access (can't use fs module)
- Some npm packages incompatible (native Node.js APIs)
- No support for docx library (uses file system)

**Solution:**
- AI routes (win-themes, generate-content, editor-action): Edge Runtime ✓
- Export routes (individual, bulk): Node.js Runtime ✓
- Export operations are fast enough (<10s) to fit Node.js timeout

**If Node.js timeout issues in production:**
- Option A: Implement streaming for export (send ZIP chunks)
- Option B: Move export to background job (queue system)
- Option C: Upgrade to Vercel Pro ($20/mo, 60s timeout)

For MVP, standard approach should work. Monitor in production.

**ZIP File Structure:**

```
[ProjectName]_TenderDocuments_2025-01-15.zip
├── Technical_Specification_[ProjectName].docx
├── Bill_of_Quantities_[ProjectName].docx
├── Project_Methodology_[ProjectName].docx
├── Risk_Register_[ProjectName].docx
└── ... (all completed documents)
```

**File Naming Convention:**
- ZIP: `[ProjectName]_TenderDocuments_[YYYY-MM-DD].zip`
- Documents: `[DocumentType]_[ProjectName].docx`
- Special characters replaced with underscores
- Consistent with Phase 4 single export naming

**Error Handling:**

**Bulk Export Errors:**
- No completed work packages → 400 error with message
- No content for completed work package → Skip, log warning
- docx generation fails → Log error, skip document, continue
- ZIP creation fails → 500 error with details
- Supabase upload fails → 500 error with details

**Navigation Errors:**
- No next work package → Return null (expected behavior)
- Database query fails → 500 error
- Work package access denied → 401/403 error

**Workflow Errors:**
- Context assembly timeout → Retry once, then error
- Gemini API failure → User-friendly error, allow retry
- Status update failure → Log error, continue (non-critical)

**State Management:**

**Project-Level State:**
- project.status remains 'in_progress' until manually changed
- No auto-transition to 'completed' (user decision)
- Dashboard shows aggregate progress but doesn't change project status

**Work Package-Level State:**
- Each work package tracks own status
- Status transitions: not_started → in_progress → completed
- Multiple work packages can be 'in_progress' simultaneously (UI shows, single user in practice)
- Completed work packages can be re-opened and edited (status stays 'completed' unless regenerated)

**Dashboard Aggregate Progress:**
- Calculated dynamically on each page load
- Formula: `completedCount / totalCount`
- Displayed as: "X of Y completed" with progress bar (optional)
- Used to show/hide bulk export button

**Performance Optimization Strategies:**

**Bundle Size:**
- Use dynamic imports for heavy components
- Code splitting by route (automatic with Next.js)
- External packages configuration (docx not bundled in Edge routes)
- Tree shaking for unused exports

**Cold Start Mitigation:**
- Minimal dependencies in Edge Runtime routes
- Standalone output mode (smaller deployment)
- Next.js 14.2+ (improved cold start performance)

**Database Query Optimization:**
- Batch fetching (Promise.all for multiple work packages)
- Select only needed fields (don't fetch content_text unless needed)
- Proper indexing (project_id, status already indexed from Phase 1)

**File Size Limits:**

**Vercel Response Limits:**
- Edge Runtime: 4 MB response limit
- Node.js Runtime: 4.5 MB response limit
- For large ZIPs: Use Supabase Storage + signed URL (current implementation)

**Supabase Storage Limits:**
- Free tier: 1 GB total storage
- File size: No explicit limit (reasonable: <100 MB per file)
- Bandwidth: 2 GB/month (free tier)

**Our Implementation:**
- ZIP files: 5-10 documents × 100 KB = 0.5-1 MB typical
- Well within limits for MVP
- Signed URL approach bypasses Vercel response limit

**Testing Strategy:**

**Unit Testing (Future):**
- `generateDocumentFilename` - Test special character handling
- `createBulkExportZip` - Test ZIP structure
- `getNextIncompleteWorkPackage` - Test query logic

**Integration Testing:**
- Bulk export API with various work package counts
- Navigation API with different completion states
- Context sharing across multiple generations

**E2E Testing (Current):**
- Complete workflow for 2+ work packages
- Bulk export with 4-5 documents
- Navigation between documents
- Edge cases (no completed, all completed)

**Manual Testing:**
- Realistic RFT with 8-10 work packages
- Complete workflows in various orders
- Verify content quality across documents
- Test on different browsers

**Deployment Validation:**

**Pre-Deployment Checklist:**
1. Environment variables configured:
   - NEXT_PUBLIC_SUPABASE_URL
   - NEXT_PUBLIC_SUPABASE_ANON_KEY
   - SUPABASE_SERVICE_ROLE_KEY
   - GEMINI_API_KEY

2. Build succeeds locally:
   ```bash
   npm run build
   # No errors, reasonable bundle size
   ```

3. Vercel config correct:
   - next.config.js: standalone output, external packages
   - Route configs: Edge vs Node.js runtime

4. Database ready:
   - RLS policies enabled
   - Storage bucket configured
   - All tables present

5. Test in Vercel dev:
   ```bash
   vercel dev
   # Complete workflow end-to-end
   ```

**Post-Deployment Validation:**
1. Visit deployed URL
2. Sign in with test account
3. Complete 1 work package workflow
4. Verify no timeout errors
5. Test bulk export
6. Check Vercel logs for errors

**Rollback Plan:**
If deployment issues:
1. Check Vercel logs for specific errors
2. Verify environment variables set
3. Test Edge Runtime compatibility
4. Rollback to previous deployment if critical
5. Fix locally, redeploy

### Integration with Phase 6

Phase 5 completes core MVP functionality. Phase 6 focuses on polish:

**What Phase 5 Enables:**
- Complete multi-document tender response workflow
- Proof-of-concept fully functional
- Ready for demo with realistic data

**What Phase 6 Will Add:**
- UI refinement to exactly match TenderCreator
- Loading states and animations
- Error handling improvements
- Empty states with helpful messaging
- Demo data setup for consistent demos
- Demo script and practice runs

**No Breaking Changes Expected:**
Phase 6 is purely polish - no new features, no schema changes.
Phase 5 implementation is stable foundation.

### Future Enhancements (Post-MVP)

**Bulk Export Enhancements:**
- Progress tracking (X of Y documents exported)
- Selective export (checkboxes to choose documents)
- Export format options (Word, PDF, both)
- Custom ZIP structure (folders by category)
- Email delivery option (send ZIP to client)

**Workflow Enhancements:**
- Smart navigation (suggest highest priority incomplete work package)
- Parallel editing (multiple users, different work packages)
- Workflow templates (pre-configure document sequences)
- Quick-complete (skip tabs for experienced users)

**Context Optimization:**
- Context caching (assemble once per project, reuse)
- Intelligent truncation (prioritize recent/relevant docs)
- Context compression (summarize lengthy documents)
- Context visualization (show what's included)

**Performance Improvements:**
- Background job queue for bulk export (handle 50+ documents)
- Incremental ZIP generation (stream chunks)
- Worker threads for parallel Word generation
- CDN caching for static assets

### Vercel Deployment Deep Dive

**Function Execution Times:**

Our routes categorized by expected execution time:

**Fast (<1s):**
- Next work package query
- Dashboard data fetching
- Status updates

**Medium (1-10s):**
- Win themes generation: 5-15s (Edge Runtime)
- Editor actions: 5-15s (Edge Runtime)
- Individual export: 5-10s (Node.js Runtime)

**Slow (10-90s):**
- Content generation: 30-90s (Edge Runtime - no timeout)
- Bulk export: 10-30s for 5 docs (Node.js Runtime)

**Risk Assessment:**
- Edge Runtime routes: No timeout risk ✓
- Individual export: Within 10s limit ✓
- Bulk export: Risk if >10 documents (need monitoring)

**Mitigation:**
If bulk export times out:
1. Reduce parallel processing (do sequentially)
2. Implement pagination (export 10 at a time)
3. Move to background job
4. Upgrade to Vercel Pro (60s limit)

**Cold Start Impact:**

User-facing delays:
- First request after deploy: 1-3s cold start
- Subsequent requests: <100ms (warm)
- Edge Runtime: <500ms cold start (better than Node.js)

Mitigation strategies:
- Keep dependencies minimal
- Use Edge Runtime where possible
- Standalone output (smaller cold start)
- Vercel Pro: Always-warm instances (future)

**Build Configuration:**

Optimal `next.config.js`:
```javascript
module.exports = {
  output: 'standalone', // Reduces cold start
  swcMinify: true, // Smaller bundles
  experimental: {
    serverComponentsExternalPackages: ['docx'], // Don't bundle in Edge
  },
  // ... other config
}
```

### Accessibility Considerations

**Bulk Export Accessibility:**
- Button labeled clearly: "Export All Completed (5)"
- Progress modal announced to screen readers
- Keyboard accessible (tab to button, enter to trigger)
- Success/error states communicated

**Navigation Accessibility:**
- "Continue to Next Document" button keyboard accessible
- Focus management on navigation (focus work package heading)
- Screen reader announces document type on navigation

**Dashboard Progress:**
- Aggregate progress announced: "2 of 10 documents completed"
- Status badges have aria-labels: "Status: Completed"
- Visual progress bar supplemented with text

### Security Considerations

**Bulk Export Security:**
- Auth verification before export
- RLS ensures user can only export their org's documents
- Signed URLs expire after 1 hour
- No direct file system access (using Supabase Storage)

**ZIP File Security:**
- Files generated server-side (user can't inject malicious files)
- Filenames sanitized (special characters removed)
- Content comes from database (trusted source)
- No file upload in export process (only download)

**Navigation Security:**
- Auth verified before finding next work package
- RLS ensures user can only access their org's work packages
- No direct work package ID exposure (queried from project)

## Research Documentation

Vercel deployment research completed and documented at:
`ai_docs/documentation/phases_spec/phase_5_multi_document_orchestration/vercel_deployment_research.md`

Key findings:
- Vercel free plan: 10s timeout (Node.js), no timeout (Edge)
- Edge Runtime recommended for AI routes
- Node.js required for export routes (docx library)
- Bundle optimization critical for cold starts
- Environment variables: 1000 limit, 64 KB size (sufficient)
- Bandwidth: 100 GB/month (adequate for MVP)

No additional research sub-agents required for Phase 5.

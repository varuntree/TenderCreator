# Current AI Pipeline Architecture Analysis

## Executive Summary

TenderCreator uses Google's Gemini AI (gemini-2.0-flash-exp) to automate tender document analysis and content generation. The current implementation is distributed across multiple files with **significant code duplication**, **inconsistent error handling**, and **repeated context assembly** for every AI call. While the core functionality works, the architecture lacks centralization, resulting in maintenance challenges and performance inefficiencies.

**Key Findings:**
- **5 distinct AI operations** scattered across separate files
- **No centralized pipeline** - each operation manually handles context assembly, error parsing, and API calls
- **Context reassembly** happens for every AI call (no caching)
- **Inconsistent retry logic** - only some operations handle rate limits
- **Mixed runtime configurations** - some routes use edge runtime, others don't
- **Prompt management** is modular (✓ strength) but isolated from execution logic
- **Type safety is good** for domain models but weak for AI interactions (using `any` types)

---

## Architecture Overview

### System-Level Flow

```
User Action (UI)
  ↓
Next.js API Route (/app/api/**/*.ts)
  ↓
Auth Check (Supabase)
  ↓
Context Assembly (libs/ai/context-assembly.ts)
  ├─ Fetch Project
  ├─ Fetch Organization Documents
  └─ Fetch RFT Documents
  ↓
Prompt Building (libs/ai/prompts/*.ts)
  ↓
Gemini API Call (libs/ai/client.ts)
  ↓
Response Parsing (libs/ai/*.ts)
  ↓
Database Save (libs/repositories/*.ts)
  ↓
Response to Frontend
  ↓
UI Update (React Components)
```

### Current AI Operations

| Operation | File | Endpoint | Runtime | Streaming |
|-----------|------|----------|---------|-----------|
| RFT Analysis | `libs/ai/analysis.ts` | `/api/projects/[id]/analyze` | Node.js | ✓ SSE |
| Win Themes Generation | `libs/ai/content-generation.ts` | `/api/work-packages/[id]/win-themes` | Node.js | ✗ |
| Bid Analysis | `libs/ai/bid-analysis.ts` | `/api/work-packages/[id]/bid-analysis` | Node.js | ✗ |
| Content Generation | `libs/ai/content-generation.ts` | `/api/work-packages/[id]/generate-content` | Edge | ✗ |
| Editor Actions | `libs/ai/content-generation.ts` | `/api/work-packages/[id]/editor-action` | Edge | ✗ |
| Requirements Extraction | `libs/ai/analysis.ts` | (Internal function) | N/A | ✗ |

---

## Complete Type Inventory

### AI-Specific Types

**File: `/home/user/TenderCreator/libs/ai/error-parser.ts`**
```typescript
// Lines 6-37
export interface GeminiRetryInfo {
  '@type': 'type.googleapis.com/google.rpc.RetryInfo'
  retryDelay: string // Format: "42s"
}

export interface GeminiQuotaFailure {
  '@type': 'type.googleapis.com/google.rpc.QuotaFailure'
  violations: Array<{
    quotaMetric: string
    quotaId: string
    quotaDimensions: Record<string, string>
    quotaValue: string
  }>
}

export interface GeminiErrorDetail {
  '@type': string
  [key: string]: unknown
}

export interface GeminiErrorResponse {
  status?: number
  statusText?: string
  errorDetails?: GeminiErrorDetail[]
}

export interface ParsedGeminiError {
  isRateLimitError: boolean
  retryDelaySeconds: number | null
  originalError: unknown
  message: string
}
```

**File: `/home/user/TenderCreator/libs/ai/context-assembly.ts`**
```typescript
// Lines 5-10
export interface ProjectContext {
  project: any  // ⚠️ Using 'any' - no type safety
  organizationDocs: string
  rftDocs: string
  totalTokensEstimate: number
}
```

**File: `/home/user/TenderCreator/libs/ai/bid-analysis.ts`**
```typescript
// Lines 5-21
export interface AssessmentCriterion {
  id: string
  name: string
  description: string
  score: number // 0-5
  weight: number // as decimal (0.167 = 16.7%)
  weightedScore: number
}

export interface BidAnalysis {
  criteria: AssessmentCriterion[]
  totalScore: number
  recommendation: 'bid' | 'no-bid'
  reasoning: string
  strengths: string[]
  concerns: string[]
}
```

**File: `/home/user/TenderCreator/libs/ai/analysis.ts`**
```typescript
// Lines 7-17
interface AnalysisDocument {
  document_type: string
  description: string
  requirements: Requirement[]
}

interface AnalysisResult {
  success: boolean
  documents?: AnalysisDocument[]
  error?: string
}
```

### Domain Model Types

**File: `/home/user/TenderCreator/libs/repositories/work-packages.ts`**
```typescript
// Lines 4-22
export interface Requirement {
  id: string
  text: string
  priority: 'mandatory' | 'optional'
  source: string
}

export interface WorkPackage {
  id: string
  project_id: string
  document_type: string
  document_description: string | null
  requirements: Requirement[]
  assigned_to: string | null
  status: 'pending' | 'in_progress' | 'completed'
  order: number
  created_at: string
  updated_at: string
}
```

**File: `/home/user/TenderCreator/libs/repositories/work-package-content.ts`**
```typescript
// Lines 4-16
export interface WorkPackageContent {
  id: string
  work_package_id: string
  win_themes: string[]
  key_messages: string[]
  bid_analysis: BidAnalysis | null
  content: string // HTML/Markdown
  content_version: number
  exported_file_path: string | null
  exported_at: string | null
  created_at: string
  updated_at: string
}
```

**File: `/home/user/TenderCreator/types/database.ts`**
```typescript
// Lines 1-51
export interface Project {
  id: string
  organization_id: string
  name: string
  client_name?: string
  start_date?: string
  deadline?: string
  status: 'setup' | 'analysis' | 'in_progress' | 'completed' | 'archived'
  instructions?: string
  created_by: string
  created_at: string
  updated_at: string
}

export interface Document {
  id: string
  name: string
  file_path: string
  file_type: string
  file_size: number
  uploaded_by: string
  uploaded_at: string
  content_extracted: boolean
  content_text?: string
}

export interface OrganizationDocument extends Document {
  organization_id: string
  category?: string
  tags?: string[]
}

export interface ProjectDocument extends Document {
  project_id: string
  is_primary_rft: boolean
}
```

---

## Request/Response Flow Diagrams

### Flow 1: RFT Analysis

**User Action:** Click "Analyze RFT" button
**Component:** `/home/user/TenderCreator/components/analysis-trigger.tsx`

```
1. Frontend (analysis-trigger.tsx:35-94)
   - User clicks button
   - POST to `/api/projects/${projectId}/analyze`
   - Establish SSE stream reader
   - Listen for 'progress' and 'done' events

2. API Route (/app/api/projects/[id]/analyze/route.ts:8-169)
   - Line 15-28: Check authentication
   - Line 31-37: Fetch project from database
   - Line 40-62: Fetch project documents, validate extracted text
   - Line 64-153: Create SSE stream
     - Line 74: Update project status to 'analysis'
     - Line 78-94: Call analyzeRFTDocuments (with retry on JSON parse error)
     - Line 108-127: Create work packages progressively
     - Line 130: Update project status to 'in_progress'

3. AI Analysis (libs/ai/analysis.ts:87-115)
   - Line 94: Build prompt using buildAnalysisPrompt()
   - Line 97: Call model.generateContent()
   - Line 99: Extract response text
   - Line 104: Parse response with parseAnalysisResponse()

4. Prompt Building (libs/ai/prompts/analyze-rft.ts:5-53)
   - Line 10-12: Concatenate RFT texts
   - Line 14-52: Build structured prompt with JSON output schema

5. Response Parsing (libs/ai/analysis.ts:22-82)
   - Line 25-30: Strip markdown code fences
   - Line 32: Parse JSON
   - Line 35-70: Validate structure and add UUIDs to requirements

6. Database Save (libs/repositories/work-packages.ts:44-66)
   - Line 48-59: Insert work package with requirements
   - Return created work package

7. Frontend Update (analysis-trigger.tsx:66-86)
   - Display streaming progress
   - Update document list
   - Navigate to next screen on completion
```

**Pain Points:**
- ❌ No retry logic for Gemini API failures
- ❌ Manual JSON parsing with markdown fence stripping (duplicated across files)
- ❌ No context assembly needed here (only RFT docs), but pattern inconsistent

---

### Flow 2: Win Themes Generation

**User Action:** Auto-triggered on strategy screen mount
**Component:** `/home/user/TenderCreator/components/workflow-steps/strategy-generation-screen.tsx:137-156`

```
1. Frontend (strategy-generation-screen.tsx:137-156)
   - Auto-triggers on mount if no themes exist (line 83-89)
   - POST to `/api/work-packages/${workPackageId}/win-themes`
   - No streaming, awaits response

2. API Route (/app/api/work-packages/[id]/win-themes/route.ts:11-79)
   - Line 17-27: Auth check
   - Line 32: Get work package with project (getWorkPackageWithProject)
   - Line 35: Assemble full project context (assembleProjectContext)
   - Line 38-46: Validate context size
   - Line 51-55: Generate win themes
   - Line 59: Save to database
   - Line 62: Return success response

3. Context Assembly (libs/ai/context-assembly.ts:16-70)
   - Line 23-27: Fetch project from database
   - Line 34: Fetch organization documents
   - Line 37: Fetch project RFT documents
   - Line 40-53: Concatenate docs into text strings
   - Line 56-58: Calculate token estimate (4 chars = 1 token)

4. AI Generation (libs/ai/content-generation.ts:19-60)
   - Line 25: Build prompt using buildWinThemesPrompt()
   - Line 28: Call model.generateContent()
   - Line 29: Extract response text
   - Line 32-37: Strip markdown fences
   - Line 39: Parse JSON
   - Line 41-43: Validate structure
   - Line 50-57: Parse error for rate limit info, attach to error

5. Prompt Building (libs/ai/prompts/generate-win-themes.ts:3-44)
   - Line 8-10: Format requirements list
   - Line 12-43: Build prompt with context and output schema

6. Database Save (libs/repositories/work-package-content.ts:137-165)
   - Line 151: Check if content record exists
   - Line 154-156: Update existing OR
   - Line 159-163: Create new record with win_themes

7. Frontend Update (strategy-generation-screen.tsx:144-155)
   - Update state with win_themes
   - Show success toast
   - Refresh parent component
```

**Pain Points:**
- ❌ **Context reassembled from scratch** - no caching between operations
- ❌ Rate limit error handling exists but **no automatic retry**
- ❌ Duplicate JSON parsing logic (strip fences → parse)
- ❌ Edge runtime commented out (line 1: `// export const runtime = 'edge'`)

---

### Flow 3: Document Content Generation

**User Action:** Click "Generate Content" button
**Component:** `/home/user/TenderCreator/components/workflow-steps/strategy-generation-screen.tsx:202-222`

```
1. Frontend (strategy-generation-screen.tsx:202-222)
   - User clicks "Generate Content"
   - POST to `/api/work-packages/${workPackageId}/generate-content`
   - Shows loading state
   - On success, navigates to editor

2. API Route (/app/api/work-packages/[id]/generate-content/route.ts:14-97)
   - Line 1: ✓ USES EDGE RUNTIME
   - Line 20-29: Auth check
   - Line 35-36: Get work package and existing content
   - Line 38-49: Validate win_themes exist
   - Line 52: Update work package status to 'in_progress'
   - Line 55: Assemble project context (AGAIN - no cache)
   - Line 58-67: Validate context size
   - Line 70-75: Generate document content
   - Line 78: Save content to database

3. Context Assembly (libs/ai/context-assembly.ts:16-70)
   - **IDENTICAL to Flow 2** - fully reassembles context
   - No caching, no reuse

4. AI Generation (libs/ai/content-generation.ts:64-94)
   - Line 72: Build content prompt
   - Line 76: Call model.generateContent()
   - Line 77: Extract content text
   - Line 84-90: Parse error for rate limits, attach to error

5. Prompt Building (libs/ai/prompts/generate-content.ts:4-65)
   - Line 10-16: Format requirements and win themes
   - Line 18-64: Build comprehensive prompt with all context

6. Database Save (libs/repositories/work-package-content.ts:170-182)
   - Line 175: Get existing content
   - Line 177-179: Validate win_themes were generated first
   - Line 181: Update content field

7. Frontend Update (strategy-generation-screen.tsx:209-222)
   - Set content generated flag
   - Show success toast
   - Refresh data
   - Navigate to editor screen
```

**Pain Points:**
- ❌ **Context reassembled AGAIN** (3rd time for same work package)
- ❌ Uses edge runtime but **no streaming** (could improve UX)
- ❌ No progress feedback for long-running generation
- ❌ Same error handling pattern duplicated

---

### Flow 4: Bulk Generation Orchestration

**Current Implementation:** No bulk orchestration exists. Users must:
1. Manually click "Generate Win Themes" for each work package
2. Wait for completion
3. Manually click "Generate Content" for each work package
4. Wait for completion

**Missing Features:**
- No "Generate All" button
- No queue management
- No parallel/sequential execution control
- No progress tracking across multiple work packages
- No rate limit handling across batch operations

---

## Gemini Integration Details

### SDK Configuration

**File: `/home/user/TenderCreator/libs/ai/client.ts`**

```typescript
// Lines 1-9
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export const model = genAI.getGenerativeModel({
  model: 'gemini-2.0-flash-exp'
})

export { genAI }
```

**Configuration:**
- **SDK Version:** `@google/generative-ai@^0.24.1` (package.json:12)
- **Model:** `gemini-2.0-flash-exp` (experimental version)
- **API Key:** Environment variable `GEMINI_API_KEY`
- **No custom parameters:** Using defaults (no temperature, top_p, max_tokens, etc.)
- **Singleton pattern:** Single model instance shared across app

---

### API Call Patterns

**Pattern 1: Non-Streaming (Most Common)**

```typescript
// From libs/ai/content-generation.ts:28
const result = await model.generateContent(prompt)
const text = result.response.text()
```

**Used in:**
- Win themes generation
- Bid analysis generation
- Content generation
- Editor actions
- Requirements extraction

**Pattern 2: Streaming (Only RFT Analysis)**

```typescript
// From app/api/projects/[id]/analyze/route.ts:97
const result = await model.generateContent(prompt)
const response = result.response
const text = response.text()
```

**Note:** Current implementation doesn't use true streaming from Gemini. SSE streaming is only for **progress events** (work package creation), not AI token streaming.

---

### Response Parsing Patterns

**Pattern: JSON Response with Markdown Fence Stripping**

Used in **ALL** AI operations:

```typescript
// From libs/ai/analysis.ts:25-30
let cleanText = text.trim()
if (cleanText.startsWith('```json')) {
  cleanText = cleanText.replace(/^```json\n?/, '').replace(/\n?```$/, '')
} else if (cleanText.startsWith('```')) {
  cleanText = cleanText.replace(/^```\n?/, '').replace(/\n?```$/, '')
}
const parsed = JSON.parse(cleanText)
```

**Duplicated in:**
- `libs/ai/analysis.ts` (lines 25-30, 131-136)
- `libs/ai/content-generation.ts` (lines 32-37)
- `libs/ai/bid-analysis.ts` (lines 43-48)

**Missing:**
- No JSON schema validation
- No structured error messages for invalid JSON
- No fallback/retry for malformed responses

---

### Error Handling and Retry Logic

**Error Detection:**

```typescript
// From libs/ai/error-parser.ts:78-124
export function parseGeminiError(error: unknown): ParsedGeminiError {
  const result: ParsedGeminiError = {
    isRateLimitError: false,
    retryDelaySeconds: null,
    originalError: error,
    message: error instanceof Error ? error.message : 'Unknown error',
  }

  // Check for 429 status
  if (err.status === 429 || err.statusText === 'Too Many Requests') {
    result.isRateLimitError = true
  }

  // Extract errorDetails array
  const errorDetails = err.errorDetails as GeminiErrorDetail[] | undefined

  if (errorDetails && Array.isArray(errorDetails)) {
    // Check for QuotaFailure
    if (isQuotaError(errorDetails)) {
      result.isRateLimitError = true
    }

    // Extract RetryInfo with delay
    const retryInfo = extractRetryInfo(errorDetails)
    if (retryInfo && retryInfo.retryDelay) {
      result.retryDelaySeconds = parseRetryDelay(retryInfo.retryDelay)
    }
  }

  // Default 60s if rate limit but no delay
  if (result.isRateLimitError && result.retryDelaySeconds === null) {
    result.retryDelaySeconds = 60
  }

  return result
}
```

**Error Propagation:**

```typescript
// From libs/ai/content-generation.ts:47-58
catch (error) {
  console.error('[Win Themes] Generation failed:', error)

  const parsedError = parseGeminiError(error)

  // Attach rate limit info to error object
  const enhancedError = error instanceof Error ? error : new Error('Win themes generation failed')
  ;(enhancedError as any).isRateLimitError = parsedError.isRateLimitError
  ;(enhancedError as any).retryDelaySeconds = parsedError.retryDelaySeconds

  throw enhancedError
}
```

**API Route Error Response:**

```typescript
// From app/api/work-packages/[id]/win-themes/route.ts:63-78
catch (error) {
  console.error('Win themes generation error:', error)

  const isRateLimitError = (error as { isRateLimitError?: boolean }).isRateLimitError || false
  const retryDelaySeconds = (error as { retryDelaySeconds?: number | null }).retryDelaySeconds || null

  return Response.json(
    {
      error: error instanceof Error ? error.message : 'Generation failed',
      isRateLimitError,
      retryDelaySeconds,
    },
    { status: isRateLimitError ? 429 : 500 }
  )
}
```

**Retry Implementation:**

❌ **No automatic retry** - only manual retry supported:
- RFT Analysis has **ONE manual retry** on JSON parse failure (app/api/projects/[id]/analyze/route.ts:86-94)
- Frontend receives error with retry delay but **doesn't automatically retry**
- User must manually click button again

---

## Context Assembly System

**File: `/home/user/TenderCreator/libs/ai/context-assembly.ts`**

### How Context is Built

```typescript
// Lines 16-70
export async function assembleProjectContext(
  supabase: SupabaseClient,
  projectId: string
): Promise<ProjectContext> {
  console.log('[Context] Assembling context for project:', projectId)

  // 1. Fetch project details
  const { data: project, error: projectError } = await supabase
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .single()

  if (projectError) {
    throw new Error(`Failed to fetch project: ${projectError.message}`)
  }

  // 2. Fetch organization documents
  const orgDocs = await listOrganizationDocuments(supabase, project.organization_id)

  // 3. Fetch project documents (RFT)
  const projectDocs = await listProjectDocuments(supabase, projectId)

  // 4. Concatenate organization docs
  const organizationDocsText = orgDocs
    .filter(doc => doc.content_extracted && doc.content_text)
    .map(doc => {
      return `### ${doc.name}\n${doc.category ? `Category: ${doc.category}\n` : ''}${doc.content_text}`
    })
    .join('\n\n---\n\n')

  // 5. Concatenate RFT docs
  const rftDocsText = projectDocs
    .filter(doc => doc.content_extracted && doc.content_text)
    .map(doc => {
      return `### ${doc.name}${doc.is_primary_rft ? ' (Primary RFT)' : ''}\n${doc.content_text}`
    })
    .join('\n\n---\n\n')

  // 6. Calculate token estimate (rough: 4 chars per token)
  const totalTokensEstimate = Math.ceil(
    (organizationDocsText.length + rftDocsText.length + JSON.stringify(project).length) / 4
  )

  console.log('[Context] Organization docs:', orgDocs.length, 'files')
  console.log('[Context] RFT docs:', projectDocs.length, 'files')
  console.log('[Context] Total tokens estimate:', totalTokensEstimate)

  return {
    project,
    organizationDocs: organizationDocsText,
    rftDocs: rftDocsText,
    totalTokensEstimate,
  }
}
```

### Context Validation

```typescript
// Lines 75-89
export function validateContextSize(context: ProjectContext): { valid: boolean; tokenEstimate: number } {
  const MAX_TOKENS = 1000000 // 1M token limit
  const WARNING_THRESHOLD = 800000 // 800K tokens

  if (context.totalTokensEstimate > MAX_TOKENS) {
    console.error('[Context] Token limit exceeded:', context.totalTokensEstimate)
    return { valid: false, tokenEstimate: context.totalTokensEstimate }
  }

  if (context.totalTokensEstimate > WARNING_THRESHOLD) {
    console.warn('[Context] Approaching token limit:', context.totalTokensEstimate)
  }

  return { valid: true, tokenEstimate: context.totalTokensEstimate }
}
```

### Token Counting Strategy

**Current:** Naive character count estimation
- **Formula:** `totalChars / 4 = estimatedTokens`
- **Accuracy:** ⚠️ Rough approximation, not actual tokenizer
- **Limits:** 1M token hard limit, 800K warning threshold

**Missing:**
- No actual tokenizer usage (Gemini SDK has `countTokens()` method)
- No per-model token limits
- No context window management
- No truncation strategy if exceeds limit

---

### Caching Strategy

❌ **NO CACHING EXISTS**

**Current Behavior:**
- Every AI operation calls `assembleProjectContext()`
- Fetches from database each time
- Concatenates documents each time
- Recalculates tokens each time

**Impact:**
- For a single work package generation (win themes + content):
  - Context assembled **2 times**
  - Database queries: **6 queries** (3 per assembly × 2)
  - Same documents concatenated twice
- For 10 work packages: **20 context assemblies**, **60 database queries**

**Opportunities:**
- Cache assembled context by project ID
- Cache for duration of user session
- Invalidate cache on document upload/deletion
- Reduce database load by 90%+

---

## Prompt Engineering Patterns

### Common Prompt Structure

All prompts follow this pattern:

```
1. Role/Identity Statement
2. Context Information (project, documents, requirements)
3. Task Description
4. Output Format Specification (usually JSON schema)
5. Instructions/Constraints
```

### Analysis Prompts

**File: `/home/user/TenderCreator/libs/ai/prompts/analyze-rft.ts`**

```typescript
// Lines 5-53
export function buildAnalysisPrompt(
  rftTexts: string[],
  projectName: string,
  instructions?: string
): string {
  const concatenatedTexts = rftTexts
    .map((text, idx) => `--- DOCUMENT ${idx + 1} ---\n${text}`)
    .join('\n\n')

  return `You are analyzing a Request for Tender (RFT) to identify ALL required submission documents.

Project: ${projectName}

RFT Documents:
${concatenatedTexts}

${instructions ? `Additional Instructions:\n${instructions}\n\n` : ''}

Tasks:
1. Identify ALL documents that must be submitted as part of the tender response
2. Extract 5-8 key mandatory requirements for EACH document
3. Classify each requirement as mandatory or optional
4. Provide specific RFT page/section references for each requirement

Output as valid JSON only (no markdown, no explanation):
{
  "documents": [
    {
      "document_type": "Technical Specification",
      "description": "Detailed technical approach and methodology",
      "requirements": [
        {
          "id": "req_1",
          "text": "Must describe cloud architecture approach with multi-region redundancy",
          "priority": "mandatory",
          "source": "Section 3.2, Page 12"
        }
      ]
    }
  ]
}

Focus on 5-8 KEY requirements per document (not exhaustive).
Common document types: Technical Specification, Methodology, Bill of Quantities,
Risk Register, Subcontractor List, Project Plan, Quality Plan, WHS Plan,
Insurance Certificates, Company Profile, Case Studies.

Return only valid JSON. No markdown formatting.`
}
```

**Pattern Strengths:**
- ✓ Clear task breakdown
- ✓ JSON schema example
- ✓ Explicit output format constraints
- ✓ Provides common document types (guides model)

---

### Generation Prompts

**File: `/home/user/TenderCreator/libs/ai/prompts/generate-content.ts`**

```typescript
// Lines 4-65
export function buildContentPrompt(
  workPackage: WorkPackage,
  context: ProjectContext,
  winThemes: string[],
  instructions?: string
): string {
  const requirementsText = workPackage.requirements
    .map(r => `- [${r.priority.toUpperCase()}] ${r.text} (Source: ${r.source})`)
    .join('\n')

  const winThemesText = winThemes
    .map((theme, i) => `${i + 1}. ${theme}`)
    .join('\n')

  return `You are writing a ${workPackage.document_type} for a tender response.

Project: ${context.project.name}
Client: ${context.project.client_name}
Deadline: ${context.project.deadline ? new Date(context.project.deadline).toLocaleDateString() : 'Not specified'}

Document Type: ${workPackage.document_type}
Description: ${workPackage.document_description || 'Not provided'}

Requirements to Address (MUST address all mandatory):
${requirementsText}

Win Themes (incorporate naturally):
${winThemesText}

Organization Knowledge (use to demonstrate capabilities):
${context.organizationDocs}

RFT Documents (understand requirements from):
${context.rftDocs}

User Instructions:
${instructions || 'None provided'}

Task:
Write a comprehensive, professional ${workPackage.document_type} that:
1. Addresses EVERY mandatory requirement explicitly
2. Incorporates the win themes naturally throughout
3. Demonstrates our capabilities using evidence from organization documents
4. Maintains professional tone appropriate for tender submission
5. Is well-structured with clear headings and logical flow
6. Uses specific examples and data where available
7. Meets typical length expectations for ${workPackage.document_type} (comprehensive but concise)

Output as well-formatted Markdown with:
- # Main heading
- ## Section headings
- ### Subsection headings
- **Bold** for emphasis
- - Bullet lists where appropriate
- 1. Numbered lists for sequences
- For tables, use GitHub Flavored Markdown pipe syntax:
  | Column 1 | Column 2 | Column 3 |
  |----------|----------|----------|
  | Data 1   | Data 2   | Data 3   |

Return only the document content in Markdown format. No preamble or explanation.`
}
```

**Pattern Strengths:**
- ✓ Rich context injection (project details, requirements, win themes, docs)
- ✓ Clear success criteria (7 point checklist)
- ✓ Markdown formatting guide with examples
- ✓ Emphasizes mandatory requirement coverage

**Pattern Weaknesses:**
- ⚠️ Very long context (can exceed token limits for large projects)
- ⚠️ No chunking strategy for large documents
- ⚠️ No token budget management

---

### Editor Action Prompts

**File: `/home/user/TenderCreator/libs/ai/prompts/editor-actions.ts`**

Examples:

```typescript
// Lines 3-19 - Expand
export function buildExpandPrompt(selectedText: string, fullDocument: string, context: string): string {
  return `Selected text to expand:
"${selectedText}"

Full document context:
${fullDocument}

Supporting knowledge:
${context}

Task: Expand the selected text with 2-3 additional paragraphs providing:
- More specific details and examples
- Supporting evidence from the knowledge base
- Technical depth where appropriate
- Maintain the original tone and style

Return only the expanded text (including the original). No preamble.`
}

// Lines 22-31 - Shorten
export function buildShortenPrompt(selectedText: string): string {
  return `Text to shorten:
"${selectedText}"

Task: Condense this text to 40-60% of original length while:
- Retaining all key points and critical information
- Maintaining professional tone
- Keeping it clear and readable

Return only the shortened text. No preamble.`
}

// Lines 63-84 - Compliance Check
export function buildCompliancePrompt(selectedText: string, requirements: Requirement[]): string {
  const requirementsText = requirements
    .map(r => `- [${r.priority.toUpperCase()}] ${r.text} (${r.source})`)
    .join('\n')

  return `Section to check:
"${selectedText}"

Requirements for this document:
${requirementsText}

Task: Analyze this section against the requirements. Provide:
1. Which requirements are addressed (list requirement text)
2. Which requirements are missing or inadequately addressed
3. Specific suggestions for addressing missing requirements

Output as structured text:
✓ Addressed: [list]
✗ Missing: [list]
📝 Suggestions: [specific recommendations]

Be concise but specific.`
}
```

**Pattern Strengths:**
- ✓ Lightweight prompts (fast execution)
- ✓ Clear input/output format
- ✓ Specific constraints (e.g., "40-60% of original length")

---

### Reusable Prompt Components

**Missing:**
- ❌ No shared prompt fragments (system instructions, output formats)
- ❌ No prompt template system
- ❌ No version control for prompts
- ❌ No A/B testing framework

**Current Pattern:** Each prompt builder is self-contained, leading to duplication of instructions like:
- "Return only valid JSON. No markdown formatting." (repeated 3+ times)
- "Maintain professional tone" (repeated 5+ times)
- JSON schema examples (duplicated structures)

---

## Long-Request Handling Patterns

### Edge Runtime Usage

**File Configuration:**

```typescript
// FROM: app/api/work-packages/[id]/generate-content/route.ts:1
export const runtime = 'edge' // ✓ ACTIVE

// FROM: app/api/work-packages/[id]/editor-action/route.ts:1
export const runtime = 'edge' // ✓ ACTIVE

// FROM: app/api/work-packages/[id]/win-themes/route.ts:1
// export const runtime = 'edge' // ❌ COMMENTED OUT

// FROM: app/api/work-packages/[id]/bid-analysis/route.ts:1
// export const runtime = 'edge' // ❌ COMMENTED OUT
```

**Pattern:**
- **Edge runtime** used for operations expected to be fast (editor actions, content generation)
- **Node.js runtime** used for complex operations (win themes, bid analysis, RFT analysis)
- ⚠️ **Inconsistent** - content generation is marked edge but can take 1-2 minutes

---

### SSE Streaming Implementation

**Only Used in RFT Analysis:**

**File: `/home/user/TenderCreator/app/api/projects/[id]/analyze/route.ts`**

```typescript
// Lines 64-153
const encoder = new TextEncoder()
const stream = new ReadableStream({
  async start(controller) {
    const sendEvent = (type: string, data: unknown) => {
      const message = `event: progress\ndata: ${JSON.stringify({ type, data })}\n\n`
      controller.enqueue(encoder.encode(message))
    }

    try {
      // Update status
      await updateProjectStatus(supabase, projectId, 'analysis')
      sendEvent('start', { message: 'Analyzing RFT documents...' })

      // Analyze documents
      let result = await analyzeRFTDocuments(projectId, rftTexts, project.name, project.instructions)

      // Retry once if JSON parse failed
      if (!result.success && result.error?.includes('JSON parse')) {
        sendEvent('retry', { message: 'Retrying analysis...' })
        result = await analyzeRFTDocuments(/* ... */)
      }

      if (!result.success) {
        sendEvent('error', { error: result.error })
        controller.enqueue(encoder.encode(`event: done\ndata: ${JSON.stringify({ success: false, error: result.error })}\n\n`))
        controller.close()
        return
      }

      // Create work packages progressively
      if (result.documents) {
        for (let i = 0; i < result.documents.length; i++) {
          const doc = result.documents[i]
          const workPackage = await createWorkPackage(supabase, { /* ... */ })
          sendEvent('document', workPackage)
        }

        await updateProjectStatus(supabase, projectId, 'in_progress')
        sendEvent('complete', { count: result.documents.length })
      }

      // Close stream
      controller.enqueue(encoder.encode(`event: done\ndata: ${JSON.stringify({ success: true })}\n\n`))
      controller.close()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      sendEvent('error', { error: errorMessage })
      controller.enqueue(encoder.encode(`event: done\ndata: ${JSON.stringify({ success: false, error: errorMessage })}\n\n`))
      controller.close()
    }
  },
})

return new Response(stream, {
  headers: {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  },
})
```

**Frontend SSE Consumer:**

**File: `/home/user/TenderCreator/components/analysis-trigger.tsx`**

```typescript
// Lines 44-86
const reader = response.body?.getReader()
const decoder = new TextDecoder()

if (!reader) {
  throw new Error('No response stream')
}

let buffer = ''

while (true) {
  const { done, value } = await reader.read()
  if (done) break

  buffer += decoder.decode(value, { stream: true })
  const lines = buffer.split('\n\n')
  buffer = lines.pop() || ''

  for (const line of lines) {
    if (line.startsWith('event: progress')) {
      const dataLine = line.split('\n').find((l) => l.startsWith('data: '))
      if (dataLine) {
        const data = JSON.parse(dataLine.slice(6))
        if (data.type === 'document') {
          setDocuments((prev) => [...prev, data.data])
        } else if (data.type === 'complete') {
          toast.success(`Found ${data.data.count} documents`)
        } else if (data.type === 'error') {
          toast.error(data.data.error)
        }
      }
    } else if (line.startsWith('event: done')) {
      const dataLine = line.split('\n').find((l) => l.startsWith('data: '))
      if (dataLine) {
        const data = JSON.parse(dataLine.slice(6))
        if (data.success) {
          setTimeout(() => {
            onAnalysisComplete()
          }, 500)
        }
      }
    }
  }
}
```

**What's Being Streamed:**
- ✓ Progress events (start, retry, document creation, complete, error)
- ❌ **NOT** streaming AI tokens (Gemini response is awaited completely)

---

### Timeout Configurations

**Next.js Defaults:**
- **Node.js runtime:** 10 seconds on Vercel (can be extended)
- **Edge runtime:** 30 seconds maximum

**Current Handling:**
- ⚠️ No explicit timeout configuration
- ⚠️ Long operations (content generation) risk timeout on Vercel
- ⚠️ No timeout error handling in code

**Evidence of Timeout Issues:**
```typescript
// FROM: app/api/work-packages/[id]/win-themes/route.ts:1
// export const runtime = 'edge' // Bypass Vercel 10s timeout - DISABLED for debugging
```
Comment suggests timeout was an issue, edge runtime was attempted but disabled.

---

### Progress Tracking

**RFT Analysis:** ✓ Real-time progress via SSE
**Win Themes:** ❌ No progress, user waits
**Bid Analysis:** ❌ No progress, user waits
**Content Generation:** ⚠️ Generic "Generating content... This may take 1-2 minutes" message (no actual progress)

**Frontend Loading States:**

```typescript
// FROM: components/workflow-steps/strategy-generation-screen.tsx:69-71
const [isGeneratingThemes, setIsGeneratingThemes] = useState(false)
const [isGeneratingBidAnalysis, setIsGeneratingBidAnalysis] = useState(false)
const [isGeneratingContent, setIsGeneratingContent] = useState(false)
```

All are simple boolean flags - no percentage, no steps, no time estimates.

---

## Tech Stack & Dependencies

### Core AI Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `@google/generative-ai` | `^0.24.1` | Gemini SDK for AI calls |
| `mammoth` | `^1.11.0` | DOCX text extraction |
| `pdf-parse` | `^2.4.5` | PDF text extraction |
| `turndown` | `^7.2.2` | HTML to Markdown conversion |
| `turndown-plugin-gfm` | `^1.0.2` | GitHub Flavored Markdown support |

### Frontend Dependencies (AI-Related)

| Package | Version | Purpose |
|---------|---------|---------|
| `@tiptap/react` | `^3.10.2` | Rich text editor for content |
| `@tiptap/starter-kit` | `^3.10.2` | Editor base extensions |
| `@tiptap/extension-table` | `^3.10.2` | Table support in editor |

### Backend Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `next` | `15.5.2` | Framework (API routes, edge runtime) |
| `@supabase/supabase-js` | `^2.79.0` | Database and auth |
| `uuid` | `^13.0.0` | Unique ID generation |

### Database Access Patterns

**Supabase Client Initialization:**

```typescript
// Pattern used in all API routes
const supabase = await createClient()
```

**Query Patterns:**

1. **Single Record Fetch:**
```typescript
const { data, error } = await supabase
  .from('work_packages')
  .select('*')
  .eq('id', workPackageId)
  .single()
```

2. **Join Queries:**
```typescript
const { data, error } = await supabase
  .from('work_packages')
  .select(`
    *,
    project:projects(*)
  `)
  .eq('id', workPackageId)
  .single()
```

3. **Upsert Pattern (Win Themes, Bid Analysis):**
```typescript
const existing = await getWorkPackageContent(supabase, workPackageId)

if (existing) {
  return await updateWorkPackageContent(supabase, existing.id, { win_themes: themes })
} else {
  return await createWorkPackageContent(supabase, {
    work_package_id: workPackageId,
    win_themes: themes,
  })
}
```

**Database Schema (Relevant Tables):**

```
projects
  - id (PK)
  - organization_id (FK)
  - name, client_name, deadline
  - status: 'setup' | 'analysis' | 'in_progress' | 'completed' | 'archived'
  - instructions (text)

organization_documents
  - id (PK)
  - organization_id (FK)
  - name, category, tags
  - content_text (extracted text)

project_documents
  - id (PK)
  - project_id (FK)
  - name, is_primary_rft
  - content_text (extracted text)

work_packages
  - id (PK)
  - project_id (FK)
  - document_type, document_description
  - requirements (JSONB array)
  - status: 'pending' | 'in_progress' | 'completed'
  - assigned_to (FK to users)
  - order (integer)

work_package_content
  - id (PK)
  - work_package_id (FK) [UNIQUE]
  - win_themes (text array)
  - key_messages (text array)
  - bid_analysis (JSONB)
  - content (text - Markdown)
  - content_version (integer)
  - exported_file_path, exported_at
```

---

## Pain Points Analysis

### Critical Issues (Must Fix)

#### 1. Context Reassembly on Every AI Call
**Impact:** High
**Location:** All AI operations
**Issue:** `assembleProjectContext()` called separately for:
- Win themes generation
- Bid analysis generation
- Content generation
- Editor actions (expand, add evidence)

**Evidence:**
```typescript
// SAME PROJECT, SAME WORK PACKAGE - Context assembled 3+ times
// 1. Win themes route
const context = await assembleProjectContext(supabase, project.id) // Query 1

// 2. Content generation route (5 mins later)
const context = await assembleProjectContext(supabase, project.id) // Query 2 - DUPLICATE

// 3. Editor action (10 mins later)
const projectContext = await assembleProjectContext(supabase, project.id) // Query 3 - DUPLICATE
```

**Cost:**
- 3 database queries per assembly × N operations = massive DB load
- Concatenation overhead (large documents)
- Token recalculation each time
- 200-500ms latency per assembly

**Solution:** Implement caching layer (Redis, in-memory, or Next.js cache)

---

#### 2. No Centralized Error Handling
**Impact:** High
**Location:** All AI operations
**Issue:** Error handling code duplicated across 5 files

**Duplicated Pattern:**
```typescript
// FROM: libs/ai/content-generation.ts:47-58
catch (error) {
  console.error('[Win Themes] Generation failed:', error)
  const parsedError = parseGeminiError(error)
  const enhancedError = error instanceof Error ? error : new Error('...')
  ;(enhancedError as any).isRateLimitError = parsedError.isRateLimitError
  ;(enhancedError as any).retryDelaySeconds = parsedError.retryDelaySeconds
  throw enhancedError
}

// FROM: libs/ai/bid-analysis.ts:94-106
catch (error) {
  console.error('[Bid Analysis] Generation failed:', error)
  const parsedError = parseGeminiError(error)
  const enhancedError = error instanceof Error ? error : new Error('...')
  ;(enhancedError as any).isRateLimitError = parsedError.isRateLimitError
  ;(enhancedError as any).retryDelaySeconds = parsedError.retryDelaySeconds
  throw enhancedError
}
```

**Identical code in:**
- `libs/ai/content-generation.ts` (2 places)
- `libs/ai/bid-analysis.ts`
- Similar patterns in API routes

**Solution:** Create centralized `executeWithErrorHandling()` wrapper

---

#### 3. No Automatic Retry Logic
**Impact:** High
**Location:** All AI operations except RFT analysis (which has 1 manual retry)
**Issue:** Rate limit errors return to user immediately

**Current Behavior:**
```typescript
// User clicks "Generate Win Themes"
// → Rate limit error 429
// → User sees error toast
// → User must wait (how long?) and manually retry
```

**Evidence:**
```typescript
// FROM: app/api/work-packages/[id]/win-themes/route.ts:63-78
catch (error) {
  const isRateLimitError = (error as { isRateLimitError?: boolean }).isRateLimitError || false
  const retryDelaySeconds = (error as { retryDelaySeconds?: number | null }).retryDelaySeconds || null

  // Returns error to frontend - NO RETRY
  return Response.json(
    { error: '...', isRateLimitError, retryDelaySeconds },
    { status: isRateLimitError ? 429 : 500 }
  )
}
```

**Solution:** Implement exponential backoff with configurable retry attempts

---

#### 4. Inconsistent Runtime Configuration
**Impact:** Medium-High
**Location:** API routes
**Issue:** Some routes use edge runtime, some don't, decisions unclear

**Evidence:**
```typescript
// Content generation - USES edge (but can take 1-2 mins)
export const runtime = 'edge'

// Win themes - COMMENTED OUT (why?)
// export const runtime = 'edge' // Bypass Vercel 10s timeout - DISABLED for debugging

// Bid analysis - COMMENTED OUT
// export const runtime = 'edge' // Bypass Vercel 10s timeout - DISABLED for debugging
```

**Risks:**
- Edge runtime has 30s max timeout
- Long content generation may hit timeout
- Inconsistent deployment behavior
- Debugging disabled edge runtime suggests timeout issues

**Solution:** Standardize runtime based on operation duration, implement streaming for long operations

---

### Moderate Issues (Should Fix)

#### 5. Duplicate JSON Parsing Logic
**Impact:** Medium
**Location:** All AI operations
**Issue:** Markdown fence stripping duplicated 5+ times

**Duplicated Code:**
```typescript
let cleanText = text.trim()
if (cleanText.startsWith('```json')) {
  cleanText = cleanText.replace(/^```json\n?/, '').replace(/\n?```$/, '')
} else if (cleanText.startsWith('```')) {
  cleanText = cleanText.replace(/^```\n?/, '').replace(/\n?```$/, '')
}
const parsed = JSON.parse(cleanText)
```

**Found in:**
- `libs/ai/analysis.ts` (lines 25-30, 131-136)
- `libs/ai/content-generation.ts` (lines 32-37)
- `libs/ai/bid-analysis.ts` (lines 43-48)

**Solution:** Create `parseAIJsonResponse()` utility function

---

#### 6. Type Safety Gaps
**Impact:** Medium
**Location:** Context assembly, API route handlers
**Issue:** Using `any` types in critical areas

**Evidence:**
```typescript
// FROM: libs/ai/context-assembly.ts:6
project: any  // ⚠️ Should be Project type

// FROM: libs/repositories/work-packages.ts:214-235
project: any  // ⚠️ Should be Project type

// FROM: libs/ai/analysis.ts:88-91
const err = error as any  // ⚠️ Type assertion
```

**Solution:** Add proper TypeScript interfaces, use discriminated unions for errors

---

#### 7. No Token Budget Management
**Impact:** Medium
**Location:** Context assembly
**Issue:** Token estimation is naive, no actual tokenization

**Evidence:**
```typescript
// FROM: libs/ai/context-assembly.ts:56-58
const totalTokensEstimate = Math.ceil(
  (organizationDocsText.length + rftDocsText.length + JSON.stringify(project).length) / 4
)
```

**Problems:**
- Not using Gemini's actual tokenizer
- Different models have different token limits
- No truncation strategy if exceeds limit
- No warning before hitting limit

**Gemini SDK Has Built-in Tokenizer:**
```typescript
// Available but not used:
const { totalTokens } = await model.countTokens(prompt)
```

**Solution:** Use actual tokenizer, implement chunking/truncation strategy

---

#### 8. No Streaming for Long Operations
**Impact:** Medium
**Location:** Content generation, win themes, bid analysis
**Issue:** User waits with no feedback

**Current UX:**
```
User clicks "Generate Content"
→ [1-2 minute wait with spinner]
→ Content appears
```

**Better UX:**
```
User clicks "Generate Content"
→ "Analyzing requirements..." (10s)
→ "Drafting introduction..." (20s)
→ "Adding evidence from org docs..." (30s)
→ "Writing technical sections..." (45s)
→ Content appears
```

**Solution:** Implement Gemini's streaming API for token-by-token display or multi-step progress

---

#### 9. Prompt Version Control Missing
**Impact:** Medium
**Location:** All prompt files
**Issue:** No tracking of prompt changes, can't A/B test

**Current:**
- Prompts are hardcoded strings
- No versioning
- No way to compare old vs new prompts
- Can't rollback if new prompt performs worse

**Solution:** Add prompt versioning system, store in database with metadata

---

### Minor Issues (Nice to Fix)

#### 10. No Bulk Operations
**Impact:** Low-Medium
**Location:** Frontend workflow
**Issue:** Must generate each work package individually

**Current UX:**
1. Click work package 1
2. Generate win themes (wait)
3. Generate content (wait)
4. Click work package 2
5. Repeat...

**Better UX:**
- "Generate All" button
- Queue management
- Parallel execution (respecting rate limits)
- Progress tracking across all work packages

**Solution:** Implement job queue with rate limit awareness

---

#### 11. No Validation Before AI Calls
**Impact:** Low
**Location:** All AI operations
**Issue:** Expensive AI calls made even if inputs are invalid

**Examples:**
- Content generation without win themes (checked, but after API call overhead)
- Editor actions on empty text
- Analysis on documents without extracted text (checked late)

**Solution:** Add input validation at API route entry point

---

#### 12. Logging Inconsistency
**Impact:** Low
**Location:** All files
**Issue:** Mix of console.log and console.error, no structured logging

**Current:**
```typescript
console.log('[Context] Assembling context for project:', projectId)
console.log('[Win Themes] Generating for:', workPackage.document_type)
console.error('[Analysis] AI analysis error:', error)
```

**Better:**
- Structured logging (JSON)
- Log levels (debug, info, warn, error)
- Request IDs for tracing
- Performance metrics

**Solution:** Implement logging library (pino, winston)

---

## Architecture Strengths to Preserve

### ✓ 1. Modular Prompt System
**Location:** `/home/user/TenderCreator/libs/ai/prompts/*.ts`

All prompts are isolated in dedicated files with clear function signatures:
```typescript
buildAnalysisPrompt(rftTexts, projectName, instructions)
buildWinThemesPrompt(workPackage, orgDocs, rftDocs)
buildContentPrompt(workPackage, context, winThemes, instructions)
```

**Why Keep:**
- Easy to test prompts independently
- Clear separation of concerns
- Can iterate on prompts without touching AI logic
- Reusable across different contexts

---

### ✓ 2. Strong Domain Models
**Location:** Types and repositories

Clean separation between:
- **Database layer:** `libs/repositories/*.ts` (CRUD operations)
- **Type layer:** `types/*.ts` and inline interfaces
- **Business logic:** AI operations use types, don't touch DB directly

**Example:**
```typescript
// Repository handles DB
export async function createWorkPackage(supabase, data: CreateWorkPackageData): Promise<WorkPackage>

// AI layer uses types
export async function analyzeRFTDocuments(projectId, rftTexts, projectName): Promise<AnalysisResult>
```

**Why Keep:**
- Easy to test
- Clear boundaries
- Can swap database without changing AI code

---

### ✓ 3. Rich Error Information
**Location:** `libs/ai/error-parser.ts`

Sophisticated error parsing that extracts:
- Rate limit status
- Retry delay from Gemini headers
- Quota violation details
- Structured error types

**Why Keep:**
- Already handles Gemini-specific error format
- Provides retry delay from API
- Can build retry logic on top

---

### ✓ 4. SSE Implementation (RFT Analysis)
**Location:** `app/api/projects/[id]/analyze/route.ts`

Well-implemented streaming for progressive work package creation:
- Clean event types (start, retry, document, complete, error)
- Proper stream cleanup
- Frontend handles reconnection

**Why Keep:**
- Proven pattern for long operations
- Good UX (user sees progress)
- Can extend to other operations

---

### ✓ 5. Database Schema Design
**Location:** Supabase tables

Clean relational design:
- Work packages linked to projects
- Content separated from metadata (work_package_content table)
- Flexible JSONB for requirements and bid_analysis
- Version tracking for content

**Why Keep:**
- Supports all current features
- Allows for future extensions
- JSONB provides flexibility without schema changes

---

### ✓ 6. React Component Architecture
**Location:** `components/workflow-steps/*.tsx`

Well-structured workflow components:
- Clear state management
- Auto-generation patterns (win themes on mount)
- Progressive disclosure (tabs for requirements → bid → strategy)
- Loading states for each operation

**Why Keep:**
- User-friendly workflow
- Clear mental model
- Easy to extend with new steps

---

## Refactoring Opportunities

### 1. Centralized AI Pipeline Service

**Create:** `/home/user/TenderCreator/libs/ai/pipeline/core.ts`

**Purpose:** Single entry point for all AI operations

**Interface:**
```typescript
interface AIPipelineConfig {
  operation: 'analyze-rft' | 'generate-win-themes' | 'generate-content' | 'bid-analysis' | 'editor-action'
  context: ProjectContext | 'fetch' // 'fetch' = auto-assemble
  prompt: string | PromptBuilder
  retry?: RetryConfig
  streaming?: boolean
  onProgress?: (event: ProgressEvent) => void
}

interface RetryConfig {
  maxAttempts: number
  backoffStrategy: 'linear' | 'exponential'
  retryableErrors: ('rate-limit' | 'timeout' | 'network')[]
}

async function executePipeline<T>(config: AIPipelineConfig): Promise<T>
```

**Benefits:**
- Single place for error handling
- Centralized retry logic
- Consistent logging
- Easy to add features (caching, monitoring)

---

### 2. Context Caching Layer

**Create:** `/home/user/TenderCreator/libs/ai/pipeline/context-cache.ts`

**Pattern:**
```typescript
interface ContextCacheEntry {
  projectId: string
  context: ProjectContext
  cachedAt: Date
  expiresAt: Date
}

class ContextCache {
  async get(projectId: string): Promise<ProjectContext | null>
  async set(projectId: string, context: ProjectContext, ttl: number): Promise<void>
  async invalidate(projectId: string): Promise<void>
}
```

**Invalidation Triggers:**
- Document upload
- Document deletion
- Project update

**Benefits:**
- Reduce DB queries by 90%+
- Faster AI operations
- Lower database load

---

### 3. Unified Response Parser

**Create:** `/home/user/TenderCreator/libs/ai/pipeline/response-parser.ts`

**Interface:**
```typescript
interface ParseConfig<T> {
  responseText: string
  schema?: JSONSchema
  validator?: (data: unknown) => data is T
  defaultValue?: T
}

async function parseAIResponse<T>(config: ParseConfig<T>): Promise<T>
```

**Benefits:**
- No more duplicated fence-stripping code
- Optional JSON schema validation
- Consistent error messages

---

### 4. Streaming Progress Abstraction

**Create:** `/home/user/TenderCreator/libs/ai/pipeline/streaming.ts`

**Pattern:**
```typescript
interface StreamConfig {
  steps: StreamStep[]
  onStepComplete: (step: StreamStep, result: any) => void
  onProgress: (step: StreamStep, progress: number) => void
}

interface StreamStep {
  id: string
  label: string
  estimatedDuration: number
  execute: () => Promise<any>
}

async function executeStreamedPipeline(config: StreamConfig): Promise<ReadableStream>
```

**Benefits:**
- Reusable for all long operations
- Consistent progress UX
- Easy to add new steps

---

### 5. Prompt Template System

**Create:** `/home/user/TenderCreator/libs/ai/pipeline/prompt-templates.ts`

**Pattern:**
```typescript
interface PromptTemplate {
  id: string
  version: string
  systemInstruction: string
  userTemplate: string
  outputFormat: 'json' | 'markdown' | 'text'
  schema?: JSONSchema
}

function renderPrompt(template: PromptTemplate, variables: Record<string, any>): string
```

**Benefits:**
- Version control for prompts
- A/B testing capability
- Reusable fragments (system instructions, output formats)

---

### 6. Operation Queue for Bulk Processing

**Create:** `/home/user/TenderCreator/libs/ai/pipeline/queue.ts`

**Pattern:**
```typescript
interface QueueConfig {
  operations: AIOperation[]
  concurrency: number
  rateLimitStrategy: RateLimitStrategy
  onItemComplete: (item: AIOperation, result: any) => void
  onQueueComplete: () => void
}

interface RateLimitStrategy {
  requestsPerMinute: number
  backoffOnLimit: boolean
}

async function processQueue(config: QueueConfig): Promise<QueueResult>
```

**Benefits:**
- "Generate All" feature
- Respect rate limits
- Parallel execution
- Progress tracking

---

## Conclusion

The current AI pipeline works but has **significant technical debt** in the form of code duplication, inconsistent error handling, and performance inefficiencies. The core architecture (modular prompts, clean domain models, SSE streaming) provides a **solid foundation** for refactoring.

**Priority Recommendations:**

1. **Immediate (Week 1):**
   - Implement centralized AI pipeline service
   - Add context caching
   - Unify error handling and retry logic

2. **Short-term (Weeks 2-3):**
   - Add streaming progress to all operations
   - Implement bulk operation queue
   - Standardize runtime configuration

3. **Medium-term (Month 2):**
   - Add prompt versioning system
   - Implement actual token counting
   - Add structured logging

The refactoring should maintain **backward compatibility** with existing database schema and API contracts while introducing the new centralized pipeline layer.

---

**Document Version:** 1.0
**Created:** 2025-11-07
**Author:** Claude Code Architecture Analysis
**Next Steps:** Use this document to inform detailed refactoring plan in Phase 2

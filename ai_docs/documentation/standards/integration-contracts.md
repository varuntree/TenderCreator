# Integration Contracts

**Version:** 1.0
**Purpose:** Define standard patterns for API, AI, and file operations. All phases must follow these contracts.

---

## API Contracts

### Endpoint Naming Convention

**Pattern:** `/api/[resource]/[id?]/[action?]`

**Standard CRUD:**
- `GET /api/projects` - List projects
- `GET /api/projects/[id]` - Get single project
- `POST /api/projects` - Create project
- `PUT /api/projects/[id]` - Update project
- `DELETE /api/projects/[id]` - Delete project

**Actions:**
- `POST /api/projects/[id]/analyze` - Trigger RFT analysis
- `POST /api/work-packages/[id]/generate-themes` - Generate win themes
- `POST /api/work-packages/[id]/generate-content` - Generate document content
- `POST /api/work-packages/[id]/assist` - AI editing assistance
- `POST /api/work-packages/[id]/export` - Export to Word

### Standard Request Format

**Body (JSON):**
```json
{
  "field1": "value",
  "field2": 123
}
```

**File Uploads (multipart/form-data):**
```
file: <File>
metadata: <JSON string>
```

### Standard Response Format

**Success:**
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation completed successfully"
}
```

**Error:**
```json
{
  "success": false,
  "error": "User-friendly error message",
  "code": "ERROR_CODE"
}
```

**HTTP Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad request (validation error)
- `401` - Unauthorized
- `404` - Not found
- `500` - Server error

### API Route Structure

**Use API utilities from `/libs/api-utils`:**
- `withApiHandler()` - Wraps route, handles errors
- `withAuth()` - Validates authentication, injects user
- `apiSuccess()` - Returns success response
- `apiError()` - Returns error response

**All routes must:**
1. Validate authentication via `withAuth()` (if protected)
2. Validate input (Zod or manual)
3. Use repositories for data access (no direct DB queries in routes)
4. Return standard response format
5. Log errors appropriately

---

## AI Integration Contract

### Model Configuration

**Single Model:** `gemini-2.5-flash` for all operations

**API Client Location:** `/libs/ai/client.ts`

**Environment Variable:** `GEMINI_API_KEY`

### Text Extraction Pattern (Critical)

**When:** File uploaded (organization documents or project documents)

**Flow:**
1. User uploads file via API route
2. API uploads file to Supabase Storage
3. API sends file to Gemini API with extraction prompt
4. Gemini processes file (PDF, DOCX, images, etc.) and returns plain text
5. API stores extracted text in database (`content_text` column)
6. Set `content_extracted = true`

**Prompt Template:**
```
Extract all text content from this file.
Return only the extracted text, no additional formatting or commentary.
Preserve structure where possible (headings, lists, tables).
```

**Critical Rule:** After extraction, ALL subsequent AI operations use stored `content_text`. Never reprocess file.

**Error Handling:**
- If extraction fails, store partial text or mark `content_extracted = false`
- Retry once on transient errors
- Log error to `ai_interactions` table

### Context Assembly Function

**Location:** `/libs/ai/context.ts`

**Function Signature:**
```typescript
assembleContext(projectId: string, workPackageId?: string): Promise<string>
```

**Returns:** Single concatenated string with all relevant context

**Assembly Order:**
1. Organization documents (all `content_text` from `organization_documents`)
2. Project documents (all `content_text` from `project_documents`)
3. Work package requirements (if `workPackageId` provided)
4. Project instructions (if present)
5. Win themes (if generation phase)

**Format:**
```
=== ORGANIZATION KNOWLEDGE ===
[Document 1 Name]
[content_text]

[Document 2 Name]
[content_text]

=== PROJECT REQUIREMENTS ===
[Document 1 Name]
[content_text]

[Document 2 Name]
[content_text]

=== WORK PACKAGE REQUIREMENTS ===
- Requirement 1 text (mandatory)
- Requirement 2 text (optional)

=== USER INSTRUCTIONS ===
[project instructions if provided]
```

**Token Limit Handling:**
- MVP assumes context stays under 1M tokens
- If approaching limit (rare), truncate oldest org documents first
- Log warning if truncation occurs

### AI Operation Patterns

**1. Document Identification (Analyze RFT)**

**Endpoint:** `POST /api/projects/[id]/analyze`

**Input:** Project ID (fetch all project documents)

**Prompt Pattern:**
```
You are analyzing Request for Tender documents to identify ALL required submission documents.

[Concatenated RFT document texts]

Identify every document that must be submitted. For each document:
1. Document type/name
2. Brief description
3. All specific requirements (mandatory vs optional)
4. Source reference (section/page)

Return structured JSON:
{
  "documents": [
    {
      "type": "Technical Specification",
      "description": "...",
      "requirements": [
        {"text": "...", "priority": "mandatory", "source": "..."}
      ]
    }
  ]
}
```

**Response:** JSON parsed and stored as `work_packages` records

---

**2. Win Themes Generation**

**Endpoint:** `POST /api/work-packages/[id]/generate-themes`

**Input:** Work package ID

**Prompt Pattern:**
```
Generate 3-5 win themes for [document_type].

Context:
[Full context via assembleContext()]

Requirements to address:
[work_package.requirements]

Return JSON array of theme strings:
["Theme 1", "Theme 2", "Theme 3"]
```

**Response:** Array stored in `work_package_content.win_themes`

---

**3. Content Generation (Streaming)**

**Endpoint:** `POST /api/work-packages/[id]/generate-content`

**Input:** Work package ID

**Prompt Pattern:**
```
Write a comprehensive [document_type] for this tender response.

Context:
[Full context via assembleContext()]

Requirements to address:
[All requirements with priorities]

Win themes to incorporate:
[win_themes array]

Output well-structured Markdown with clear headings.
Address every mandatory requirement explicitly.
Use evidence from organization documents to demonstrate capabilities.
```

**Response:** Streaming text (Server-Sent Events or chunked transfer)

**Storage:** Final content stored in `work_package_content.content`

---

**4. Editing Assistance**

**Endpoint:** `POST /api/work-packages/[id]/assist`

**Input:**
```json
{
  "action": "expand" | "shorten" | "add_evidence" | "rephrase" | "check_compliance",
  "selectedText": "...",
  "customInstruction": "..." // for custom action
}
```

**Prompt Patterns:**

*Expand:*
```
Selected text: [selectedText]
Context: [Relevant org documents]

Expand this text with more detail and supporting evidence.
Add 2-3 paragraphs. Maintain professional tone.
```

*Add Evidence:*
```
Selected text: [selectedText]
Organization knowledge: [Org documents]

Find case studies, certifications, or examples from our organization that support this claim.
Add them as evidence.
```

*Check Compliance:*
```
Selected section: [selectedText]
Requirements: [work_package.requirements]

Check if this section addresses the requirements.
List any missing mandatory requirements.
```

**Response:** Modified text returned, user applies to editor

---

### Streaming Configuration

**Use Streaming For:**
- Content generation (main document)
- Document analysis (optional, for progress indication)

**Do Not Stream:**
- Win themes generation (quick)
- Editing assistance (quick)
- Text extraction (not user-facing)

**Streaming Implementation:**
- Use Gemini's streaming API
- Return Server-Sent Events or chunked response
- Client displays progressive output

### Error Handling

**Retry Strategy:**
- Retry once on timeout or rate limit errors
- Do not retry on invalid API key or quota exceeded
- Exponential backoff: 1s delay

**Logging:**
- Log all AI calls to `ai_interactions` table
- Include error flag and message if failed
- Store prompt, response, tokens

**User Messaging:**
- "AI service temporarily unavailable. Please try again."
- "Unable to process file. Please check format and try again."
- Avoid technical error details in UI

---

## File Upload Contract

### Upload Endpoints

**Organization Documents:** `POST /api/organizations/documents`

**Project Documents:** `POST /api/projects/[id]/documents`

### Request Format

**Content-Type:** `multipart/form-data`

**Fields:**
- `file` - File object
- `category` - Document category (optional, org docs only)
- `is_primary_rft` - Boolean (project docs only)

### Storage Path Convention

**Supabase Storage Bucket:** `documents` (single bucket)

**Path Structure:**
- Org documents: `{org_id}/org-documents/{file_id}/{filename}`
- Project documents: `{org_id}/projects/{project_id}/{filename}`
- Exports: `{org_id}/projects/{project_id}/exports/{work_package_id}/{filename}`

**File ID:** UUID generated by API

### Upload Flow

1. Receive multipart upload
2. Validate file (type, size)
3. Upload to Supabase Storage
4. Get public/signed URL
5. Send file to Gemini for text extraction
6. Store metadata + extracted text in database
7. Return success response with document ID

### File Validation

**Allowed Types:**
- `application/pdf`
- `application/vnd.openxmlformats-officedocument.wordprocessingml.document` (DOCX)
- `text/plain`
- `image/png`, `image/jpeg` (for scanned documents)

**Max Size:** 50MB per file (Gemini API limit)

**Validation Points:**
- Check MIME type
- Check file size
- Verify file extension matches MIME type

### Text Extraction (Gemini File API)

**Function Location:** `/libs/ai/extraction.ts`

**Function Signature:**
```typescript
extractTextFromFile(fileUrl: string, fileName: string): Promise<string>
```

**Steps:**
1. Upload file to Gemini File API
2. Wait for processing (poll status if needed)
3. Send extraction prompt to Gemini with file reference
4. Parse response (plain text)
5. Return extracted text

**Error Handling:**
- If extraction fails, return empty string or partial text
- Mark `content_extracted = false` in DB
- Log error to `ai_interactions` table with type='extraction'

---

## Repository Pattern Contract

### Location

**All repositories:** `/libs/repositories/[entity].ts`

**Central export:** `/libs/repositories/index.ts`

### Function Signature Pattern

**Dependency Injection:**
```typescript
export async function getProject(
  supabase: SupabaseClient,
  projectId: string
): Promise<Project | null>
```

**Never instantiate Supabase client inside repository.** Always pass as parameter.

### Naming Conventions

**CRUD Operations:**
- `get[Entity](supabase, id)` - Get single record
- `list[Entity]s(supabase, filters?)` - List records with optional filters
- `create[Entity](supabase, data)` - Create record
- `update[Entity](supabase, id, data)` - Update record
- `delete[Entity](supabase, id)` - Delete record

**Custom Operations:**
- `get[Entity]ByField(supabase, field, value)` - Custom query
- `count[Entity]s(supabase, filters?)` - Count records

### Error Handling

**Throw errors, do not return error objects:**
```typescript
if (error) throw new Error(`Failed to fetch project: ${error.message}`);
```

**Let API wrapper catch and format errors.**

### Response Format

**Return data directly:**
```typescript
return data; // Project object
return data; // Project[] array
return null; // If not found
```

**Do not wrap in `{ success, data }` structure.** API layer handles that.

### Usage in API Routes

```typescript
import { createClient } from '@/libs/supabase/server';
import { getProject } from '@/libs/repositories/projects';

export const GET = withAuth(async (req, { user }) => {
  const supabase = createClient();
  const project = await getProject(supabase, projectId);

  if (!project) return apiError('Project not found', 404);

  return apiSuccess(project);
});
```

---

## Development Workflow

**For All Phases:**

1. **Read this document** before implementing any API, AI, or file operation
2. **Follow contracts exactly** - deviations require user approval
3. **Use provided utilities** - do not reinvent (`/libs/api-utils`, `/libs/ai/*`)
4. **Test with real files** - PDF, DOCX, ensure extraction works
5. **Log AI interactions** - all calls to Gemini logged to `ai_interactions` table

**Key Principle:** Consistency across all phases. Same patterns, same structure, predictable behavior.

---

**These contracts enforce system-wide consistency and prevent integration conflicts between phases.**

# Bug: DOCX File Upload Fails with Unsupported MIME Type

## Bug Description
When uploading a DOCX file to a project, the system returns a 400 Bad Request error with message "Unsupported MIME type: application/vnd.openxmlformats-officedocument.wordprocessingml.document". The file upload completes and stores in Supabase, but text extraction via Gemini File API fails, leaving the document with no extracted text content.

**Symptoms:**
- File uploads successfully to Supabase Storage
- Document record created in database
- Text extraction error logged in console
- `content_text` field remains empty
- API returns 200 but document unusable for AI analysis

**Expected behavior:**
- DOCX files upload successfully
- Text extracted directly from file buffer
- Document ready for AI analysis with populated content_text

## Problem Statement
System incorrectly uses Gemini File API for text extraction. Gemini File API doesn't support DOCX, causing extraction failures. We already have the file buffer in memory - no need for external API.

## Solution Statement
**Direct extraction strategy:** Extract text directly from file buffers using specialized libraries. No Gemini File API for extraction. Simple, fast, reliable, free.

- **PDF**: Use `pdf-parse` library
- **DOCX**: Use `mammoth` library
- **text/plain**: Direct buffer read (existing)

Store extracted text in DB, later dump as context to Gemini for AI operations.

## Steps to Reproduce
1. Navigate to project details page
2. Upload a DOCX file (Word document)
3. Observe console error: `[GoogleGenerativeAI Error]: Error fetching from https://generativelanguage.googleapis.com/upload/v1beta/files: [400 Bad Request] Unsupported MIME type`
4. Check document in database - `content_extracted: false`, `content_text: null`
5. Document cannot be used for AI analysis

## Root Cause Analysis
**Primary cause:** Unnecessary use of Gemini File API for text extraction.

**Code location:** `libs/ai/extraction.ts:20-50`

**Why current approach fails:**
1. System uploads file to Gemini File API for extraction
2. Gemini File API rejects DOCX (unsupported MIME type)
3. Error caught, empty string returned
4. Document stored with no content

**Correct approach:**
- We have file buffer in memory during upload
- Extract text directly using appropriate library
- No external API calls needed
- Store extracted text immediately
- Later: Use stored text as context for AI operations

## Relevant Files
Use these files to fix the bug:

### `libs/ai/extraction.ts` (PRIMARY FIX - COMPLETED)
- Removed all Gemini File API code
- Added pdf-parse for PDF extraction
- Added mammoth for DOCX extraction
- Direct text extraction from buffers
- Validates MIME types, throws errors for unsupported formats

### `package.json` (DEPENDENCIES - COMPLETED)
- Added `pdf-parse` for PDF text extraction
- Added `mammoth` for DOCX text extraction
- Added `@types/pdf-parse` for TypeScript types

### `app/api/projects/[id]/documents/route.ts` (NO CHANGES)
- Already calls extractTextFromFile correctly
- Works automatically with new extraction logic

### `app/api/organizations/documents/route.ts` (NO CHANGES)
- Already calls extractTextFromFile correctly
- Works automatically with new extraction logic

## Step by Step Tasks

### Install dependencies - COMPLETED ✓
- Installed pdf-parse: `npm install pdf-parse`
- Installed mammoth: `npm install mammoth`
- Installed types: `npm install -D @types/pdf-parse`

### Rewrite extractTextFromFile function - COMPLETED ✓
- Removed Gemini File API imports and code
- Added pdf-parse import for PDF extraction
- Added mammoth import for DOCX extraction
- Implemented switch statement for file types:
  - text/plain: buffer.toString('utf-8')
  - application/pdf: pdfParse(buffer)
  - DOCX: mammoth.extractRawText({ buffer })
- Added MIME type validation with clear error messages
- Proper error handling and logging

### Test extraction - IN PROGRESS
- Build application
- Test PDF upload and extraction
- Test DOCX upload and extraction
- Test text file upload and extraction
- Verify content_text populated in database

## Validation Commands
Execute every command to validate the bug is fixed.

```bash
# 1. Build application without errors
npm run build

# 2. Run dev server
npm run dev

# 3. Test PDF upload (SHOULD WORK):
#    - Navigate to project page (http://localhost:3000/projects/[id])
#    - Upload a PDF file
#    - Check Network tab - POST /api/projects/[id]/documents returns 200
#    - Verify document appears in list
#    - Check database: content_extracted: true, content_text: populated

# 4. Test DOCX upload (SHOULD NOW WORK):
#    - Upload a DOCX file
#    - Check Network tab - POST /api/projects/[id]/documents returns 200
#    - Verify document appears in list
#    - Check database: content_extracted: true, content_text: populated
#    - NO MORE "Unsupported MIME type" error

# 5. Test text file upload (SHOULD WORK):
#    - Upload .txt file
#    - Returns 200
#    - content_text populated with file contents

# 6. Test organization documents:
#    - Same validation on /settings/documents upload
#    - PDF, DOCX, TXT all work correctly

# 7. Test unsupported format:
#    - Try uploading .xlsx or .pptx
#    - Should get clear error: "Unsupported file format"
```

## Notes

### Why direct extraction approach
- **Simpler:** No external API complexity
- **Faster:** No upload/download to Gemini
- **More reliable:** No API failures or rate limits
- **Free:** No extraction API calls
- **Better UX:** Supports DOCX natively

### How it works now
1. User uploads file (PDF, DOCX, or TXT)
2. File buffer available in memory
3. Extract text directly using appropriate library
4. Store extracted text in database
5. Later: Dump all stored text as context to Gemini for AI operations

### Libraries used
- **pdf-parse**: Extracts text from PDF files, widely used, reliable
- **mammoth**: Extracts raw text from DOCX, standard library for DOCX processing
- Both support Buffer input (matches our upload flow)

### Supported formats
- **PDF** ✅ via pdf-parse
- **DOCX** ✅ via mammoth
- **text/plain** ✅ via buffer.toString()
- **Other formats** ❌ Clear error message

### Error handling
- Unsupported MIME types: Throws error with clear message
- Corrupted files: Logs error, returns empty string
- Extraction failures: Logs error, returns empty string
- content_extracted field reflects success/failure

### Performance considerations
- Libraries run synchronously on Node.js
- PDF/DOCX extraction may take 1-3 seconds for large files
- Acceptable for MVP (typical RFT docs <50 pages)
- Future: Background job processing if needed

### Future enhancements (out of scope)
- Support XLSX (use `xlsx` library)
- Support PPTX (use `pptx-parser` or similar)
- Background job processing for large files
- Progress indicators during extraction
- Client-side file type validation (prevent unsupported uploads)

# Gemini File API Research: Complete Implementation Guide

## Overview

Complete documentation for implementing file upload and text extraction using Gemini API in the tender platform. Focus: batch file upload (PDFs, DOCX) → text extraction → database storage.

---

## 1. File API Capabilities

### Supported File Formats

**Documents:**
- PDF: Full support (up to 1000 pages, 50MB via File API)
- DOCX: **Not supported via API** (workaround: convert to PDF)
- TXT, HTML: Supported but plain text extraction only (no visual/formatting interpretation)

**Other formats:**
- Images: PNG, JPEG, WEBP, HEIC/HEIF
- Video/Audio: MP4, MOV, WAV, MP3 (2GB limit for gemini-2.0-flash)

### Size & Storage Limits

**Per-file limits:**
- File API: 2GB max per file
- Inline upload: 20MB total request size

**Project limits:**
- Storage: 20GB total per project
- Retention: Files stored for 48 hours (automatic deletion)

**Document-specific:**
- PDF: Max 1000 pages, 50MB recommended
- Each page = 258 tokens
- Pages scaled to max 3072x3072 resolution (preserves aspect ratio)

---

## 2. Authentication & Setup

### Python Installation

```bash
pip install google-genai
```

### Authentication Methods

**Method 1: Environment variable (recommended)**
```python
from google import genai
import os

# Client reads from GEMINI_API_KEY env var
client = genai.Client()
```

**Method 2: Explicit API key**
```python
client = genai.Client(api_key="YOUR_API_KEY")
```

**Method 3: Using google-generativeai package**
```python
import google.generativeai as genai

genai.configure(api_key=os.environ['GOOGLE_API_KEY'])
model = genai.GenerativeModel('gemini-1.5-flash')
```

**Security best practice:** Use `x-goog-api-key` HTTP header for REST calls, not request parameters.

---

## 3. File Upload API

### Endpoints & Methods

**REST endpoint:**
```
POST /upload/v1beta/files
```

**Python SDK operations:**
- Upload: `client.files.upload(file="path/to/file")`
- Get metadata: `client.files.get(name=file_name)`
- List files: `client.files.list()`
- Delete: `client.files.delete(name=file_name)`

### Upload Examples

**Single file upload (Python):**
```python
from google import genai
from google.genai import types

client = genai.Client()

# Upload PDF
uploaded_file = client.files.upload(
    file='path/to/document.pdf',
    config=types.UploadFileConfig(
        display_name='tender_document_001',
        mime_type='application/pdf'
    )
)

print(f"Uploaded: {uploaded_file.name}")
print(f"URI: {uploaded_file.uri}")
```

**Response structure:**
- `name`: File identifier for API calls
- `uri`: File URI for content generation
- `mime_type`: Detected MIME type
- `size_bytes`: File size
- `create_time`: Upload timestamp

---

## 4. Text Extraction from Documents

### PDF Processing

**Option 1: Inline PDFs (< 20MB)**
```python
from google import genai
from google.genai import types

client = genai.Client()

# Read PDF
with open('document.pdf', 'rb') as f:
    pdf_data = f.read()

# Extract text
response = client.models.generate_content(
    model='gemini-2.5-flash',
    contents=[
        types.Part.from_bytes(
            data=pdf_data,
            mime_type='application/pdf'
        ),
        "Extract all text from this document. Preserve structure and formatting."
    ]
)

extracted_text = response.text
```

**Option 2: File API (> 20MB or reuse)**
```python
# Upload file first
uploaded_file = client.files.upload(file='large_document.pdf')

# Extract text
response = client.models.generate_content(
    model='gemini-2.5-flash',
    contents=[
        uploaded_file,
        "Extract all text from this document. Preserve structure and formatting."
    ]
)

extracted_text = response.text
```

### Best Practices for Document Processing

**Pre-processing:**
1. Rotate pages to correct orientation
2. Ensure pages not blurry
3. Check file size (< 50MB recommended)

**Prompting:**
- Place text prompt AFTER document part
- Be specific about output format needed
- For structured data, use JSON schema (see section 7)

**Limitations:**
- Only PDF meaningfully understood with visual interpretation
- TXT/HTML/Markdown: plain text extraction only
- DOCX: convert to PDF first

---

## 5. Batch Processing Multiple Files

### Batch API Overview

**Key benefits:**
- 50% cost reduction vs standard API
- Asynchronous processing
- Target turnaround: 24 hours (often faster)

**Endpoint:**
```
POST https://generativelanguage.googleapis.com/v1beta/models/{model}:batchGenerateContent
```

### JSONL File Format

**Structure:** Each line = separate JSON request
```json
{"key": "doc_001", "request": {"contents": [{"parts": [{"text": "Extract text from document"}]}]}}
{"key": "doc_002", "request": {"contents": [{"parts": [{"text": "Extract text from document"}]}]}}
```

**Requirements:**
- Max 2GB per JSONL file
- Each line: unique key + GenerateContentRequest object
- Output: JSONL with GenerateContentResponse or error per line

### Batch Processing Implementation

**Step 1: Prepare JSONL file**
```python
import json
from google import genai
from google.genai import types

client = genai.Client()

# Upload files first
file_uris = []
for pdf_path in ['doc1.pdf', 'doc2.pdf', 'doc3.pdf']:
    uploaded = client.files.upload(file=pdf_path)
    file_uris.append(uploaded.uri)

# Create batch requests JSONL
batch_requests = []
for i, uri in enumerate(file_uris):
    batch_requests.append({
        'key': f'tender_doc_{i:03d}',
        'request': {
            'contents': [
                {'parts': [{'file_data': {'file_uri': uri}}]},
                {'parts': [{'text': 'Extract all text from this document. Preserve structure.'}]}
            ]
        }
    })

# Write JSONL
with open('batch_extraction.jsonl', 'w') as f:
    for req in batch_requests:
        f.write(json.dumps(req) + '\n')
```

**Step 2: Submit batch job**
```python
# Upload JSONL
batch_file = client.files.upload(
    file='batch_extraction.jsonl',
    config=types.UploadFileConfig(
        display_name='tender_batch_extraction',
        mime_type='application/jsonl'
    )
)

# Create batch job
batch_job = client.batches.create(
    model='gemini-2.5-flash',
    src=batch_file.name,
    config={'display_name': 'tender_extraction_job'}
)

print(f"Batch job created: {batch_job.name}")
print(f"Status: {batch_job.state.name}")
```

**Step 3: Monitor job status**
```python
import time

def wait_for_batch(job_name, poll_interval=60):
    """Poll batch job until complete"""
    while True:
        job = client.batches.get(name=job_name)
        print(f"Status: {job.state.name}")

        if job.state.name == 'JOB_STATE_SUCCEEDED':
            return job
        elif job.state.name in ['JOB_STATE_FAILED', 'JOB_STATE_CANCELLED', 'JOB_STATE_EXPIRED']:
            raise Exception(f"Batch job failed: {job.state.name}")

        time.sleep(poll_interval)

completed_job = wait_for_batch(batch_job.name)
```

**Step 4: Download results**
```python
# Get results file
results_content = client.files.download(file=completed_job.dest.file_name)

# Parse JSONL results
extracted_texts = {}
for line in results_content.splitlines():
    result = json.loads(line)
    key = result['key']

    if 'response' in result:
        # Successful extraction
        text = result['response']['candidates'][0]['content']['parts'][0]['text']
        extracted_texts[key] = {
            'text': text,
            'status': 'success'
        }
    else:
        # Error occurred
        extracted_texts[key] = {
            'text': None,
            'status': 'error',
            'error': result.get('status', {}).get('message', 'Unknown error')
        }

# Save to database (see section 8)
for doc_key, data in extracted_texts.items():
    save_to_database(doc_key, data['text'], data['status'])
```

### Batch Job States

- `JOB_STATE_PENDING`: Queued for processing
- `JOB_STATE_RUNNING`: Currently executing
- `JOB_STATE_SUCCEEDED`: Complete, results available
- `JOB_STATE_FAILED`: Processing failed
- `JOB_STATE_CANCELLED`: User cancelled
- `JOB_STATE_EXPIRED`: Exceeded 48-hour limit

### Batch Processing Limits

- Input file: 2GB max
- Inline requests: < 20MB total
- Job lifespan: 48 hours (expires if pending/running)
- Rate limits: Same as standard API (see section 9)

---

## 6. Alternative: Inline Batch Processing

**For smaller batches (< 20MB total):**
```python
from google import genai

client = genai.Client()

# Inline batch requests (no file upload)
inline_requests = [
    {
        'contents': [
            {'parts': [{'text': 'Extract text from document 1'}]}
        ]
    },
    {
        'contents': [
            {'parts': [{'text': 'Extract text from document 2'}]}
        ]
    }
]

batch_job = client.batches.create(
    model='gemini-2.5-flash',
    src=inline_requests,
    config={'display_name': 'inline_batch'}
)

# Monitor and retrieve as above
```

---

## 7. Structured Output for Text Extraction

### Using JSON Schema

**Define output structure with Pydantic:**
```python
from google import genai
from pydantic import BaseModel
from typing import List, Optional

class ExtractedSection(BaseModel):
    section_title: str
    content: str
    page_number: Optional[int]

class TenderDocument(BaseModel):
    document_title: str
    document_type: str  # e.g., "RFP", "Technical Spec", "Terms"
    sections: List[ExtractedSection]
    key_dates: List[str]
    total_pages: int

client = genai.Client()

# Upload document
uploaded_file = client.files.upload(file='tender_rfp.pdf')

# Extract with structured output
response = client.models.generate_content(
    model='gemini-2.5-flash',
    contents=[
        uploaded_file,
        "Analyze this tender document and extract structured information"
    ],
    config={
        'response_mime_type': 'application/json',
        'response_schema': TenderDocument
    }
)

# Parse structured response
tender_data: TenderDocument = response.parsed
print(f"Title: {tender_data.document_title}")
print(f"Sections: {len(tender_data.sections)}")
```

### Using Raw JSON Schema Dictionary

```python
import json

json_schema = {
    "type": "object",
    "properties": {
        "document_title": {"type": "string"},
        "sections": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "title": {"type": "string"},
                    "content": {"type": "string"}
                }
            }
        }
    },
    "required": ["document_title", "sections"]
}

response = client.models.generate_content(
    model='gemini-2.5-flash',
    contents=[
        uploaded_file,
        f"Extract data following this JSON schema: {json.dumps(json_schema)}"
    ],
    config={'response_mime_type': 'application/json'}
)

structured_data = json.loads(response.text)
```

---

## 8. Storage Format Recommendations

### Recommended Storage Structure

**For tender platform, use hybrid approach:**

**1. Full text storage (for search/analysis):**
```python
# PostgreSQL schema
"""
CREATE TABLE tender_documents (
    id SERIAL PRIMARY KEY,
    tender_id INTEGER REFERENCES tenders(id),
    file_name VARCHAR(255),
    file_type VARCHAR(50),
    gemini_file_uri VARCHAR(500),

    -- Full extracted text
    extracted_text TEXT,

    -- Structured JSON data
    structured_data JSONB,

    -- Metadata
    page_count INTEGER,
    extraction_status VARCHAR(50),
    extracted_at TIMESTAMP,
    gemini_file_expires_at TIMESTAMP
);

-- Indexes for full-text search
CREATE INDEX idx_tender_docs_text_search
ON tender_documents USING GIN(to_tsvector('english', extracted_text));

CREATE INDEX idx_tender_docs_structured
ON tender_documents USING GIN(structured_data);
"""
```

**2. Storage format in database:**
```python
import json
from datetime import datetime, timedelta

def save_extraction_to_db(
    tender_id: int,
    file_name: str,
    gemini_file_uri: str,
    extracted_text: str,
    structured_data: dict,
    page_count: int
):
    """Save extracted content to database"""

    # Calculate expiry (Gemini files expire in 48 hours)
    expires_at = datetime.utcnow() + timedelta(hours=48)

    # Insert to database
    cursor.execute("""
        INSERT INTO tender_documents (
            tender_id, file_name, file_type, gemini_file_uri,
            extracted_text, structured_data, page_count,
            extraction_status, extracted_at, gemini_file_expires_at
        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        RETURNING id
    """, (
        tender_id,
        file_name,
        'pdf',
        gemini_file_uri,
        extracted_text,
        json.dumps(structured_data),
        page_count,
        'completed',
        datetime.utcnow(),
        expires_at
    ))

    doc_id = cursor.fetchone()[0]
    return doc_id
```

**3. JSON structure for structured_data field:**
```json
{
    "document_metadata": {
        "title": "RFP for Software Development Services",
        "document_type": "RFP",
        "issuing_authority": "Department of Technology",
        "rfp_number": "RFP-2025-001",
        "total_pages": 45
    },
    "key_dates": [
        {"event": "Proposal Submission Deadline", "date": "2025-12-15"},
        {"event": "Q&A Session", "date": "2025-11-20"}
    ],
    "sections": [
        {
            "section_id": "1",
            "title": "Project Overview",
            "content": "Full text content...",
            "page_range": "1-5"
        },
        {
            "section_id": "2",
            "title": "Technical Requirements",
            "content": "Full text content...",
            "page_range": "6-25"
        }
    ],
    "requirements": [
        {
            "requirement_id": "REQ-001",
            "category": "Technical",
            "description": "Must support 10,000 concurrent users",
            "priority": "mandatory"
        }
    ],
    "budget_info": {
        "estimated_value": "$500,000 - $750,000",
        "payment_terms": "Net 30"
    }
}
```

### Storage Best Practices

**1. Hybrid storage:**
- Full text: For search, LLM context
- Structured JSON: For UI display, filtering, reporting
- Original file: S3/cloud storage (keep source)

**2. Indexing:**
- Full-text search on `extracted_text`
- GIN index on JSONB for structured queries
- Standard indexes on metadata fields

**3. Data retention:**
- Keep extracted text permanently
- Gemini file URIs expire in 48 hours (re-upload if needed)
- Archive original files (S3, cold storage)

---

## 9. Error Handling

### Common Errors & Status Codes

**HTTP 429: Rate Limit Exceeded**
```python
import time
from google.api_core import retry

@retry.Retry(
    predicate=retry.if_exception_type(Exception),
    initial=1.0,
    maximum=60.0,
    multiplier=2.0,
    timeout=300.0
)
def upload_with_retry(file_path):
    """Upload with exponential backoff"""
    try:
        return client.files.upload(file=file_path)
    except Exception as e:
        if '429' in str(e):
            print("Rate limit hit, retrying...")
            raise
        else:
            print(f"Upload error: {e}")
            raise
```

**File Upload Errors**
```python
def safe_file_upload(file_path, max_retries=3):
    """Upload with error handling"""
    for attempt in range(max_retries):
        try:
            # Validate file size
            file_size = os.path.getsize(file_path)
            if file_size > 50 * 1024 * 1024:  # 50MB
                raise ValueError(f"File too large: {file_size} bytes")

            # Upload
            uploaded = client.files.upload(file=file_path)
            return uploaded

        except Exception as e:
            print(f"Attempt {attempt + 1} failed: {e}")
            if attempt == max_retries - 1:
                return None
            time.sleep(2 ** attempt)  # Exponential backoff

    return None
```

**Extraction Errors**
```python
def extract_with_error_handling(uploaded_file):
    """Extract text with fallback handling"""
    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=[uploaded_file, "Extract all text"]
        )

        return {
            'status': 'success',
            'text': response.text,
            'error': None
        }

    except Exception as e:
        error_msg = str(e)

        # Log specific error types
        if 'quota' in error_msg.lower():
            print("Quota exceeded")
        elif 'timeout' in error_msg.lower():
            print("Request timeout")
        else:
            print(f"Extraction error: {error_msg}")

        return {
            'status': 'error',
            'text': None,
            'error': error_msg
        }
```

### Batch Job Error Handling

```python
def process_batch_results(results_content):
    """Process batch results with error handling"""
    successful = []
    failed = []

    for line in results_content.splitlines():
        try:
            result = json.loads(line)
            key = result['key']

            if 'response' in result:
                # Success
                text = result['response']['candidates'][0]['content']['parts'][0]['text']
                successful.append({
                    'key': key,
                    'text': text
                })
            else:
                # Error
                error_status = result.get('status', {})
                failed.append({
                    'key': key,
                    'error_code': error_status.get('code'),
                    'error_message': error_status.get('message')
                })

        except Exception as e:
            print(f"Failed to parse result: {e}")
            failed.append({
                'key': 'unknown',
                'error_message': str(e)
            })

    return successful, failed
```

### Logging & Monitoring

```python
import logging

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('gemini_extraction.log'),
        logging.StreamHandler()
    ]
)

def log_extraction_metrics(
    file_name: str,
    status: str,
    duration: float,
    text_length: int = 0,
    error: str = None
):
    """Log extraction metrics for monitoring"""
    logging.info(f"""
    File: {file_name}
    Status: {status}
    Duration: {duration:.2f}s
    Text Length: {text_length} chars
    Error: {error if error else 'None'}
    """)
```

---

## 10. Rate Limits & Quotas (2025)

### Free Tier
- **Requests per minute (RPM):** 5
- **Requests per day (RPD):** 25
- **Tokens per minute (TPM):** Varies by model
- **Reset:** RPD resets at midnight Pacific time

### Paid Tiers
- **Tier 1:** Significantly increased limits (enable Cloud Billing)
- **Tier 2:** Enterprise quotas (requires $250 spend + 30 days)

### Rate Limit Dimensions
Limits apply per project across:
1. Requests per minute (RPM)
2. Tokens per minute (TPM)
3. Requests per day (RPD)
4. Images per minute (IPM)

### Pricing (2025)
- **Free tier:** Generous limits for development
- **Paid usage:** Token-based pricing
- **Gemini 2.5 Pro:** ~$0.011 for 1K input + 1K output tokens
- **Batch API:** 50% cost reduction
- **Files API:** No additional cost

**Enable billing:**
- Requires Google Cloud Billing account
- Visit Google Cloud Console to enable

---

## 11. Complete Implementation Example

### Full Pipeline: Upload → Extract → Store

```python
import os
import json
import time
from datetime import datetime, timedelta
from google import genai
from google.genai import types
from pydantic import BaseModel
from typing import List, Optional
import psycopg2

# ===== 1. SETUP =====

client = genai.Client(api_key=os.environ['GEMINI_API_KEY'])

# Database connection
db_conn = psycopg2.connect(
    host='localhost',
    database='tender_db',
    user='tender_user',
    password='password'
)

# ===== 2. STRUCTURED OUTPUT SCHEMA =====

class TenderSection(BaseModel):
    title: str
    content: str
    page_range: str

class TenderDocument(BaseModel):
    document_title: str
    document_type: str
    total_pages: int
    sections: List[TenderSection]
    key_dates: List[str]

# ===== 3. BATCH UPLOAD & EXTRACTION =====

def process_tender_documents(tender_id: int, file_paths: List[str]):
    """
    Complete pipeline: Upload PDFs → Extract text → Store in DB
    """
    print(f"Processing {len(file_paths)} documents for tender {tender_id}")

    # Step 1: Upload all files
    uploaded_files = []
    for file_path in file_paths:
        print(f"Uploading: {file_path}")
        try:
            uploaded = client.files.upload(
                file=file_path,
                config=types.UploadFileConfig(
                    display_name=os.path.basename(file_path),
                    mime_type='application/pdf'
                )
            )
            uploaded_files.append({
                'path': file_path,
                'name': os.path.basename(file_path),
                'uri': uploaded.uri,
                'file_name': uploaded.name
            })
        except Exception as e:
            print(f"Upload failed for {file_path}: {e}")
            continue

    # Step 2: Create batch extraction JSONL
    batch_requests = []
    for i, file_info in enumerate(uploaded_files):
        batch_requests.append({
            'key': f'doc_{i:03d}',
            'request': {
                'contents': [
                    {'parts': [{'file_data': {'file_uri': file_info['uri']}}]},
                    {'parts': [{'text': 'Extract all text from this document, preserving structure and formatting.'}]}
                ]
            }
        })

    # Write JSONL
    jsonl_path = f'/tmp/tender_{tender_id}_batch.jsonl'
    with open(jsonl_path, 'w') as f:
        for req in batch_requests:
            f.write(json.dumps(req) + '\n')

    # Step 3: Submit batch job
    batch_file = client.files.upload(
        file=jsonl_path,
        config=types.UploadFileConfig(
            display_name=f'tender_{tender_id}_extraction',
            mime_type='application/jsonl'
        )
    )

    batch_job = client.batches.create(
        model='gemini-2.5-flash',
        src=batch_file.name,
        config={'display_name': f'tender_{tender_id}_job'}
    )

    print(f"Batch job created: {batch_job.name}")

    # Step 4: Wait for completion
    while True:
        job_status = client.batches.get(name=batch_job.name)
        print(f"Job status: {job_status.state.name}")

        if job_status.state.name == 'JOB_STATE_SUCCEEDED':
            break
        elif job_status.state.name in ['JOB_STATE_FAILED', 'JOB_STATE_CANCELLED']:
            raise Exception(f"Batch job failed: {job_status.state.name}")

        time.sleep(30)  # Poll every 30 seconds

    # Step 5: Download and parse results
    results_content = client.files.download(file=job_status.dest.file_name)

    # Step 6: Store in database
    cursor = db_conn.cursor()

    for i, line in enumerate(results_content.splitlines()):
        result = json.loads(line)
        file_info = uploaded_files[i]

        if 'response' in result:
            extracted_text = result['response']['candidates'][0]['content']['parts'][0]['text']
            status = 'completed'
            error = None
        else:
            extracted_text = None
            status = 'failed'
            error = result.get('status', {}).get('message', 'Unknown error')

        # Calculate expiry
        expires_at = datetime.utcnow() + timedelta(hours=48)

        # Insert to database
        cursor.execute("""
            INSERT INTO tender_documents (
                tender_id, file_name, file_type, gemini_file_uri,
                extracted_text, extraction_status, extracted_at,
                gemini_file_expires_at, error_message
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING id
        """, (
            tender_id,
            file_info['name'],
            'pdf',
            file_info['uri'],
            extracted_text,
            status,
            datetime.utcnow(),
            expires_at,
            error
        ))

        doc_id = cursor.fetchone()[0]
        print(f"Saved document {doc_id}: {file_info['name']} ({status})")

    db_conn.commit()
    cursor.close()

    print(f"✓ Completed processing {len(uploaded_files)} documents")

# ===== 4. USAGE =====

if __name__ == '__main__':
    tender_id = 1
    pdf_files = [
        '/path/to/rfp_main.pdf',
        '/path/to/technical_specs.pdf',
        '/path/to/terms_conditions.pdf'
    ]

    process_tender_documents(tender_id, pdf_files)
```

---

## 12. Key Documentation Links

**Official Gemini API:**
- File API: https://ai.google.dev/gemini-api/docs/files
- Document Processing: https://ai.google.dev/gemini-api/docs/document-processing
- Batch API: https://ai.google.dev/gemini-api/docs/batch-api
- Structured Output: https://ai.google.dev/gemini-api/docs/structured-output
- Quickstart: https://ai.google.dev/gemini-api/docs/quickstart

**API Reference:**
- File API: https://ai.google.dev/api/files
- Rate Limits: https://ai.google.dev/gemini-api/docs/rate-limits
- Pricing: https://ai.google.dev/gemini-api/docs/pricing

**Code Examples:**
- Gemini Cookbook (GitHub): https://github.com/google-gemini/cookbook
- File API Quickstart: https://github.com/google-gemini/cookbook/blob/main/quickstarts/File_API.ipynb
- Document Processing: https://github.com/GoogleCloudPlatform/generative-ai/blob/main/gemini/use-cases/document-processing/document_processing.ipynb

**Additional Resources:**
- Firebase AI Logic Docs: https://firebase.google.com/docs/ai-logic
- Gemini by Example: https://geminibyexample.com

---

## 13. Implementation Checklist for Phase 1

- [ ] Get Gemini API key (https://aistudio.google.com/apikey)
- [ ] Install google-genai Python package
- [ ] Set up authentication (environment variable)
- [ ] Create database schema for tender_documents table
- [ ] Implement file upload function with retry logic
- [ ] Implement batch extraction pipeline
- [ ] Set up error handling and logging
- [ ] Test with sample PDF files
- [ ] Implement structured output schema (optional, Phase 2)
- [ ] Set up monitoring for rate limits
- [ ] Enable Cloud Billing for production (if exceeding free tier)
- [ ] Plan for file re-upload (URIs expire in 48 hours)
- [ ] Implement DOCX → PDF conversion (if supporting Word docs)

---

## 14. Critical Notes for Implementation

**DOCX Support:**
- **Not supported via API** - must convert to PDF first
- Use libraries: python-docx, LibreOffice CLI, or cloud services
- Alternative: Use Gemini web interface (supports DOCX) but not programmatic

**File Expiry:**
- Gemini files expire after 48 hours
- Store extracted text permanently in database
- Re-upload files if need to re-process after expiry

**Cost Optimization:**
- Use Batch API for bulk processing (50% cost savings)
- Free tier: 25 requests/day sufficient for testing
- Paid tier needed for production volume

**Rate Limiting:**
- Implement exponential backoff for 429 errors
- Use batch processing to reduce API call count
- Monitor quotas in Google Cloud Console

**Text Quality:**
- Gemini uses vision + OCR for PDFs (high quality)
- Preserves structure better than traditional OCR
- Test prompts to optimize extraction format

**Database Storage:**
- Full text + structured JSON recommended
- Use PostgreSQL JSONB for flexible querying
- Enable full-text search indexes
- Keep original files in S3/cloud storage

---

## End of Document

**Document created:** 2025-11-04
**Gemini API version:** v1beta
**Research complete for:** Phase 1 Core Schema Implementation

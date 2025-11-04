# System Architecture

**Version:** 1.0
**Purpose:** Define system layers, boundaries, and core patterns for all development phases

---

## System Overview

**Architecture Style:** Layered monolith (Next.js App Router)

**Layers:**
1. **Presentation** - React components (Server + Client), UI logic
2. **API** - Next.js API Routes (`/app/api/*`)
3. **Business Logic** - Pure functions in `/libs`, repositories, utilities
4. **Data** - Supabase (PostgreSQL + Storage)
5. **External Services** - Gemini API only

**Key Principle:** Business logic isolated in `/libs`, reusable across API routes and background operations.

---

## Application Structure

```
/app
  /(dashboard)          # Protected routes (all require auth)
    /projects
    /work-packages
    /settings
  /api                  # API routes only (no Server Actions)
  /signin               # Public auth page

/libs
  /repositories         # Pure functions, data access (dependency injection)
  /api-utils            # Request/response wrappers, error handling
  /storage              # File upload/management
  /ai                   # Gemini integration, context assembly, prompts
  /supabase             # Supabase client creators (server/client)

/architecture           # This folder (architectural constraints)
/migrations             # SQL migration files (applied after review)
```

**Component Types:**
- **Server Components:** Default, fetch data directly via repositories
- **Client Components:** Interactive UI, forms, real-time user input

---

## Data Flow Patterns

### Standard User Action Flow
```
User Action → Client Component → API Route → Repository → Database → Response → UI Update
```

### File Upload & Text Extraction Flow
```
1. User uploads file → API route receives multipart/form-data
2. API uploads to Supabase Storage → get public URL
3. API sends file to Gemini API with extraction prompt
4. Gemini returns extracted text
5. API stores text in database (content_text column)
6. Subsequent operations use stored text only (never reprocess file)
```

**Critical:** Text extraction happens ONCE per file at upload time. All AI operations use stored text.

### AI Generation Flow
```
1. User triggers generation → API route called
2. API assembles context (fetch all relevant texts from DB)
3. API calls Gemini with context + prompt
4. Gemini streams response (if applicable)
5. API stores result in database
6. Return response to client
```

---

## Authentication Architecture

**Method:** Supabase Auth (Google OAuth only)

**Protection Points:**
- Middleware checks auth for `/app/(dashboard)/*` routes
- API routes validate `auth.uid()` at start of handler
- Repositories assume valid user context (auth checked before repository call)

**Session:** Supabase Auth cookies, managed by Supabase client

**Pattern:**
- Protected pages: Check user in middleware, redirect to `/signin` if unauthenticated
- API routes: Extract user from Supabase client, return 401 if no user

---

## API Layer Architecture

**Use API Routes exclusively.** No Server Actions.

**Routing Convention:**
- `/api/projects` - List/create projects
- `/api/projects/[id]` - Get/update/delete project
- `/api/projects/[id]/analyze` - Trigger RFT analysis
- `/api/work-packages/[id]/generate` - Generate content
- `/api/work-packages/[id]/assist` - AI editing assistance

**Request/Response:**
- All responses use standard format (see `integration-contracts.md`)
- Use API utilities from `/libs/api-utils` for consistent error handling
- Streaming responses for AI generation operations

**Error Handling:**
- API wrapper catches errors, returns standard error format
- Log errors to console (MVP) or `ai_interactions` table (AI errors)
- Return appropriate HTTP status codes

---

## State Management

**Server State (Database):**
- Fetch on page load via Server Components
- Refetch after mutations (client navigates or refreshes)
- No caching beyond browser (keep simple)

**Client State:**
- React `useState` for local UI state (modals, dropdowns)
- React Hook Form for form state + validation
- No global state management library (not needed for MVP)

**No Real-Time:** Changes only visible on page refresh/navigation. No Supabase subscriptions.

---

## AI Integration Architecture

**Single AI Model:** Gemini 2.5 Flash everywhere

**When to Call Gemini:**
1. Document upload → text extraction
2. "Analyze RFT" button → identify required documents
3. "Generate Win Themes" → strategy generation
4. "Generate Content" → full document creation
5. Text selection + AI action → editing assistance (expand, add evidence, etc.)

**Context Assembly:**
- Function in `/libs/ai/context.ts`
- Fetch all organization documents (text) + all project documents (text) from DB
- Concatenate with clear separators
- Include work package requirements, instructions
- Return as single string (<1M tokens for MVP)

**Streaming:**
- Use for content generation (main document)
- Use for document analysis (optional, show progress)
- Not needed for quick operations (win themes, editing assistance)

**Token Management:**
- No pre-counting (rely on 1M limit being sufficient)
- If error due to tokens, truncate oldest org documents and retry once

---

## Key Architectural Decisions

**Why Gemini 2.5 Flash?**
- 1M token context window (fits all documents)
- Free tier sufficient for MVP
- Multimodal (handles file processing + text generation)

**Why No RAG/Vector DB?**
- MVP documents <200K tokens combined
- Full context dump simpler and sufficient
- Avoid complexity of embeddings, retrieval, chunking

**Why Repository Pattern?**
- Business logic separated from framework
- Testable, reusable
- Clear dependency injection (pass Supabase client)

**Why Migrations as Files First?**
- Allows autonomous agent code development without DB dependencies
- User reviews schema changes before application
- Prevents accidental production DB modifications

**Why No External Services?**
- MVP scope: Keep simple
- No queues (Redis, BullMQ)
- No external caching
- Supabase + Gemini only

---

## Routing Structure

**Public Routes:**
- `/` - Marketing homepage
- `/signin` - Google OAuth sign-in

**Protected Routes (require auth):**
- `/projects` - Project list dashboard
- `/projects/new` - Create new project
- `/projects/[id]` - Project detail (shows work packages)
- `/projects/[id]/settings` - Project settings
- `/work-packages/[id]` - Work package workflow (tabbed: requirements, strategy, generate, edit, export)
- `/settings` - Organization settings
- `/settings/documents` - Org document library
- `/settings/team` - Team management (UI only for MVP)

**API Routes:**
- `/api/organizations` - Org CRUD
- `/api/organizations/documents` - Upload org docs
- `/api/projects` - Project CRUD
- `/api/projects/[id]/documents` - Upload project docs
- `/api/projects/[id]/analyze` - Trigger RFT analysis
- `/api/work-packages` - Work package CRUD
- `/api/work-packages/[id]/generate-themes` - Generate win themes
- `/api/work-packages/[id]/generate-content` - Generate document content (streaming)
- `/api/work-packages/[id]/assist` - Editing assistance
- `/api/work-packages/[id]/export` - Export to Word

---

## Error Handling Strategy

**API Errors:**
- Return standard error response format
- Log to console
- User-facing messages avoid technical details

**AI Errors:**
- Retry once automatically (timeout, rate limit)
- Show user-friendly message ("AI service unavailable, try again")
- Log to `ai_interactions` table with error flag

**File Upload Errors:**
- Validate file type/size before upload
- Return clear error message ("File too large", "Unsupported format")
- No automatic retry (user must re-upload)

**Database Errors:**
- Caught by API wrapper
- Return 500 with generic message
- Log full error server-side

---

## Performance Considerations

**For MVP:**
- No caching layers
- No CDN optimization
- No database query optimization beyond indexes (defined in schema)
- Rely on Supabase/Vercel defaults

**Acceptable Latency:**
- AI generation: <30s (show loading state)
- File upload + extraction: <20s
- Page loads: <2s
- API mutations: <1s

---

## Development Workflow

1. **Phase agents create code** against this architecture
2. **Migration files created** in `/migrations/phaseN/` (not applied)
3. **User reviews migrations**
4. **User approves → migrations applied via Supabase MCP**
5. **Code tested against updated database**
6. **Next phase begins**

**Constraint Enforcement:**
- All agents read this document before implementation
- Deviations from architecture require user approval
- Schema changes only via migration files (never direct Supabase edits during dev)

---

**This architecture supports all 6 phases as defined in PRD. No changes expected during MVP development.**

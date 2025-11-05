# Phase: Core Schema & Project Structure

## Phase Description

Phase 1 establishes the foundational database schema, authentication system, and core CRUD operations for the multi-document tender response platform. This phase creates the data infrastructure for organizations, users, documents (both org-level and project-level), and projects. It includes Supabase setup, Google OAuth authentication, file upload with Gemini-powered text extraction, and basic UI matching TenderCreator's design system. By the end of this phase, users can create an organization, upload company knowledge documents, create projects, and upload RFT files - all with extracted text ready for AI processing in Phase 2.

## Phase Objectives

- Set up Supabase PostgreSQL database with all required tables and RLS policies
- Implement Google OAuth authentication via Supabase Auth with protected routes
- Build organization workspace with document upload and Gemini text extraction
- Create project CRUD operations with metadata management
- Implement project document upload (RFT files) with text extraction
- Establish UI foundation matching TenderCreator design (header, nav, layouts)
- Create repository pattern for all data access with dependency injection
- Set up Gemini API integration for file text extraction

## Problem Statement

Currently, the application exists as a Next.js marketing site with no backend, database, or product features. To build the multi-document tender platform, we need foundational infrastructure:
- **No database schema** - Need tables for orgs, users, documents, projects
- **No authentication** - Need Google OAuth with Supabase Auth
- **No file storage** - Need Supabase Storage for document uploads
- **No AI integration** - Need Gemini API for text extraction from PDFs/DOCX
- **No data access layer** - Need repository pattern for clean architecture
- **No product UI** - Need protected dashboard layouts matching TenderCreator design

## Solution Statement

Implement a layered architecture using Supabase as the backend (PostgreSQL + Storage + Auth) and Gemini for AI-powered text extraction. Create all necessary database tables with proper relationships and RLS policies for multi-tenant security. Build a repository layer in `/libs/repositories` for clean data access. Set up Google OAuth with middleware-protected routes. Create file upload endpoints that store files in Supabase Storage and extract text via Gemini File API. Establish UI foundation with shadcn/ui components matching TenderCreator's design tokens. This creates a solid base for Phase 2's AI document analysis features.

## Dependencies

### Previous Phases
None - this is Phase 1 (foundational)

### External Dependencies
- **Supabase** - PostgreSQL database, Storage, Auth (create project at supabase.com)
- **Google Cloud** - OAuth credentials for Supabase Auth
- **Gemini API** - API key from Google AI Studio (ai.google.dev)
- **npm packages** - `@supabase/supabase-js`, `@supabase/ssr`, `@google/generative-ai`

## Relevant Files

**Existing files to reference:**
- `ai_docs/documentation/PRD.md` - Data models, feature specs for Phase 1
- `ai_docs/documentation/standards/system-architecture.md` - Architecture patterns, layers, routing
- `ai_docs/documentation/standards/coding_patterns.md` - Component patterns, design tokens
- `ai_docs/documentation/standards/integration-contracts.md` - API contracts, repository patterns
- `app/layout.tsx` - Root layout (extend for auth context)
- `package.json` - Add dependencies

### New Files

**Migrations** (`migrations/phase_1/`):
- `001_initial_schema.sql` - All tables (organizations, users, organization_documents, projects, project_documents, work_packages, work_package_content, ai_interactions)
- `002_rls_policies.sql` - Row Level Security for multi-tenant isolation
- `003_storage_buckets.sql` - Supabase Storage bucket setup

**Libraries** (`libs/`):
- `libs/supabase/server.ts` - Server-side Supabase client creator
- `libs/supabase/client.ts` - Client-side Supabase client creator
- `libs/supabase/middleware.ts` - Auth middleware
- `libs/ai/client.ts` - Gemini API client
- `libs/ai/extraction.ts` - Text extraction from files via Gemini
- `libs/repositories/index.ts` - Central export for all repositories
- `libs/repositories/organizations.ts` - Org CRUD operations
- `libs/repositories/organization-documents.ts` - Org doc operations
- `libs/repositories/projects.ts` - Project CRUD operations
- `libs/repositories/project-documents.ts` - Project doc operations
- `libs/api-utils/index.ts` - API wrapper, error handling, response formatting

**API Routes** (`app/api/`):
- `app/api/organizations/route.ts` - Create/get organization
- `app/api/organizations/documents/route.ts` - Upload org documents
- `app/api/organizations/documents/[id]/route.ts` - Delete org doc
- `app/api/projects/route.ts` - List/create projects
- `app/api/projects/[id]/route.ts` - Get/update/delete project
- `app/api/projects/[id]/documents/route.ts` - Upload project documents
- `app/api/projects/[id]/documents/[docId]/route.ts` - Delete project doc

**UI Pages** (`app/(dashboard)/`):
- `app/(dashboard)/layout.tsx` - Protected layout with header, nav
- `app/(dashboard)/projects/page.tsx` - Project list (card grid)
- `app/(dashboard)/projects/new/page.tsx` - Create project form
- `app/(dashboard)/projects/[id]/page.tsx` - Project detail page
- `app/(dashboard)/settings/page.tsx` - Organization settings
- `app/(dashboard)/settings/documents/page.tsx` - Org document library

**UI Components** (`components/`):
- `components/header.tsx` - App header with org name, user avatar
- `components/nav.tsx` - Sidebar navigation
- `components/file-upload.tsx` - File upload component with drag-drop
- `components/project-card.tsx` - Project card for grid view
- `components/document-list.tsx` - Document table component

**Configuration**:
- `middleware.ts` (root) - Next.js middleware for auth protection
- `.env.local` - Environment variables (Supabase URL, keys, Gemini key)

## Acceptance Criteria

✓ User can sign in with Google OAuth (Supabase Auth)
✓ Auth middleware protects `/projects/*` and `/settings/*` routes
✓ User automatically gets organization created on first sign-in
✓ User can upload company documents (PDF, DOCX) to organization
✓ Uploaded org documents have text extracted via Gemini and stored in DB
✓ User can view list of uploaded org documents with metadata
✓ User can delete org documents
✓ User can create new project with name, client, deadline
✓ User can view list of all projects (card grid layout)
✓ User can delete project
✓ User can upload RFT documents to specific project
✓ User can mark one RFT as "Primary RFT"
✓ Uploaded project documents have text extracted and stored
✓ User can view project detail page showing uploaded RFT files
✓ All files stored in Supabase Storage with proper paths
✓ Database has all tables with proper relationships and RLS
✓ UI matches TenderCreator design (clean, card-based, professional)
✓ All API routes return standard response format
✓ Repository pattern used for all data access
✓ No TypeScript errors, build succeeds

## Step by Step Tasks

**EXECUTION RULES:**
- Execute ALL steps below in exact order
- Check Acceptance Criteria - all items are REQUIRED
- Do NOT skip UI/frontend steps if in acceptance criteria
- If blocked, document and continue other steps

### 1. Install Dependencies

- Run `npm install @supabase/supabase-js @supabase/ssr @google/generative-ai zod`
- Run `npx shadcn@latest add button input label card select textarea table dropdown-menu avatar`
- Verify all packages installed in `package.json`

### 2. Create Supabase Project

- Go to supabase.com, create new project
- Note project URL and anon key
- Enable Google OAuth in Authentication > Providers
- Get Google OAuth credentials from Google Cloud Console
- Configure authorized redirect URLs for Supabase Auth

### 3. Create Database Migration Files

Create migration files in `migrations/phase_1/`:

- **001_initial_schema.sql** - All tables per PRD data models:
  - `organizations` (id, name, created_at, settings jsonb)
  - `users` (id, email, name, organization_id FK, role enum, created_at)
  - `organization_documents` (id, organization_id FK, name, file_path, file_type, file_size, uploaded_by FK, uploaded_at, category, tags text[], content_extracted boolean, content_text text)
  - `projects` (id, organization_id FK, name, client_name, deadline, status enum, instructions text, created_by FK, created_at, updated_at)
  - `project_documents` (id, project_id FK, name, file_path, file_type, file_size, is_primary_rft boolean, uploaded_by FK, uploaded_at, content_extracted boolean, content_text text)
  - `work_packages` (id, project_id FK, document_type, document_description, requirements jsonb, assigned_to FK, status enum, order int, created_at, updated_at)
  - `work_package_content` (id, work_package_id FK, win_themes text[], key_messages text[], content text, content_version int, exported_file_path, exported_at, created_at, updated_at)
  - `ai_interactions` (id, project_id FK, work_package_id FK, type enum, prompt text, response text, context_tokens int, model text, created_at)

- **002_rls_policies.sql** - Row Level Security:
  - Enable RLS on all tables
  - Policy: users can only access their organization's data
  - Policy: organization isolation (WHERE organization_id = user_org_id)
  - Policy: admins can delete, writers can create/update, readers read-only

- **003_storage_buckets.sql** - Create `documents` bucket with RLS

### 4. Apply Database Migrations

- Open Supabase dashboard > SQL Editor
- Execute `001_initial_schema.sql`
- Execute `002_rls_policies.sql`
- Execute `003_storage_buckets.sql`
- Verify all tables exist in Table Editor

### 5. Configure Environment Variables

Create `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=<from supabase dashboard>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<from supabase dashboard>
SUPABASE_SERVICE_ROLE_KEY=<from supabase dashboard>
GEMINI_API_KEY=<from ai.google.dev>
```

### 6. Create Supabase Client Utilities

- `libs/supabase/server.ts` - Server-side client with cookies (SSR package)
- `libs/supabase/client.ts` - Client-side browser client
- `libs/supabase/middleware.ts` - Auth middleware utilities
- Follow Supabase SSR guide for Next.js 14 App Router pattern

### 7. Create Root Middleware

- `middleware.ts` - Protect `/projects/*` and `/settings/*` routes
- Use Supabase middleware pattern
- Redirect unauthenticated users to `/signin`
- Allow public routes: `/`, `/signin`, `/about`, etc.

### 8. Create Gemini AI Client

- `libs/ai/client.ts` - Initialize Gemini client with API key
- Export configured `model` instance (gemini-2.5-flash)

### 9. Implement Text Extraction Function

- `libs/ai/extraction.ts` - `extractTextFromFile(fileUrl: string, fileName: string): Promise<string>`
- Use Gemini File API to upload file
- Send extraction prompt (per integration-contracts.md)
- Return extracted plain text
- Handle errors (return empty string if fails, log to console)

### 10. Create API Utilities

- `libs/api-utils/index.ts`:
  - `apiSuccess(data, message?)` - Standard success response
  - `apiError(error, code?, status?)` - Standard error response
  - `withAuth(handler)` - Wrapper to validate auth and inject user
  - Type definitions for API responses

### 11. Create Organization Repository

- `libs/repositories/organizations.ts`:
  - `getOrganization(supabase, orgId)` - Get org by ID
  - `getOrganizationByUserId(supabase, userId)` - Get user's org
  - `createOrganization(supabase, name, userId)` - Create org and set user as admin
  - `updateOrganization(supabase, orgId, data)` - Update org settings

### 12. Create Organization Document Repository

- `libs/repositories/organization-documents.ts`:
  - `listOrganizationDocuments(supabase, orgId)` - List all org docs
  - `getOrganizationDocument(supabase, docId)` - Get single doc
  - `createOrganizationDocument(supabase, data)` - Insert doc record
  - `deleteOrganizationDocument(supabase, docId)` - Delete doc

### 13. Create Project Repository

- `libs/repositories/projects.ts`:
  - `listProjects(supabase, orgId)` - List all projects for org
  - `getProject(supabase, projectId)` - Get single project
  - `createProject(supabase, data)` - Create project
  - `updateProject(supabase, projectId, data)` - Update project
  - `deleteProject(supabase, projectId)` - Delete project

### 14. Create Project Document Repository

- `libs/repositories/project-documents.ts`:
  - `listProjectDocuments(supabase, projectId)` - List project docs
  - `getProjectDocument(supabase, docId)` - Get single doc
  - `createProjectDocument(supabase, data)` - Insert doc record
  - `deleteProjectDocument(supabase, docId)` - Delete doc
  - `updatePrimaryRFT(supabase, projectId, docId)` - Set primary RFT flag

### 15. Create Central Repository Export

- `libs/repositories/index.ts` - Export all repository functions for easy import

---
✅ CHECKPOINT: Steps 1-15 complete (Backend foundation). Continue to step 16.
---

### 16. Implement Organization API Routes

- `app/api/organizations/route.ts`:
  - `GET` - Get current user's organization (or create if first sign-in)
  - `POST` - Create organization (auto on first auth)

- Use `withAuth` wrapper, return standard response format
- Auto-create org if user has none (first sign-in flow)

### 17. Implement Organization Document Upload API

- `app/api/organizations/documents/route.ts`:
  - `POST` - Handle multipart upload, store in Supabase Storage
  - Path: `{org_id}/org-documents/{file_id}/{filename}`
  - Call `extractTextFromFile` to get text
  - Store metadata + text in `organization_documents` table
  - Return document ID and metadata

- `app/api/organizations/documents/[id]/route.ts`:
  - `DELETE` - Delete from storage + DB record

### 18. Implement Project API Routes

- `app/api/projects/route.ts`:
  - `GET` - List all projects for user's org
  - `POST` - Create new project with validation

- `app/api/projects/[id]/route.ts`:
  - `GET` - Get single project with details
  - `PUT` - Update project metadata
  - `DELETE` - Delete project (cascade delete documents)

### 19. Implement Project Document Upload API

- `app/api/projects/[id]/documents/route.ts`:
  - `POST` - Upload RFT document to project
  - Path: `{org_id}/projects/{project_id}/{filename}`
  - Extract text via Gemini
  - Store in `project_documents` table
  - Handle `is_primary_rft` flag

- `app/api/projects/[id]/documents/[docId]/route.ts`:
  - `DELETE` - Delete document from storage + DB

### 20. Update Auth Pages

- `app/signin/page.tsx` - Implement Google OAuth button using Supabase Auth
- Add sign-out functionality (header dropdown)
- Handle auth callbacks

### 21. Create Protected Dashboard Layout

- `app/(dashboard)/layout.tsx`:
  - Server Component that checks auth
  - Renders Header and Nav components
  - Content area for child pages
  - Match TenderCreator layout structure from reference

### 22. Create Header Component

- `components/header.tsx`:
  - Display org name (fetch from server)
  - User avatar with dropdown (sign out)
  - Breadcrumb navigation
  - Match TenderCreator header design

### 23. Create Nav Component

- `components/nav.tsx`:
  - Sidebar with navigation links:
    - Projects
    - Settings (with submenu: General, Documents, Team)
  - Active state styling
  - Match TenderCreator nav design

### 24. Create File Upload Component

- `components/file-upload.tsx`:
  - Drag-drop zone with dashed border (per TenderCreator design)
  - File type validation (PDF, DOCX, TXT)
  - Size validation (<50MB)
  - Upload progress indicator
  - File list preview

### 25. Create Project Card Component

- `components/project-card.tsx`:
  - Card with project name, client, deadline
  - Status indicator
  - Click to navigate to detail page
  - Match TenderCreator card design (rounded corners, shadow, padding)

### 26. Create Document List Component

- `components/document-list.tsx`:
  - Table showing: name, type, size, uploaded date, actions
  - Delete button per row
  - Primary RFT badge/checkbox (for project docs)
  - Match TenderCreator table design

### 27. Implement Projects List Page

- `app/(dashboard)/projects/page.tsx`:
  - Fetch projects via repository (Server Component)
  - Display in card grid (3 columns)
  - "Create Project" button → `/projects/new`
  - Empty state if no projects
  - Match TenderCreator project list layout

### 28. Implement Create Project Page

- `app/(dashboard)/projects/new/page.tsx`:
  - Form: name (required), client (optional), deadline (optional)
  - Use React Hook Form + Zod validation
  - Submit → POST `/api/projects`
  - Redirect to project detail on success
  - Match TenderCreator form styling

### 29. Implement Project Detail Page

- `app/(dashboard)/projects/[id]/page.tsx`:
  - Server Component fetching project + documents
  - Show project metadata (editable inline or edit button)
  - File upload component for RFT documents
  - Document list showing uploaded RFT files
  - "Analyze RFT" button (disabled, placeholder for Phase 2)
  - Delete project button

### 30. Implement Organization Settings Page

- `app/(dashboard)/settings/page.tsx`:
  - Display org name
  - Settings form: default_tone (dropdown)
  - Save button → PUT `/api/organizations`
  - Match TenderCreator settings layout

### 31. Implement Organization Documents Page

- `app/(dashboard)/settings/documents/page.tsx`:
  - File upload component (org-level)
  - Document list component showing all org docs
  - Delete functionality per document
  - Category/tags input (optional metadata)
  - Match TenderCreator document library layout

### 32. Configure Design Tokens

- Update `app/globals.css`:
  - Extract colors from TenderCreator screenshots (green primary, gray neutrals)
  - Set spacing scale (--space-1 to --space-16)
  - Typography scale (--font-size-sm, base, lg, xl)
  - Border radius (--radius-lg: 8px)
  - Shadows for cards
  - Ensure shadcn components use these tokens

### 33. Test Full User Flow

- Sign in with Google OAuth
- Auto-create organization on first sign-in
- Upload 2-3 company documents (PDF, DOCX)
- Verify text extraction completed (check DB)
- Create new project with metadata
- Upload RFT document to project
- Mark as primary RFT
- Upload additional RFT document
- View project detail page showing both files
- Delete one document
- Delete project
- Sign out

---
✅ CHECKPOINT: Steps 16-33 complete (Full stack implementation). Continue to step 34.
---

### 34. Run Validation Commands

Execute every validation command below to ensure Phase 1 works correctly.

## Validation Commands

Execute every command to validate the phase works correctly.

```bash
# 1. Build check (no TypeScript errors)
npm run build

# 2. Start dev server
npm run dev

# 3. Check database tables exist
# (Manual: Open Supabase dashboard > Table Editor, verify all 8 tables exist)

# 4. Check RLS policies applied
# (Manual: Open Supabase dashboard > Authentication > Policies, verify org isolation policies)

# 5. Check storage bucket created
# (Manual: Open Supabase dashboard > Storage, verify 'documents' bucket exists)

# 6. Test auth flow
# (Manual: Open http://localhost:3000/signin, sign in with Google, verify redirect to /projects)

# 7. Test org document upload
# (Manual: Go to /settings/documents, upload PDF, verify file in Supabase Storage + text extracted in DB)

# 8. Test project creation
# (Manual: Go to /projects/new, create project, verify appears in /projects list)

# 9. Test project document upload
# (Manual: Open project detail, upload RFT PDF, verify file stored + text extracted)

# 10. Check API responses
# (Manual: Open browser DevTools Network tab, verify all API calls return standard {success, data} format)

# 11. Verify UI matches design
# (Manual: Compare rendered UI to TenderCreator screenshots, check colors, spacing, card designs)

# 12. Test delete operations
# (Manual: Delete org doc, project doc, and project - verify cascade deletes work)
```

# Implementation log created at:
# ai_docs/documentation/phases_spec/phase_1_core_schema/phase_1_implementation.log

## Notes

### Critical Implementation Details

**Auth Flow:**
- Supabase Auth handles OAuth, cookies, sessions automatically
- Middleware checks `supabase.auth.getUser()` for protected routes
- On first sign-in, auto-create organization with user as admin
- Store user record in `users` table linked to organization

**File Upload Flow:**
1. Client uploads to API route (multipart)
2. API uploads to Supabase Storage
3. API gets public URL
4. API sends URL to Gemini File API for extraction
5. API stores extracted text in DB `content_text` column
6. Mark `content_extracted = true`

**Text Extraction:**
- Uses Gemini File API (handles PDF, DOCX, images)
- Extraction happens synchronously during upload (user waits)
- Show loading state in UI during upload + extraction
- If extraction fails, store file but mark `content_extracted = false`

**Repository Pattern:**
- All repositories are pure functions taking Supabase client as first param
- No classes, no auto-detection
- Throw errors (don't return error objects)
- API layer catches and formats errors

**RLS Strategy:**
- All tables have `organization_id` (directly or via FK)
- Policy: `WHERE organization_id = (SELECT organization_id FROM users WHERE id = auth.uid())`
- Ensures complete org isolation
- Role-based policies for admin/writer/reader (check `users.role`)

**Design System:**
- All spacing uses CSS variables (`p-4` = `var(--space-4)`)
- Colors use HSL format in CSS variables
- shadcn/ui components automatically use tokens
- No hard-coded values in components

**Future Phase Prep:**
- `work_packages` and `work_package_content` tables created but unused in Phase 1
- "Analyze RFT" button renders but disabled (Phase 2 will enable)
- `ai_interactions` table ready for Phase 2 logging

### Libraries Used

**Added in Phase 1:**
- `@supabase/supabase-js` - Supabase client
- `@supabase/ssr` - Next.js SSR helpers
- `@google/generative-ai` - Gemini API client
- `zod` - Schema validation
- `react-hook-form` - Form state management

**Already Installed (from base):**
- `shadcn/ui` components (button, input, card, etc.)
- `tailwindcss` - Styling
- `lucide-react` - Icons
- `next-themes` - Dark mode (if needed)

### Environment Setup

**Required Services:**
1. Supabase project (database + storage + auth)
2. Google Cloud project (OAuth credentials)
3. Google AI Studio (Gemini API key)

**Required Configuration:**
- Google OAuth redirect URLs in Google Cloud Console
- Google OAuth provider enabled in Supabase
- Storage bucket with proper RLS policies
- Environment variables in `.env.local`

### Success Criteria Validation

By end of Phase 1, user can:
✓ Sign in → auto-create org → upload company docs → view extracted text (in DB)
✓ Create project → upload RFT files → see files listed with metadata
✓ Navigate between projects, settings, document library
✓ Delete documents and projects
✓ All data properly isolated by organization (RLS working)
✓ UI looks professional and matches TenderCreator design

**NOT in Phase 1:**
- AI analysis of RFT (Phase 2)
- Document decomposition (Phase 2)
- Work package assignment (Phase 3)
- Content generation (Phase 4)
- Team invites (just UI in Phase 3)

## Research Documentation

No research sub-agents deployed for Phase 1. Implementation follows established patterns from:
- Supabase documentation (SSR guide)
- Gemini API documentation (File API guide)
- Next.js 14 App Router documentation
- shadcn/ui component documentation

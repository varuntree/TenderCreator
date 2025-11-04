# Phase: Core Schema & Project Structure

## Phase Description
Foundation phase establishing complete database schema, authentication system, file upload infrastructure, and text extraction pipeline. Implements organization/project hierarchy, document management (org-level + project-level), and Gemini API integration for batch text extraction. Includes basic UI matching TenderCreator design patterns.

## Phase Objectives
- Complete Supabase schema with RLS policies
- Google OAuth authentication system
- Organization and project CRUD operations
- File upload system using Supabase Storage
- Batch text extraction using Gemini File API
- UI foundation matching TenderCreator design
- Environment configuration with example files

## Problem Statement
Need foundational data layer and authentication before implementing AI analysis features. Users must be able to create organizations, upload company documents (knowledge base), create projects, and upload RFT documents. All uploaded files need text extraction for subsequent AI processing. Without this foundation, Phase 2 AI analysis cannot function.

## Solution Statement
Implement complete Supabase schema with all tables (organizations, users, documents, projects, work packages), integrate Google OAuth for authentication, build file upload system with Supabase Storage, and implement Gemini File API batch extraction to convert PDFs to searchable text stored in database. Create clean UI foundation matching TenderCreator's card-based design for all CRUD operations.

## Dependencies

### Previous Phases
None (this is Phase 1)

### External Dependencies
- Supabase project (user has created, will add keys after implementation)
- Gemini API key (user will provide in .env after implementation)
- Google OAuth credentials (will configure during implementation)
- Next.js 14 existing repo structure
- shadcn/ui components

## Relevant Files

**Existing Files:**

- `app/layout.tsx` - Root layout, will add auth provider
- `app/globals.css` - Global styles, will add CSS variables for TC design tokens
- `tailwind.config.ts` - Tailwind configuration, will customize for TC colors
- `package.json` - Dependencies, will add new packages

**Repository/API Pattern Files:**

- `libs/supabase/server.ts` - Server-side Supabase client (create)
- `libs/supabase/client.ts` - Client-side Supabase client (create)
- `libs/supabase/middleware.ts` - Auth middleware (create)
- `libs/repositories/index.ts` - Export all repositories (create)
- `libs/repositories/auth.ts` - Auth repository functions (create)
- `libs/repositories/organization.ts` - Organization CRUD (create)
- `libs/repositories/project.ts` - Project CRUD (create)
- `libs/repositories/organizationDocument.ts` - Org document operations (create)
- `libs/repositories/projectDocument.ts` - Project document operations (create)
- `libs/api-utils/index.ts` - API utilities (create)
- `libs/api-utils/responses.ts` - Standardized responses (create)
- `libs/api-utils/errors.ts` - Error handling (create)
- `libs/api-utils/middleware.ts` - Auth wrappers (create)
- `libs/storage/index.ts` - Storage utilities (create)
- `libs/storage/validation.ts` - File validation (create)
- `libs/gemini/index.ts` - Gemini API client (create)
- `libs/gemini/extraction.ts` - Batch text extraction (create)

**Database Migration Files:**

- `migrations/phase1/001_enable_extensions.sql` - Enable UUID and pgcrypto
- `migrations/phase1/002_create_organizations.sql` - Organizations table
- `migrations/phase1/003_create_users.sql` - Users table with RLS
- `migrations/phase1/004_create_organization_documents.sql` - Org documents table
- `migrations/phase1/005_create_projects.sql` - Projects table
- `migrations/phase1/006_create_project_documents.sql` - Project documents table
- `migrations/phase1/007_create_work_packages.sql` - Work packages table
- `migrations/phase1/008_create_work_package_content.sql` - Work package content table
- `migrations/phase1/009_create_ai_interactions.sql` - AI interaction logging table
- `migrations/phase1/010_create_rls_policies.sql` - Row Level Security policies
- `migrations/phase1/011_create_storage_buckets.sql` - Supabase Storage buckets
- `migrations/phase1/012_create_indexes.sql` - Performance indexes

**UI Component Files:**

- `components/ui/button.tsx` - shadcn button (add via CLI)
- `components/ui/card.tsx` - shadcn card (add via CLI)
- `components/ui/input.tsx` - shadcn input (add via CLI)
- `components/ui/form.tsx` - shadcn form (add via CLI)
- `components/ui/dialog.tsx` - shadcn dialog (add via CLI)
- `components/ui/badge.tsx` - shadcn badge (add via CLI)
- `components/layout/Header.tsx` - App header with user menu (create)
- `components/layout/Sidebar.tsx` - Navigation sidebar (create)
- `components/auth/SignInButton.tsx` - Google OAuth button (create)

**Page/Route Files:**

- `app/(auth)/signin/page.tsx` - Sign in page (create)
- `app/(dashboard)/layout.tsx` - Dashboard layout with header/sidebar (create)
- `app/(dashboard)/dashboard/page.tsx` - Main dashboard (create)
- `app/(dashboard)/organization/page.tsx` - Organization settings page (create)
- `app/(dashboard)/organization/documents/page.tsx` - Org documents list (create)
- `app/(dashboard)/projects/page.tsx` - Projects list (create)
- `app/(dashboard)/projects/[id]/page.tsx` - Project details page (create)
- `app/(dashboard)/projects/[id]/documents/page.tsx` - Project documents list (create)
- `app/api/auth/callback/route.ts` - OAuth callback handler (create)
- `app/api/documents/upload/route.ts` - Document upload API (create)
- `app/api/documents/extract/route.ts` - Batch text extraction API (create)

### New Files

**Configuration:**
- `.env.example` - Environment variables template
- `.env.local` - Actual environment variables (user adds keys)

**Type Definitions:**
- `types/database.ts` - Database type definitions (create)
- `types/api.ts` - API request/response types (create)

## Acceptance Criteria

1. **Database Schema:**
   - ✓ All migration files created in `migrations/phase1/`
   - ✓ Migration files NOT applied (user will approve and apply later)
   - ✓ All tables defined: organizations, users, org docs, projects, project docs, work packages, content, AI interactions
   - ✓ RLS policies defined for org-level security
   - ✓ Storage buckets configured for file uploads

2. **Authentication:**
   - ✓ Google OAuth working end-to-end
   - ✓ Sign in page functional
   - ✓ User can sign in and see authenticated pages
   - ✓ Protected routes redirect to sign-in
   - ✓ Sign out functional

3. **Organization Management:**
   - ✓ Can create organization (one-time setup)
   - ✓ Organization settings page displays org info
   - ✓ Organization name appears in header

4. **Organization Documents:**
   - ✓ Can upload documents to organization
   - ✓ File stored in Supabase Storage
   - ✓ Batch text extraction triggered on upload
   - ✓ Extracted text stored in database
   - ✓ Document list displays with name, type, size, upload date
   - ✓ Can delete documents

5. **Project Management:**
   - ✓ Can create project (name, client, deadline, instructions)
   - ✓ Projects list displays as card grid
   - ✓ Can view project details
   - ✓ Can delete project

6. **Project Documents:**
   - ✓ Can upload documents to project
   - ✓ Can mark one document as "Primary RFT"
   - ✓ Batch text extraction on upload
   - ✓ Document list displays
   - ✓ Can delete documents

7. **UI Foundation:**
   - ✓ Header with org name and user menu
   - ✓ Sidebar navigation
   - ✓ Card-based layouts matching TenderCreator design
   - ✓ Clean forms with proper validation
   - ✓ Loading states for async operations
   - ✓ Error messages via toast notifications

8. **Configuration:**
   - ✓ `.env.example` with all required variables
   - ✓ Clear instructions for adding API keys

## Step by Step Tasks

**EXECUTION RULES:**
- Execute ALL steps below in exact order
- Check Acceptance Criteria - all items are REQUIRED
- Do NOT apply migrations during development
- If blocked, document and continue other steps

### 1. Environment Setup

- Create `.env.example` with placeholders:
  ```
  NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
  NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
  SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
  GEMINI_API_KEY=your_gemini_api_key
  NEXT_PUBLIC_APP_URL=http://localhost:3000
  ```
- Add `.env.local` to `.gitignore`
- Install dependencies:
  ```bash
  npm install @supabase/ssr @supabase/supabase-js
  npm install @google/generative-ai
  npm install zod react-hook-form @hookform/resolvers
  npm install sonner # For toast notifications
  ```
- Add shadcn/ui components:
  ```bash
  npx shadcn@latest add button card input form dialog badge table
  ```

### 2. Database Schema - Create Migration Files

**IMPORTANT: Create files only, do NOT apply to database**

- Create `migrations/phase1/001_enable_extensions.sql`:
  ```sql
  -- Enable required PostgreSQL extensions
  CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
  CREATE EXTENSION IF NOT EXISTS "pgcrypto";
  ```

- Create `migrations/phase1/002_create_organizations.sql`:
  ```sql
  CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    settings JSONB DEFAULT '{"ai_model": "gemini-2.5-flash", "default_tone": "professional"}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );
  ```

- Create `migrations/phase1/003_create_users.sql`:
  ```sql
  CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    role TEXT CHECK (role IN ('admin', 'writer', 'reader')) DEFAULT 'admin',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );
  ```

- Create `migrations/phase1/004_create_organization_documents.sql`:
  ```sql
  CREATE TABLE organization_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Metadata
    category TEXT,
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],

    -- Text extraction
    content_extracted BOOLEAN DEFAULT FALSE,
    content_text TEXT,
    extraction_status TEXT CHECK (extraction_status IN ('pending', 'processing', 'completed', 'failed')) DEFAULT 'pending',
    extraction_error TEXT,
    gemini_file_uri TEXT,
    gemini_file_expires_at TIMESTAMP WITH TIME ZONE
  );
  ```

- Create `migrations/phase1/005_create_projects.sql`:
  ```sql
  CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    client_name TEXT,
    deadline TIMESTAMP WITH TIME ZONE,
    status TEXT CHECK (status IN ('setup', 'analysis', 'in_progress', 'completed')) DEFAULT 'setup',
    instructions TEXT,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );
  ```

- Create `migrations/phase1/006_create_project_documents.sql`:
  ```sql
  CREATE TABLE project_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    is_primary_rft BOOLEAN DEFAULT FALSE,
    uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Text extraction
    content_extracted BOOLEAN DEFAULT FALSE,
    content_text TEXT,
    extraction_status TEXT CHECK (extraction_status IN ('pending', 'processing', 'completed', 'failed')) DEFAULT 'pending',
    extraction_error TEXT,
    gemini_file_uri TEXT,
    gemini_file_expires_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '48 hours'
  );
  ```

- Create `migrations/phase1/007_create_work_packages.sql`:
  ```sql
  CREATE TABLE work_packages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
    document_type TEXT NOT NULL,
    document_description TEXT,
    requirements JSONB DEFAULT '[]'::jsonb,
    assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
    status TEXT CHECK (status IN ('not_started', 'in_progress', 'completed')) DEFAULT 'not_started',
    order_index INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );
  ```

- Create `migrations/phase1/008_create_work_package_content.sql`:
  ```sql
  CREATE TABLE work_package_content (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    work_package_id UUID REFERENCES work_packages(id) ON DELETE CASCADE NOT NULL,
    win_themes TEXT[] DEFAULT ARRAY[]::TEXT[],
    key_messages TEXT[] DEFAULT ARRAY[]::TEXT[],
    content TEXT,
    content_version INTEGER DEFAULT 1,
    exported_file_path TEXT,
    exported_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );
  ```

- Create `migrations/phase1/009_create_ai_interactions.sql`:
  ```sql
  CREATE TABLE ai_interactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    work_package_id UUID REFERENCES work_packages(id) ON DELETE CASCADE,
    type TEXT CHECK (type IN ('analysis', 'generation', 'editing', 'strategy')) NOT NULL,
    prompt TEXT NOT NULL,
    response TEXT NOT NULL,
    context_tokens INTEGER,
    model TEXT DEFAULT 'gemini-2.5-flash',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );
  ```

- Create `migrations/phase1/010_create_rls_policies.sql`:
  ```sql
  -- Enable Row Level Security
  ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
  ALTER TABLE users ENABLE ROW LEVEL SECURITY;
  ALTER TABLE organization_documents ENABLE ROW LEVEL SECURITY;
  ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
  ALTER TABLE project_documents ENABLE ROW LEVEL SECURITY;
  ALTER TABLE work_packages ENABLE ROW LEVEL SECURITY;
  ALTER TABLE work_package_content ENABLE ROW LEVEL SECURITY;
  ALTER TABLE ai_interactions ENABLE ROW LEVEL SECURITY;

  -- Users can read their own user record
  CREATE POLICY "Users can view own user data"
    ON users FOR SELECT
    USING (auth.uid() = id);

  -- Users can view their organization
  CREATE POLICY "Users can view own organization"
    ON organizations FOR SELECT
    USING (id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    ));

  -- Users can view organization documents in their org
  CREATE POLICY "Users can view org documents"
    ON organization_documents FOR SELECT
    USING (organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    ));

  -- Admins/writers can create org documents
  CREATE POLICY "Admins and writers can create org documents"
    ON organization_documents FOR INSERT
    WITH CHECK (
      organization_id IN (
        SELECT organization_id FROM users
        WHERE id = auth.uid() AND role IN ('admin', 'writer')
      )
    );

  -- Users can view projects in their org
  CREATE POLICY "Users can view projects"
    ON projects FOR SELECT
    USING (organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    ));

  -- Admins can create projects
  CREATE POLICY "Admins can create projects"
    ON projects FOR INSERT
    WITH CHECK (
      organization_id IN (
        SELECT organization_id FROM users
        WHERE id = auth.uid() AND role = 'admin'
      )
    );

  -- Users can view project documents
  CREATE POLICY "Users can view project documents"
    ON project_documents FOR SELECT
    USING (project_id IN (
      SELECT id FROM projects WHERE organization_id IN (
        SELECT organization_id FROM users WHERE id = auth.uid()
      )
    ));

  -- Writers and admins can create project documents
  CREATE POLICY "Writers can create project documents"
    ON project_documents FOR INSERT
    WITH CHECK (
      project_id IN (
        SELECT id FROM projects WHERE organization_id IN (
          SELECT organization_id FROM users
          WHERE id = auth.uid() AND role IN ('admin', 'writer')
        )
      )
    );

  -- Similar policies for work_packages, work_package_content, ai_interactions
  CREATE POLICY "Users can view work packages"
    ON work_packages FOR SELECT
    USING (project_id IN (
      SELECT id FROM projects WHERE organization_id IN (
        SELECT organization_id FROM users WHERE id = auth.uid()
      )
    ));
  ```

- Create `migrations/phase1/011_create_storage_buckets.sql`:
  ```sql
  -- Create storage buckets for documents
  INSERT INTO storage.buckets (id, name, public)
  VALUES
    ('organization-documents', 'organization-documents', false),
    ('project-documents', 'project-documents', false);

  -- Storage policies for organization documents
  CREATE POLICY "Users can upload org documents"
    ON storage.objects FOR INSERT
    WITH CHECK (
      bucket_id = 'organization-documents' AND
      (storage.foldername(name))[1] IN (
        SELECT organization_id::text FROM users WHERE id = auth.uid()
      )
    );

  CREATE POLICY "Users can view org documents"
    ON storage.objects FOR SELECT
    USING (
      bucket_id = 'organization-documents' AND
      (storage.foldername(name))[1] IN (
        SELECT organization_id::text FROM users WHERE id = auth.uid()
      )
    );

  -- Storage policies for project documents
  CREATE POLICY "Users can upload project documents"
    ON storage.objects FOR INSERT
    WITH CHECK (
      bucket_id = 'project-documents' AND
      (storage.foldername(name))[1] IN (
        SELECT id::text FROM projects WHERE organization_id IN (
          SELECT organization_id FROM users WHERE id = auth.uid()
        )
      )
    );

  CREATE POLICY "Users can view project documents"
    ON storage.objects FOR SELECT
    USING (
      bucket_id = 'project-documents' AND
      (storage.foldername(name))[1] IN (
        SELECT id::text FROM projects WHERE organization_id IN (
          SELECT organization_id FROM users WHERE id = auth.uid()
        )
      )
    );
  ```

- Create `migrations/phase1/012_create_indexes.sql`:
  ```sql
  -- Performance indexes
  CREATE INDEX idx_users_org ON users(organization_id);
  CREATE INDEX idx_org_docs_org ON organization_documents(organization_id);
  CREATE INDEX idx_projects_org ON projects(organization_id);
  CREATE INDEX idx_project_docs_project ON project_documents(project_id);
  CREATE INDEX idx_work_packages_project ON work_packages(project_id);
  CREATE INDEX idx_work_package_content_wp ON work_package_content(work_package_id);
  CREATE INDEX idx_ai_interactions_project ON ai_interactions(project_id);

  -- Full-text search indexes
  CREATE INDEX idx_org_docs_text_search
    ON organization_documents USING GIN(to_tsvector('english', content_text));

  CREATE INDEX idx_project_docs_text_search
    ON project_documents USING GIN(to_tsvector('english', content_text));
  ```

---
✅ CHECKPOINT: Steps 1-2 complete (Environment + Migration files created). Continue to step 3.
---

### 3. Supabase Client Setup

- Create `libs/supabase/server.ts`:
  ```typescript
  import { createServerClient, type CookieOptions } from '@supabase/ssr'
  import { cookies } from 'next/headers'

  export function createClient() {
    const cookieStore = cookies()

    return createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: CookieOptions) {
            try {
              cookieStore.set({ name, value, ...options })
            } catch (error) {
              // Handle cookie setting in Server Components
            }
          },
          remove(name: string, options: CookieOptions) {
            try {
              cookieStore.set({ name, value: '', ...options })
            } catch (error) {
              // Handle cookie removal in Server Components
            }
          },
        },
      }
    )
  }
  ```

- Create `libs/supabase/client.ts`:
  ```typescript
  import { createBrowserClient } from '@supabase/ssr'

  export function createClient() {
    return createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }
  ```

- Create `libs/supabase/middleware.ts`:
  ```typescript
  import { createServerClient, type CookieOptions } from '@supabase/ssr'
  import { NextResponse, type NextRequest } from 'next/server'

  export async function updateSession(request: NextRequest) {
    let response = NextResponse.next({
      request: {
        headers: request.headers,
      },
    })

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value
          },
          set(name: string, value: string, options: CookieOptions) {
            request.cookies.set({
              name,
              value,
              ...options,
            })
            response = NextResponse.next({
              request: {
                headers: request.headers,
              },
            })
            response.cookies.set({
              name,
              value,
              ...options,
            })
          },
          remove(name: string, options: CookieOptions) {
            request.cookies.set({
              name,
              value: '',
              ...options,
            })
            response = NextResponse.next({
              request: {
                headers: request.headers,
              },
            })
            response.cookies.set({
              name,
              value: '',
              ...options,
            })
          },
        },
      }
    )

    await supabase.auth.getUser()

    return response
  }
  ```

- Create `middleware.ts` at root:
  ```typescript
  import { type NextRequest } from 'next/server'
  import { updateSession } from './libs/supabase/middleware'

  export async function middleware(request: NextRequest) {
    return await updateSession(request)
  }

  export const config = {
    matcher: [
      '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
  }
  ```

### 4. Type Definitions

- Create `types/database.ts` with all table types based on schema
- Create `types/api.ts` with API request/response types

### 5. Repository Layer - Auth

- Create `libs/repositories/auth.ts`:
  ```typescript
  import { SupabaseClient } from '@supabase/supabase-js'

  export async function getUser(supabase: SupabaseClient) {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) throw error
    return user
  }

  export async function signInWithGoogle(supabase: SupabaseClient) {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback`,
      },
    })
    if (error) throw error
    return data
  }

  export async function signOut(supabase: SupabaseClient) {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }
  ```

### 6. Repository Layer - Organizations

- Create `libs/repositories/organization.ts` with functions:
  - `getOrganization(supabase, userId)`
  - `createOrganization(supabase, data)`
  - `updateOrganization(supabase, id, data)`

### 7. Repository Layer - Organization Documents

- Create `libs/repositories/organizationDocument.ts` with functions:
  - `getOrganizationDocuments(supabase, orgId)`
  - `createOrganizationDocument(supabase, data)`
  - `updateDocumentExtraction(supabase, id, contentText, status)`
  - `deleteOrganizationDocument(supabase, id)`

### 8. Repository Layer - Projects

- Create `libs/repositories/project.ts` with functions:
  - `getProjects(supabase, orgId)`
  - `getProject(supabase, id)`
  - `createProject(supabase, data)`
  - `updateProject(supabase, id, data)`
  - `deleteProject(supabase, id)`

### 9. Repository Layer - Project Documents

- Create `libs/repositories/projectDocument.ts` with functions:
  - `getProjectDocuments(supabase, projectId)`
  - `createProjectDocument(supabase, data)`
  - `updatePrimaryRFT(supabase, projectId, documentId)`
  - `updateDocumentExtraction(supabase, id, contentText, status)`
  - `deleteProjectDocument(supabase, id)`

### 10. API Utilities

- Create `libs/api-utils/responses.ts`:
  ```typescript
  import { NextResponse } from 'next/server'

  export type ApiResponse<T = any> = {
    success: boolean
    data?: T
    error?: string
    message?: string
  }

  export function apiSuccess<T>(data: T, message?: string) {
    return NextResponse.json({
      success: true,
      data,
      message,
    } as ApiResponse<T>)
  }

  export function apiError(error: string, status = 400) {
    return NextResponse.json(
      {
        success: false,
        error,
      } as ApiResponse,
      { status }
    )
  }
  ```

- Create `libs/api-utils/middleware.ts`:
  ```typescript
  import { createClient } from '@/libs/supabase/server'
  import { NextRequest } from 'next/server'
  import { apiError } from './responses'

  export function withAuth(
    handler: (req: NextRequest, context: { user: any }) => Promise<Response>
  ) {
    return async (req: NextRequest) => {
      const supabase = createClient()
      const { data: { user }, error } = await supabase.auth.getUser()

      if (error || !user) {
        return apiError('Unauthorized', 401)
      }

      return handler(req, { user })
    }
  }
  ```

- Create `libs/api-utils/index.ts` to export all utilities

### 11. Storage Utilities

- Create `libs/storage/validation.ts`:
  ```typescript
  const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB
  const ALLOWED_TYPES = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']

  export function validateFile(file: File) {
    if (file.size > MAX_FILE_SIZE) {
      throw new Error('File too large (max 50MB)')
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      throw new Error('Invalid file type (PDF or DOCX only)')
    }
  }
  ```

- Create `libs/storage/index.ts` with upload helpers

### 12. Gemini Integration - Client Setup

- Create `libs/gemini/client.ts`:
  ```typescript
  import { GoogleGenerativeAI } from '@google/generative-ai'

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

  export function getGeminiClient() {
    return genAI
  }

  export function getModel(modelName = 'gemini-2.5-flash') {
    return genAI.getGenerativeModel({ model: modelName })
  }
  ```

### 13. Gemini Integration - Batch Text Extraction

- Create `libs/gemini/extraction.ts`:
  ```typescript
  import { getGeminiClient } from './client'

  type FileInfo = {
    id: string
    filePath: string
    fileName: string
  }

  type ExtractionResult = {
    id: string
    text: string | null
    status: 'success' | 'error'
    error?: string
  }

  export async function batchExtractText(
    files: FileInfo[]
  ): Promise<ExtractionResult[]> {
    const client = getGeminiClient()
    const results: ExtractionResult[] = []

    // Step 1: Upload all files to Gemini
    const uploadedFiles = []
    for (const file of files) {
      try {
        const uploaded = await client.files.upload({
          path: file.filePath,
          config: {
            displayName: file.fileName,
            mimeType: 'application/pdf',
          },
        })
        uploadedFiles.push({
          id: file.id,
          uri: uploaded.uri,
          name: uploaded.name,
        })
      } catch (error) {
        results.push({
          id: file.id,
          text: null,
          status: 'error',
          error: `Upload failed: ${error.message}`,
        })
      }
    }

    // Step 2: Create batch extraction requests (JSONL format)
    const batchRequests = uploadedFiles.map((file, i) => ({
      key: file.id,
      request: {
        contents: [
          { parts: [{ file_data: { file_uri: file.uri } }] },
          { parts: [{ text: 'Extract all text from this document. Preserve structure and formatting.' }] },
        ],
      },
    }))

    // Step 3: Submit batch job
    const jsonlPath = `/tmp/batch_${Date.now()}.jsonl`
    await writeJSONL(jsonlPath, batchRequests)

    const batchFile = await client.files.upload({
      path: jsonlPath,
      config: {
        displayName: 'extraction_batch',
        mimeType: 'application/jsonl',
      },
    })

    const batchJob = await client.batches.create({
      model: 'gemini-2.5-flash',
      src: batchFile.name,
      config: { displayName: 'extraction_job' },
    })

    // Step 4: Wait for completion (poll every 30s)
    let completed = false
    while (!completed) {
      const status = await client.batches.get({ name: batchJob.name })

      if (status.state.name === 'JOB_STATE_SUCCEEDED') {
        completed = true

        // Download results
        const resultsContent = await client.files.download({
          file: status.dest.file_name,
        })

        // Parse results
        for (const line of resultsContent.split('\n')) {
          if (!line.trim()) continue

          const result = JSON.parse(line)
          if (result.response) {
            results.push({
              id: result.key,
              text: result.response.candidates[0].content.parts[0].text,
              status: 'success',
            })
          } else {
            results.push({
              id: result.key,
              text: null,
              status: 'error',
              error: result.status?.message || 'Unknown error',
            })
          }
        }
      } else if (['JOB_STATE_FAILED', 'JOB_STATE_CANCELLED'].includes(status.state.name)) {
        throw new Error(`Batch job failed: ${status.state.name}`)
      }

      await sleep(30000) // Wait 30 seconds
    }

    return results
  }

  async function writeJSONL(path: string, data: any[]) {
    const fs = require('fs').promises
    const content = data.map((item) => JSON.stringify(item)).join('\n')
    await fs.writeFile(path, content)
  }

  function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }
  ```

- Create `libs/gemini/index.ts` to export all Gemini functions

### 14. API Routes - Document Upload

- Create `app/api/documents/upload/route.ts`:
  - Accept file upload (FormData)
  - Validate file
  - Upload to Supabase Storage
  - Create database record with status='pending'
  - Return document ID

### 15. API Routes - Batch Text Extraction

- Create `app/api/documents/extract/route.ts`:
  - Accept document IDs array
  - Fetch documents from database
  - Download files from Supabase Storage
  - Call `batchExtractText()`
  - Update database records with extracted text
  - Return extraction results

### 16. Design System Setup

- Update `app/globals.css` with TenderCreator design tokens:
  ```css
  :root {
    /* Colors - TenderCreator green primary */
    --primary: 142 76% 36%; /* #10B981 green */
    --primary-foreground: 0 0% 100%;

    /* Spacing */
    --space-1: 0.25rem;
    --space-2: 0.5rem;
    --space-4: 1rem;
    --space-6: 1.5rem;
    --space-8: 2rem;

    /* Border radius */
    --radius: 0.5rem;
    --radius-lg: 0.75rem;
  }
  ```

- Update `tailwind.config.ts` to match TenderCreator colors

### 17. Authentication UI

- Create `app/(auth)/signin/page.tsx`:
  - Google sign-in button
  - Clean centered layout
  - App logo/name
  - "Sign in with Google" button using shadcn Button

- Create `app/api/auth/callback/route.ts`:
  - Handle OAuth callback
  - Exchange code for session
  - Create user record if first login
  - Redirect to dashboard

- Create `components/auth/SignInButton.tsx` reusable component

### 18. Layout Components

- Create `components/layout/Header.tsx`:
  - Org name display
  - User avatar/menu
  - Sign out button
  - Match TenderCreator header design

- Create `components/layout/Sidebar.tsx`:
  - Navigation links (Dashboard, Projects, Organization)
  - Active state styling
  - Icons using lucide-react
  - Match TenderCreator sidebar design

- Create `app/(dashboard)/layout.tsx`:
  - Protected layout wrapper
  - Include Header + Sidebar
  - Check auth, redirect if not signed in

### 19. Dashboard Page

- Create `app/(dashboard)/dashboard/page.tsx`:
  - Welcome message
  - Quick stats cards (# projects, # documents)
  - Recent projects list
  - "Create Project" CTA button

### 20. Organization Management

- Create `app/(dashboard)/organization/page.tsx`:
  - Display org info (name, settings)
  - Edit org settings form
  - Link to documents page

- Create `app/(dashboard)/organization/documents/page.tsx`:
  - Upload button (opens dialog)
  - Documents table (name, type, size, date, actions)
  - Delete button per row
  - "Extract Text" button triggering batch extraction
  - Show extraction status per document

### 21. Project Management

- Create `app/(dashboard)/projects/page.tsx`:
  - Projects displayed as card grid
  - Each card shows: name, client, deadline, status
  - "Create Project" button
  - Create project dialog (form with name, client, deadline, instructions)

- Create `app/(dashboard)/projects/[id]/page.tsx`:
  - Project details header
  - Tabs: Documents, Settings
  - Documents tab: upload area, documents list
  - Mark "Primary RFT" checkbox per document
  - "Extract Text" button
  - Show extraction status

### 22. Document Upload Flow

- Create upload dialog component
- Drag-and-drop zone or file picker
- File validation on client-side
- Upload progress indicator
- After upload completes, show "Text Extraction" button
- Trigger batch extraction API call
- Show extraction progress/status
- Update UI when extraction completes

### 23. Error Handling & UI Polish

- Add sonner toast notifications
- Loading states (spinners, skeletons)
- Error messages with retry buttons
- Empty states ("No projects yet")
- Form validation with zod + react-hook-form

### 24. Testing Data Flow End-to-End

- Sign in with Google OAuth
- Create organization
- Upload organization document
- Trigger text extraction
- Verify extracted text stored in database
- Create project
- Upload project document
- Mark as primary RFT
- Trigger text extraction
- Verify all data flows correctly

---
✅ CHECKPOINT: Steps 3-24 complete (Full implementation). Continue to step 25.
---

### 25. Documentation & Handoff

- Create `migrations/phase1/README.md` explaining:
  - How to review migration files
  - How to apply migrations using MCP tools after approval
  - Order of execution
- Update `.env.example` with clear instructions
- Create `ai_docs/documentation/phases_spec/phase1_core_schema/phase1_implementation.log` documenting:
  - All files created
  - Dependencies installed
  - Any issues encountered
  - Next steps for user (add API keys, apply migrations)

## Validation Commands

Execute every command to validate Phase 1 implementation:

```bash
# 1. Verify all dependencies installed
npm list @supabase/ssr @supabase/supabase-js @google/generative-ai

# 2. Check TypeScript compilation
npm run build

# 3. Verify environment variables structure
cat .env.example

# 4. Count migration files (should be 12)
ls -1 migrations/phase1/*.sql | wc -l

# 5. Check migration files syntax (no apply)
for file in migrations/phase1/*.sql; do
  echo "Checking $file..."
  # Just verify files exist and are readable
  cat "$file" > /dev/null
done

# 6. Verify Next.js dev server starts (after user adds keys)
# npm run dev

# 7. Check repository files exist
ls -la libs/repositories/

# 8. Check API route files exist
ls -la app/api/

# 9. Verify UI components installed
ls -la components/ui/

# 10. Check all page routes exist
ls -la app/(dashboard)/
ls -la app/(auth)/
```

# Implementation log created at:
# ai_docs/documentation/phases_spec/phase1_core_schema/phase1_implementation.log

## Notes

**Environment Setup:**
- User will add actual API keys to `.env.local` after implementation
- Supabase project already created, need URL and keys
- Gemini API key from https://aistudio.google.com/apikey

**Migration Application:**
- Migration files created but NOT applied during this phase
- User must review all migration files
- After approval, use MCP Supabase tools to apply migrations
- Apply migrations in numerical order (001 → 012)

**DOCX Support:**
- Gemini File API does NOT support DOCX directly
- Need conversion step: DOCX → PDF before upload
- Can use libraries like `libreoffice` CLI or cloud conversion services
- For MVP, may defer DOCX support and only accept PDFs

**Text Extraction:**
- Uses Gemini Batch API for cost efficiency (50% savings)
- Batch processing may take minutes to hours depending on queue
- Store extracted text permanently (Gemini files expire in 48hrs)
- Free tier: 25 requests/day (sufficient for testing)
- Production needs paid tier

**Authentication:**
- Google OAuth only (per coding patterns)
- Need to configure OAuth credentials in Supabase dashboard
- Redirect URL: `{APP_URL}/api/auth/callback`

**Next Steps After Phase 1:**
1. User adds API keys to `.env.local`
2. User reviews and approves migrations
3. Apply migrations using MCP tools
4. Test authentication flow
5. Test file upload + extraction
6. Ready for Phase 2 (AI Analysis & Document Decomposition)

## Research Documentation

- `ai_docs/documentation/phases_spec/phase1_core_schema/research_gemini_file_api.md` - Complete Gemini File API documentation including:
  - File upload and batch processing
  - Text extraction implementation
  - Storage format recommendations
  - Error handling patterns
  - Rate limits and pricing
  - Complete code examples

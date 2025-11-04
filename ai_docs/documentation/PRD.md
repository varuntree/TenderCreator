# Product Requirements Document
## Multi-Document Tender Response Platform

**Version:** 1.0
**Date:** 2025-11-04
**Status:** MVP Specification

---

## Executive Summary

### Problem
Current tender response tools (TenderCreator, AutogenAI) only handle **single-document outputs**. Real-world tenders require **5-15+ different documents** (Technical Specifications, Bill of Quantities, Risk Registers, Methodology, etc.). Teams manually split work or create everything in one bloated document.

### Solution
**Multi-document tender response platform** where:
1. Upload RFT documents
2. AI identifies ALL required submission documents
3. System creates separate work packages for each document
4. Team works in parallel (or solo sequentially)
5. Each document follows proven TC/AutogenAI workflow
6. Export complete tender package

### Innovation
**Real-world alignment** - matches how tenders actually work, not forcing single-document workflow.

### MVP Scope
- **Single-user functional** (can complete full workflow solo)
- **Multi-user UI visible** (show team collaboration concept)
- **Gemini 2.5 Flash only** (no RAG, 1M context window)
- **Match TenderCreator UI** (from docs.tendercreator.ai)
- **Generalized** (no domain-specific features)

---

## User Roles

### Admin
- Full access to organization
- Create/delete projects
- Invite team members
- Assign work packages to users
- View all documents

### Writer
- Create/edit assigned work packages
- Upload documents to projects
- Generate content with AI
- Export completed documents

### Reader
- View-only access to projects
- Comment on documents (future)
- No editing permissions

**MVP Note:** Roles exist in data model + UI elements, but single-user for demo.

---

## System Architecture

### High-Level Flow

```
┌──────────────────────────────────────────────────────────────┐
│ 1. ORGANIZATION SETUP                                        │
│    - Create organization workspace                           │
│    - Upload company documents (knowledge base)               │
│    - Invite team members (UI only for MVP)                   │
└──────────────────────────────────────────────────────────────┘
                          ↓
┌──────────────────────────────────────────────────────────────┐
│ 2. PROJECT CREATION                                          │
│    - Create project (name, client, deadline)                 │
│    - Upload RFT documents (PDF, DOCX, etc.)                  │
│    - Add project-specific context files                      │
│    - Optional: User instructions                             │
└──────────────────────────────────────────────────────────────┘
                          ↓
┌──────────────────────────────────────────────────────────────┐
│ 3. AI ANALYSIS & DECOMPOSITION                               │
│    Gemini 2.5 Flash analyzes RFT documents:                  │
│    ├─ Identify submission requirements                       │
│    ├─ Extract required document types                        │
│    ├─ Map requirements to each document                      │
│    └─ Generate Document Requirements Matrix                  │
│                                                              │
│    Output: List of 5-15+ documents to create                │
│            Each with specific requirements                   │
└──────────────────────────────────────────────────────────────┘
                          ↓
┌──────────────────────────────────────────────────────────────┐
│ 4. WORK DISTRIBUTION                                         │
│    User reviews document list:                               │
│    ├─ Validate/edit document types                           │
│    ├─ Add custom documents if needed                         │
│    ├─ Assign to team members (UI only)                       │
│    └─ OR work solo (sequential)                              │
└──────────────────────────────────────────────────────────────┘
                          ↓
┌──────────────────────────────────────────────────────────────┐
│ 5. DOCUMENT WORKFLOW (per work package)                     │
│                                                              │
│    5.1 Requirements Analysis                                 │
│        - Show extracted requirements for THIS document       │
│        - User validates/edits                                │
│                                                              │
│    5.2 Strategy & Planning                                   │
│        - Win themes generation                               │
│        - Key messages                                        │
│        - Bid/no-bid assessment (project-level)               │
│                                                              │
│    5.3 Content Generation                                    │
│        - AI generates document using:                        │
│          • All organization documents                        │
│          • All RFT project files                             │
│          • Document-specific requirements                    │
│          • Win themes from strategy                          │
│          • User instructions                                 │
│        - Stream generation (show progress)                   │
│                                                              │
│    5.4 Intelligent Editing                                   │
│        - Rich text editor                                    │
│        - Select text → AI actions:                           │
│          • Expand/shorten                                    │
│          • Add evidence from org knowledge                   │
│          • Check compliance vs requirements                  │
│          • Rephrase (tone/style)                             │
│          • Custom instruction                                │
│                                                              │
│    5.5 Export                                                │
│        - Generate Word/PDF                                   │
│        - Mark as completed                                   │
│                                                              │
│    REPEAT for all documents (parallel or sequential)         │
└──────────────────────────────────────────────────────────────┘
                          ↓
┌──────────────────────────────────────────────────────────────┐
│ 6. PROJECT COMPLETION                                        │
│    - Dashboard shows all document statuses                   │
│    - Export complete tender package (zip)                    │
│    - Submit                                                  │
└──────────────────────────────────────────────────────────────┘
```

---

## Data Models

### Organization
```typescript
type Organization = {
  id: string
  name: string
  created_at: timestamp

  // Settings
  settings: {
    ai_model: 'gemini-2.5-flash' // Fixed for MVP
    default_tone: string // 'professional' | 'technical' | 'conversational'
  }
}
```

### User
```typescript
type User = {
  id: string
  email: string
  name: string
  organization_id: string (FK)
  role: 'admin' | 'writer' | 'reader'
  created_at: timestamp
}
```

### OrganizationDocument
```typescript
type OrganizationDocument = {
  id: string
  organization_id: string (FK)
  name: string
  file_path: string // Supabase Storage path
  file_type: string // 'pdf' | 'docx' | 'txt' | etc.
  file_size: number
  uploaded_by: string (FK User)
  uploaded_at: timestamp

  // Metadata
  category?: string // 'capability_statement' | 'case_study' | 'certification'
  tags: string[]

  // AI Processing
  content_extracted: boolean
  content_text?: string // Full text for Gemini context
}
```

### Project
```typescript
type Project = {
  id: string
  organization_id: string (FK)

  // Project Details
  name: string
  client_name?: string
  deadline?: timestamp
  status: 'setup' | 'analysis' | 'in_progress' | 'completed'

  // User Instructions
  instructions?: string // Optional user guidance for AI

  created_by: string (FK User)
  created_at: timestamp
  updated_at: timestamp
}
```

### ProjectDocument
```typescript
type ProjectDocument = {
  id: string
  project_id: string (FK)
  name: string
  file_path: string
  file_type: string
  file_size: number
  is_primary_rft: boolean // Main RFT vs addendums
  uploaded_by: string (FK User)
  uploaded_at: timestamp

  // AI Processing
  content_extracted: boolean
  content_text?: string
}
```

### WorkPackage
```typescript
type WorkPackage = {
  id: string
  project_id: string (FK)

  // Document Definition
  document_type: string // 'Technical Specification' | 'Bill of Quantities' | etc.
  document_description?: string

  // Requirements
  requirements: {
    id: string
    text: string
    priority: 'mandatory' | 'optional'
    source: string // RFT reference
  }[]

  // Assignment (UI only for MVP)
  assigned_to?: string (FK User)
  status: 'not_started' | 'in_progress' | 'completed'

  // Order/Priority
  order: number

  created_at: timestamp
  updated_at: timestamp
}
```

### WorkPackageContent
```typescript
type WorkPackageContent = {
  id: string
  work_package_id: string (FK)

  // Strategy Phase
  win_themes: string[]
  key_messages: string[]

  // Generated Content
  content: string // HTML/Markdown
  content_version: number // For versioning

  // Export
  exported_file_path?: string
  exported_at?: timestamp

  created_at: timestamp
  updated_at: timestamp
}
```

### AIInteraction (Logging)
```typescript
type AIInteraction = {
  id: string
  project_id?: string (FK)
  work_package_id?: string (FK)

  // Interaction Details
  type: 'analysis' | 'generation' | 'editing' | 'strategy'
  prompt: string
  response: string

  // Context Used
  context_tokens: number
  model: 'gemini-2.5-flash'

  created_at: timestamp
}
```

---

## Feature Specifications

### Phase 1: Core Schema & Project Structure

**Goal:** Database + basic CRUD

**Features:**

**1.1 Organization Workspace**
- Create organization (one-time setup)
- Organization settings page
- Display org name in header

**1.2 User Management**
- User profile page
- Role display (Admin/Writer/Reader badge)
- User list in settings (UI only)
- No actual invites for MVP

**1.3 Document Upload (Organization-Level)**
- Upload company documents
- File list view (table: name, type, size, uploaded date)
- Delete documents
- No folders/categories for MVP (simple flat list)
- Supabase Storage integration
- Extract text on upload (Gemini File API)

**1.4 Project Creation**
- Create project form (name, client, deadline)
- Project list view (card grid)
- Project details page
- Delete project

**1.5 Project Document Upload (RFT Files)**
- Upload RFT documents to specific project
- Mark one as "Primary RFT" (checkbox)
- File list view
- Extract text on upload

**UI Reference:** Match TenderCreator's clean card-based design from docs.tendercreator.ai

**Success Criteria:**
✓ Can create org + upload org docs
✓ Can create project + upload RFT files
✓ All files stored in Supabase Storage
✓ Text extracted and ready for Gemini

---

### Phase 2: AI Analysis & Document Decomposition

**Goal:** RFT → identified document list

**Features:**

**2.1 Analysis Trigger**
- "Analyze RFT" button on project page
- Shows loading state during analysis
- Streams progress updates (optional)

**2.2 Gemini Analysis Agent**

**Input:**
- All RFT document texts (concatenated)
- Project instructions (if provided)

**Prompt Pattern:**
```
You are analyzing a Request for Tender (RFT) to identify ALL required submission documents.

RFT Documents:
[Concatenated RFT texts]

User Instructions: [If provided]

Tasks:
1. Identify ALL documents that must be submitted as part of the tender response
2. Extract specific requirements for EACH document
3. Classify requirements as mandatory or optional
4. Provide RFT page/section references

Output as structured JSON:
{
  "documents": [
    {
      "type": "Technical Specification",
      "description": "Detailed technical approach and methodology",
      "requirements": [
        {
          "text": "Must describe cloud architecture approach",
          "priority": "mandatory",
          "source": "Section 3.2, Page 12"
        }
      ]
    }
  ]
}

Be thorough. Typical tenders require 5-15 documents.
Common types: Technical Spec, Methodology, Bill of Quantities, Risk Register,
Subcontractor List, Project Plan, Quality Plan, WHS Plan, etc.
```

**Output:**
- Parsed JSON → Create WorkPackage records
- Store requirements in work_package.requirements

**2.3 Document Requirements Matrix UI**

Display as table:
```
┌─────────────────────────┬──────────────────┬──────────────┬────────────┐
│ Document Type           │ Requirements (n) │ Assigned To  │ Status     │
├─────────────────────────┼──────────────────┼──────────────┼────────────┤
│ Technical Specification │ 8                │ [Dropdown ▼] │ Not Started│
│ Bill of Quantities      │ 5                │ [Dropdown ▼] │ Not Started│
│ Methodology             │ 6                │ [Dropdown ▼] │ Not Started│
│ Risk Register           │ 3                │ [Dropdown ▼] │ Not Started│
└─────────────────────────┴──────────────────┴──────────────┴────────────┘

[+ Add Custom Document]
[Continue to Workflow →]
```

**2.4 User Validation**
- Edit document types (rename, delete)
- Add custom document type manually
- Expand row to see requirements list
- Edit individual requirements

**Success Criteria:**
✓ Upload RFT → Click analyze → See document list
✓ Can edit/validate list before proceeding
✓ All data persisted to database

---

### Phase 3: Work Package Assignment (UI Only)

**Goal:** Show team collaboration concept

**Features:**

**3.1 Assignment Dropdown**
- Dropdown per document showing "Admin", "Writer A", "Writer B" (mock users)
- Selection updates work_package.assigned_to (visual only)
- Can leave unassigned (defaults to current user when opened)

**3.2 Project Dashboard**

Status cards:
```
┌──────────────────────────┐  ┌──────────────────────────┐
│ Technical Specification  │  │ Bill of Quantities       │
│ Assigned: Admin          │  │ Assigned: Writer A       │
│ Status: In Progress ◐    │  │ Status: Not Started ○    │
│ Requirements: 8          │  │ Requirements: 5          │
│ [Open →]                 │  │ [Open →]                 │
└──────────────────────────┘  └──────────────────────────┘
```

**3.3 Progress Indicators**
- ○ Not Started (gray)
- ◐ In Progress (yellow)
- ● Completed (green)

**Success Criteria:**
✓ Can "assign" documents (UI only)
✓ Dashboard shows statuses
✓ Clicking "Open" enters workflow

---

### Phase 4: Single Document Workflow

**Goal:** Complete one work package (document) from start to export

**4.1 Requirements Analysis Screen**

Display:
- Work package title (document type)
- List of requirements with:
  - Requirement text
  - Priority badge (Mandatory/Optional)
  - RFT source reference
- Edit buttons (add/remove/modify requirements)
- [Continue to Strategy →]

**4.2 Strategy & Planning Screen**

**Win Themes Generation:**

**Gemini Prompt:**
```
Context:
- Project: [project name]
- Document Type: [work package type]
- Requirements: [list of requirements]
- Organization Documents: [ALL org doc texts]
- RFT Documents: [ALL RFT texts]

Generate 3-5 win themes for this [document type] that:
1. Address the requirements
2. Leverage our organizational strengths (from docs)
3. Differentiate us from competitors

Output as JSON array of strings.
```

Display:
- Generated win themes (editable list)
- Key messages (AI-generated or user-added)
- Simple bid/no-bid assessment (optional - just AI recommendation)
- [Continue to Generation →]

**4.3 Content Generation Screen**

**Generation Button:**
- Triggers Gemini generation
- Shows streaming progress (optional - or just loading spinner)

**Gemini Prompt:**
```
You are writing a [document type] for a tender response.

Context:
- Project: [project name]
- Client: [client name]
- Deadline: [deadline]

Requirements to Address:
[List of all requirements with priorities]

Win Themes:
[List of win themes]

Organization Knowledge (use to demonstrate capabilities):
[ALL organization document texts - concatenated]

RFT Documents (understand requirements from):
[ALL RFT document texts - concatenated]

User Instructions:
[If provided]

Task:
Write a comprehensive [document type] that:
1. Addresses EVERY mandatory requirement explicitly
2. Incorporates the win themes naturally
3. Demonstrates our capabilities using evidence from org docs
4. Maintains professional tone
5. Is structured logically with clear headings

Output as well-formatted Markdown.
```

Display:
- Generated content in editor (below)
- [Edit Content →] transitions to editing

**4.4 Intelligent Editing Screen**

**Rich Text Editor:**
- TipTap or similar (Markdown support)
- Full formatting toolbar
- Display generated content

**AI Assistance Menu:**
When user selects text:
```
┌────────────────────────┐
│ ✨ AI Actions          │
├────────────────────────┤
│ → Expand               │
│ → Shorten              │
│ → Add Evidence         │
│ → Rephrase             │
│ → Check Compliance     │
│ → Custom Instruction   │
└────────────────────────┘
```

**Action Prompts:**

*Expand:*
```
Selected text: [selection]
Context: [full document + org docs + RFT]

Expand this text with more detail and supporting evidence.
Maintain tone. Add 2-3 paragraphs.
```

*Add Evidence:*
```
Selected text: [selection]
Organization documents: [ALL org docs]

Find relevant case studies, certifications, or project examples from our
organization documents that support this claim. Add them as evidence.
```

*Check Compliance:*
```
Selected section: [selection]
Requirements for this document: [requirements list]

Check if this section addresses the requirements.
List any missing requirements.
```

*Custom Instruction:*
- Show input field for user instruction
- Send to Gemini with context + instruction

**Result:** Replace selected text or insert at cursor

**4.5 Export**

- [Export as Word] button
- Generate .docx using library (docx.js or similar)
- Download file
- Mark work package as completed
- Return to project dashboard

**Success Criteria:**
✓ Can complete full workflow for one document
✓ Requirements → Strategy → Generate → Edit → Export
✓ AI assistance works in editor
✓ Exported document looks professional

---

### Phase 5: Multi-Document Orchestration

**Goal:** Scale Phase 4 to handle all documents

**Features:**

**5.1 Multi-Document State Management**
- Track status per work package
- Can work on documents in any order
- Can have multiple "in progress" (UI shows, single user in practice)

**5.2 Shared Context**
- ALL documents use same context pool:
  - All org documents
  - All RFT documents
  - Project instructions
- Context assembled once per generation (not stored)

**5.3 Cross-Document Awareness (Future - skip for MVP)**
- Reference other work packages
- "Methodology document references Risk Register Section 3"
- For MVP: Each document independent

**5.4 Bulk Export**
- "Export All Completed" button on dashboard
- Creates ZIP file with all completed documents
- File naming: `[DocumentType]_[ProjectName].docx`

**Success Criteria:**
✓ Can create 5+ different documents from one RFT
✓ Each follows same workflow
✓ Can export individually or as package
✓ Context properly shared

---

### Phase 6: Polish & Demo Prep

**Goal:** Production-quality demo

**6.1 UI Polish**
- Match TenderCreator design exactly (from docs screenshots)
- Consistent styling (colors, spacing, typography)
- Loading states everywhere
- Error handling (toast notifications)
- Empty states ("No projects yet - create one")

**6.2 Animations**
- Page transitions (Framer Motion)
- Card hover effects
- Smooth AI generation progress

**6.3 Demo Data**
- Pre-populate with realistic org docs
- Sample RFT for construction tender
- Pre-analyzed project showing document list

**6.4 Demo Script**
1. Show org setup + uploaded docs (pre-done)
2. Create new project
3. Upload RFT
4. Analyze → show document decomposition
5. "Assign" documents (show UI)
6. Walk through ONE document workflow fully
7. Show dashboard with multiple docs in progress
8. Export package

**6.5 Error Handling**
- Gemini API failures → retry + user message
- File upload failures → clear error
- Invalid data → validation messages
- Network issues → offline indication

**Success Criteria:**
✓ Zero errors during demo run
✓ Looks professional (matches TC)
✓ Fast (Gemini 2.5 Flash responses <5s)
✓ Smooth animations/transitions

---

## AI Workflows

### Document Identification Agent

**Trigger:** User clicks "Analyze RFT" on project

**Input:**
```typescript
{
  rft_documents: string[], // All RFT texts concatenated
  user_instructions?: string,
  project_context: {
    name: string,
    client?: string
  }
}
```

**Process:**
1. Send to Gemini 2.5 Flash with analysis prompt
2. Parse JSON response
3. Validate structure (has documents array)
4. Create WorkPackage records for each document
5. Store requirements in work_package.requirements JSONB

**Output:** WorkPackage[] in database

**Error Handling:**
- Invalid JSON → Retry with corrected prompt
- No documents identified → Show error, allow manual creation
- API failure → Retry 3x, then manual fallback

---

### Content Generation Agent

**Trigger:** User clicks "Generate Content" in work package workflow

**Input:**
```typescript
{
  work_package: WorkPackage,
  organization_documents: OrganizationDocument[],
  project_documents: ProjectDocument[],
  win_themes: string[],
  user_instructions?: string
}
```

**Context Assembly:**
```typescript
const context = {
  project_name: project.name,
  client_name: project.client_name,
  document_type: work_package.document_type,
  requirements: work_package.requirements,
  win_themes: win_themes,

  // ALL texts concatenated (Gemini handles 1M tokens)
  org_knowledge: organizationDocuments.map(d => d.content_text).join('\n\n'),
  rft_content: projectDocuments.map(d => d.content_text).join('\n\n'),

  user_instructions: user_instructions
}
```

**Process:**
1. Assemble full context (<1M tokens for MVP)
2. Send to Gemini 2.5 Flash with generation prompt
3. Stream response (optional) or wait for completion
4. Save to WorkPackageContent.content
5. Display in editor

**Output:** Generated Markdown content

**Error Handling:**
- Token limit exceeded → Truncate org docs (oldest first)
- Generation failure → Retry, then allow manual writing
- Poor quality → User can regenerate with modified prompt

---

### Editing Assistant Agent

**Trigger:** User selects text + clicks AI action in editor

**Input:**
```typescript
{
  action: 'expand' | 'shorten' | 'add_evidence' | 'rephrase' | 'check_compliance' | 'custom',
  selected_text: string,
  full_document: string, // Current editor content
  context: {
    org_documents: string[],
    requirements: Requirement[],
    custom_instruction?: string
  }
}
```

**Process:**
1. Build action-specific prompt
2. Include relevant context (not all if action-specific)
3. Send to Gemini 2.5 Flash
4. Return modified text
5. User reviews + applies (replace selection or insert)

**Output:** Modified text string

**Error Handling:**
- API failure → Show error, keep selection
- Unexpected output → Show raw response, allow manual edit

---

## UI Design Reference

**CRITICAL: All UI implementation must match TenderCreator's existing design exactly.**

### Reference Screenshots
**Location:** `/ai_docs/ui_reference/`

**Required Screenshots:**
1. `01_new_tender_screen.png` - New Tender creation flow
   - 5-step progress indicator design
   - Form layouts (tender name, document upload)
   - Dashed border upload zones
   - Section organization

2. `02_team_management.png` - Team management interface
   - Team members table layout
   - Organization roles cards
   - Role badges and permissions display
   - Search and invite UI patterns

### Implementation Rules

**BEFORE implementing ANY UI component, the developer/agent MUST:**

1. **Review reference screenshots** in `/ai_docs/ui_reference/`
2. **Match exactly:**
   - Color scheme (green primary, gray neutrals)
   - Typography (font sizes, weights, spacing)
   - Card layouts (rounded corners, shadows, padding)
   - Button styles (filled green, outlined)
   - Form inputs (borders, focus states, placeholders)
   - Icons (size, style, positioning)
   - Spacing (margins, padding, gaps)
   - Progress indicators (step numbers, connecting lines)
   - Table designs (headers, rows, actions)
   - Dashed upload zones
   - Badge designs (role indicators)

3. **Maintain consistency:**
   - Sidebar navigation (icons, labels, active states)
   - Header (logo, user avatar, breadcrumbs)
   - Page layouts (content width, centering)
   - Empty states
   - Loading states
   - Error states

### Design Tokens (Extract from Screenshots)

**Colors:**
- Primary: Green (#10B981 or similar)
- Text: Dark gray (#1F2937)
- Borders: Light gray (#E5E7EB)
- Background: White/Off-white
- Muted text: Medium gray (#6B7280)

**Typography:**
- Headings: Bold, larger sizes
- Body: Regular weight
- Form labels: Medium weight, smaller

**Spacing:**
- Consistent 16px/24px grid system
- Card padding: ~24-32px
- Section gaps: ~32-48px

**Components:**
- Rounded corners: 8px (cards, buttons, inputs)
- Shadows: Subtle (cards)
- Borders: 1px solid light gray

### No Deviation
**Do NOT:**
- ✗ Create new design patterns
- ✗ Use different colors
- ✗ Change spacing significantly
- ✗ Redesign components
- ✗ Add unnecessary embellishments

**Goal:** User sees our app and thinks "this IS TenderCreator, just better."

---

## Technical Stack

### Frontend
- **Framework:** Next.js 14 (App Router)
- **UI Components:** shadcn/ui (customized to match TC design)
- **Styling:** Tailwind CSS (custom config matching TC colors/spacing)
- **Editor:** TipTap (rich text)
- **Animations:** Framer Motion
- **State:** React Context / Zustand (lightweight)
- **Forms:** React Hook Form + Zod validation

### Backend
- **Database:** Supabase (PostgreSQL)
- **Storage:** Supabase Storage
- **Auth:** Supabase Auth
- **API:** Next.js Server Actions / API Routes

### AI
- **Model:** Gemini 2.5 Flash (everywhere)
- **SDK:** @google/generative-ai
- **Context:** Full dump (no RAG, no vector DB)
- **Max Tokens:** 1M input (generous for MVP)

### Deployment
- **Hosting:** Vercel
- **Env:** Supabase + Gemini API keys
- **Storage:** Supabase (file uploads)

### Development Tools
- **TypeScript:** Strict mode
- **Linting:** ESLint + Prettier
- **Git:** Existing Next.js repo (build on top)

---

## Implementation Phases

### Phase 1: Core Schema & Project Structure (3-5 days)
**Deliverable:** Can create org, upload docs, create projects

**Tasks:**
- [ ] Supabase schema setup (run migrations)
- [ ] Org creation flow
- [ ] Org document upload (Supabase Storage integration)
- [ ] Text extraction on upload (Gemini File API)
- [ ] Project CRUD
- [ ] Project document upload
- [ ] Basic UI (header, nav, project list, doc list)
  - [ ] **BEFORE UI work:** Review `/ai_docs/ui_reference/` screenshots
  - [ ] Match sidebar, header, layout exactly from reference
  - [ ] Use TC color scheme and spacing

**Success:** Full data flow: org → docs → project → RFT upload, **UI matches reference screenshots**

---

### Phase 2: AI Analysis & Decomposition (3-4 days)
**Deliverable:** Upload RFT → see document list

**Tasks:**
- [ ] "Analyze RFT" button
- [ ] Gemini analysis prompt engineering
- [ ] JSON parsing + validation
- [ ] WorkPackage creation from AI response
- [ ] Document Requirements Matrix UI
- [ ] Edit/validate functionality (add/remove docs)
- [ ] Manual document addition

**Success:** Click analyze → accurate document list appears

---

### Phase 3: Work Package Assignment (1-2 days)
**Deliverable:** Assignment UI complete

**Tasks:**
- [ ] Assignment dropdown (mock users)
- [ ] Project dashboard with status cards
- [ ] Progress indicators (not started/in progress/completed)
- [ ] Status transitions (manual for MVP)
- [ ] "Open" button → enter workflow

**Success:** Can "assign" docs, see dashboard, click into workflow

---

### Phase 4: Single Document Workflow (5-7 days)
**Deliverable:** Complete one work package end-to-end

**Tasks:**
- [ ] Requirements analysis screen
- [ ] Win themes generation (Gemini prompt)
- [ ] Strategy screen UI
- [ ] Content generation prompt engineering
- [ ] Generation screen with loading
- [ ] TipTap editor integration
- [ ] AI assistance menu (select text → actions)
- [ ] Implement each AI action (expand, evidence, etc.)
- [ ] Export to Word (docx.js)
- [ ] Mark as completed

**Success:** Generate, edit, export one document

---

### Phase 5: Multi-Document Orchestration (2-3 days)
**Deliverable:** Create 5+ documents from one RFT

**Tasks:**
- [ ] Multi-document state management
- [ ] Context sharing across documents
- [ ] Dashboard showing multiple docs
- [ ] Bulk export (ZIP)
- [ ] File naming conventions

**Success:** Complete multiple different documents in one project

---

### Phase 6: Polish & Demo Prep (3-4 days)
**Deliverable:** Demo-ready application

**Tasks:**
- [ ] UI polish - **CRITICAL: Pixel-perfect match to reference screenshots**
  - [ ] Review `/ai_docs/ui_reference/` screenshots
  - [ ] Validate every component against reference
  - [ ] Fix any design deviations
  - [ ] Test responsive behavior (desktop focus)
- [ ] Animations (Framer Motion)
- [ ] Error handling everywhere
- [ ] Loading states (match TC style)
- [ ] Empty states (match TC style)
- [ ] Demo data setup
- [ ] Demo script testing (5+ dry runs)
- [ ] Performance optimization (if needed)

**Success:** Flawless demo run, professional appearance, **indistinguishable from TenderCreator UI**

---

**Total Estimate:** 3-4 weeks (solo + AI agents)

---

## Success Metrics

### MVP Acceptance Criteria

**Must Have:**
✓ Upload RFT → AI identifies 5-15 documents accurately
✓ Each document has extracted requirements
✓ Can complete full workflow for any document type
✓ AI editor assistance works (expand, evidence, compliance)
✓ Export professional Word documents
✓ Multi-user UI visible (even if single-user functional)
✓ Matches TenderCreator visual design
✓ Zero crashes during demo

**Nice to Have:**
- Streaming generation (real-time progress)
- Advanced animations
- Cross-document references
- Actual multi-user functionality

**Out of Scope (Post-MVP):**
- RAG / vector database
- Multiple AI models
- Email invitations
- Team collaboration (real)
- Billing/subscriptions
- Mobile responsive (desktop demo only)

---

## Risks & Mitigations

### Risk 1: Gemini Token Limits
**Risk:** Large RFTs + many org docs exceed 1M tokens
**Mitigation:**
- Monitor token usage
- Truncate org docs if needed (oldest first)
- MVP unlikely to hit limits (typical RFT <100K tokens)

### Risk 2: Document Identification Accuracy
**Risk:** AI misses required documents or hallucinates
**Mitigation:**
- User validation step (edit document list)
- Manual add/remove documents
- Iterate on prompt with real RFT examples

### Risk 3: Generated Content Quality
**Risk:** AI output not professional enough
**Mitigation:**
- Intelligent editing (user can fix)
- Regenerate option
- Prompt engineering iteration
- Gemini 2.5 Flash surprisingly good (test early)

### Risk 4: UI/UX Mismatch
**Risk:** Doesn't look like TenderCreator
**Mitigation:**
- Extract exact designs from docs.tendercreator.ai early
- Use shadcn/ui for consistency
- Review with stakeholder mid-build

### Risk 5: Timeline Slip
**Risk:** 3-4 weeks becomes 6-8 weeks
**Mitigation:**
- Strict scope (no feature creep)
- Daily progress tracking
- Cut Phase 6 polish if needed (functional > pretty)

---

## Next Steps

1. **Approval:** Review this PRD, confirm scope
2. **Phase 1 Start:** Set up Supabase schema
3. **Build incrementally:** Phase by phase
4. **Test early:** Real RFT documents ASAP
5. **Demo prep:** Final week focused on polish

**Ready to begin Phase 1.**

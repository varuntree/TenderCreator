# Project Context
## Multi-Document Tender Response Platform

**Last Updated:** 2025-11-04
**For:** Future AI sessions (context continuity)

---

## What We're Building

### The Problem
Current tender tools (TenderCreator.ai, AutogenAI) only generate **one document** per tender. Real tenders require **5-15+ different documents** (Technical Specs, Bill of Quantities, Risk Registers, Methodology, etc.).

### Our Solution
**Multi-document tender response platform** where AI:
1. Analyzes RFT documents
2. Identifies ALL required submission documents
3. Creates work packages for each document
4. Team works in parallel (or solo)
5. Each document follows proven workflow
6. Export complete tender package

**Innovation:** Real-world alignment - matches how tenders actually work.

---

## Why We're Building This

### Goal
**Win implementation contract** with TenderCreator.ai by:
- Building superior version as proof-of-concept
- Demonstrating multi-document capability (they don't have)
- Showing we can improve their product
- Proving technical execution ability

### Strategy
- **Not competitor** - positioning as contractor to enhance their product
- **MVP focus** - demo-grade to win contract, then get codebase access
- **Blow their minds** - feature they need but haven't built
- **Timeline:** 3-4 weeks solo + AI agents

---

## Key Constraints & Decisions

### Must Match TenderCreator UI
- Use their existing design (from docs.tendercreator.ai)
- Clean, card-based layouts
- Professional SaaS aesthetic
- **Why:** Show we understand their product + can enhance it

### Building On Existing Repo
- **Current repo:** Next.js 14 with marketing pages
- **Our task:** Build product features on top
- **Location:** `/app` directory (App Router)
- No marketing changes needed (already done)

### MVP Scope
- **Single-user functional** (can complete workflow solo)
- **Multi-user UI visible** (show team features, not functional)
- **Roles exist** (Admin/Writer/Reader) in data model + UI, single user in demo
- **Demo-grade** (not production-ready, proof-of-concept)

### Tech Stack (Locked In)
- **Frontend:** Next.js 14, shadcn/ui, Tailwind CSS, TipTap (editor)
- **Backend:** Supabase (PostgreSQL + Storage + Auth)
- **AI:** Gemini 2.5 Flash ONLY (everywhere)
- **No RAG, no vector DB** - dump all context (1M token window)
- **Deployment:** Vercel

### AI Strategy
- **Gemini 2.5 Flash everywhere:**
  - Document identification
  - Content generation
  - Editing assistance
  - Win themes
  - Strategy
- **Why Gemini:**
  - 1M token context (can dump all docs)
  - Free tier (cost-effective for MVP)
  - Simple (no RAG complexity)
  - Fast enough for demo
- **Context approach:**
  - Concatenate ALL org docs + ALL RFT docs
  - Send full context per generation
  - Let Gemini handle it (1M tokens plenty for MVP)

### What We're NOT Building (MVP)
- ✗ Email invitations (just UI mockups)
- ✗ Real team collaboration (single user, multi-user UI)
- ✗ Billing/subscriptions
- ✗ Mobile responsive (desktop demo only)
- ✗ Vector database / RAG
- ✗ Multiple AI models
- ✗ Advanced analytics
- ✗ Integrations (AusTender, Salesforce, etc.)

---

## Research Completed

### Location: `/ai_docs/`

**Competitor Research:**
- `tendercreator/` - Client (underperforming, Dec 2024 launch, no funding)
- `autogenai/` - Market leader ($87M, Salesforce-backed, enterprise)

**Key Files:**
- `01_product_features.md` - Feature analysis
- `02_technical_architecture.md` - Tech stack insights
- `03_market_strategy.md` - Market positioning
- `INDEX.md` - Executive summary per company

**Insights Used:**
- TenderCreator's 4-phase workflow (good UX pattern)
- AutogenAI's intelligent editor (AI text selection actions)
- Gap identified: Neither handles multi-document tenders
- UI reference: TenderCreator docs.tendercreator.ai

---

## Product Spec

### Document: `/ai_docs/PRD.md`

**Covers:**
- Complete system architecture
- Data models (Org, Project, WorkPackage, etc.)
- Feature specs (Phase 1-6)
- AI workflows
- Implementation timeline

**Core Flow:**
```
Project Setup → Upload RFT → AI Analysis (identify docs) →
Work Distribution → Per-Document Workflow (5-15 docs) →
Export Package
```

**Per-Document Workflow:**
```
Requirements → Strategy → Generate → Intelligent Editing → Export
```

---

## Implementation Phases

### Phase 1: Core Schema & Project Structure (3-5 days)
- Supabase setup
- Org + project creation
- Document uploads (org-level + project-level)
- Text extraction (Gemini File API)

### Phase 2: AI Analysis & Decomposition (3-4 days)
- "Analyze RFT" button
- Gemini identifies all required documents
- Document Requirements Matrix UI
- User validation (edit list)

### Phase 3: Work Package Assignment (1-2 days)
- Assignment UI (dropdowns, mock users)
- Project dashboard (status cards)
- Progress indicators

### Phase 4: Single Document Workflow (5-7 days)
- Requirements analysis screen
- Win themes generation
- Content generation (Gemini)
- TipTap editor integration
- AI assistance (select text → actions: expand, evidence, etc.)
- Export to Word

### Phase 5: Multi-Document Orchestration (2-3 days)
- Scale Phase 4 to all documents
- Shared context across docs
- Bulk export (ZIP)

### Phase 6: Polish & Demo Prep (3-4 days)
- Match TC UI exactly
- Animations, loading states, errors
- Demo data + script
- Practice runs

**Total:** 3-4 weeks

---

## Current State

### What Exists
- Next.js 14 repo with marketing pages
- Basic project structure
- Research in `/ai_docs/`
- PRD complete

### What's Next
**Phase 1 implementation** - set up Supabase schema, start building.

---

## Data Models (Quick Reference)

### Organization
- id, name, settings (AI model, tone)

### User
- id, email, name, organization_id, role (admin/writer/reader)

### OrganizationDocument
- id, organization_id, name, file_path, content_text
- Company knowledge base (capability statements, case studies, etc.)

### Project
- id, organization_id, name, client_name, deadline, status, instructions

### ProjectDocument
- id, project_id, name, file_path, is_primary_rft, content_text
- RFT files + addendums

### WorkPackage
- id, project_id, document_type, requirements[], assigned_to, status, order
- Each required submission document (Tech Spec, BoQ, etc.)

### WorkPackageContent
- id, work_package_id, win_themes[], content (HTML/MD), exported_file_path
- Generated content per work package

### AIInteraction (logging)
- id, project_id, type, prompt, response, tokens, model

---

## Demo Script (Final)

**Duration:** 8-10 minutes

**Act 1: Setup (30s)**
- Show org dashboard with uploaded company docs
- "We've already set up our organization and uploaded our capability statements, case studies, certifications"

**Act 2: Project Creation (1min)**
- Create new project: "NSW Government Cloud Infrastructure RFT"
- Upload RFT PDF (drag & drop)
- Show file uploaded

**Act 3: The Magic - Document Decomposition (2min)**
- Click "Analyze RFT"
- Show AI processing
- **Key moment:** Document list appears (10+ documents)
  - Technical Specification
  - Bill of Quantities
  - Methodology
  - Risk Register
  - WHS Plan
  - Quality Plan
  - Subcontractor List
  - [etc.]
- "Current tools make you create ONE document. We identify ALL required documents."
- Show requirements per document (expand row)

**Act 4: Team Assignment (30s)**
- Show assignment dropdowns (UI only)
- "Assign Tech Spec to John, BoQ to Sarah, I'll handle Methodology"
- Show project dashboard with assigned docs

**Act 5: Document Workflow (3-4min)**
- Open "Methodology" work package
- Walk through phases:
  1. Requirements (show extracted list)
  2. Strategy (generate win themes)
  3. **Content generation** (click → show streaming/loading → full doc appears)
  4. **Intelligent editing** (THIS IS THE WOW)
     - Select paragraph
     - Show AI menu
     - Click "Add Evidence" → AI pulls case study from org docs
     - Select another section → "Check Compliance" → AI validates against requirements
  5. Export Word document (download)

**Act 6: Scale (1min)**
- Back to dashboard
- Show multiple documents in various states
- "Each document follows same workflow, team works in parallel"
- Click "Export All" → ZIP download

**Act 7: Close (30s)**
- "This is how tenders actually work - multiple documents, not one"
- "Built on modern stack, Gemini AI, matches your current UI"
- "Ready to enhance TenderCreator with this capability"

**Total:** ~8 minutes, 3-4 minutes is pure demo, rest is context/explanation

---

## Technical Notes

### Gemini Integration
```typescript
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

// Full context dump
const context = `
Organization Documents:
${orgDocs.map(d => d.content_text).join('\n\n')}

RFT Documents:
${rftDocs.map(d => d.content_text).join('\n\n')}

Requirements:
${requirements.map(r => r.text).join('\n')}
`;

const result = await model.generateContent({
  contents: [{ role: 'user', parts: [{ text: prompt + context }] }]
});
```

### Supabase Schema
```sql
-- Run migrations in order
-- See PRD for full schema
-- Key tables: organizations, users, organization_documents,
-- projects, project_documents, work_packages, work_package_content
```

### File Upload Flow
1. User uploads file → Supabase Storage
2. Get public URL
3. Extract text (Gemini File API or PDF parser)
4. Store text in `content_text` column
5. Ready for AI context

---

## Common Questions (Future You Might Ask)

### Q: Why Gemini 2.5 Flash instead of Claude?
**A:** Cost + 1M context. Claude better quality but expensive for MVP. Gemini free tier sufficient for demo.

### Q: Why no RAG?
**A:** MVP simplicity. RFTs typically <100K tokens, org docs <50K. Total context <200K tokens (well under 1M limit). No need for complexity.

### Q: Why match TenderCreator UI?
**A:** We're pitching to enhance THEIR product. Showing we understand their design language proves we can integrate seamlessly.

### Q: Why single-user if showing team features?
**A:** Demo focus. Real multi-user = email invites, permissions, complex state. Not needed to prove concept. UI shows capability.

### Q: Can we add [feature X]?
**A:** Check PRD "Out of Scope" section. If not critical for demo, defer to post-contract.

### Q: What if Gemini analysis misses documents?
**A:** User validation step. Can manually add/remove documents. AI suggests, user confirms.

### Q: Export format?
**A:** Word (.docx) using docx.js library. Industry standard for tenders.

---

## Success Criteria

### Demo Must Show:
✓ Upload RFT → AI identifies 10+ documents automatically
✓ Each document has specific requirements extracted
✓ Team assignment UI (even if single-user)
✓ Complete workflow for one document (end-to-end)
✓ Intelligent editing with AI assistance
✓ Export professional Word document
✓ Multi-document dashboard showing parallel work

### Demo Must NOT:
✗ Crash or error
✗ Take >10 seconds for any AI operation
✗ Look unpolished or buggy
✗ Confuse the viewer

---

## Resources

### Documentation
- TenderCreator docs: https://docs.tendercreator.ai/
- Gemini API: https://ai.google.dev/gemini-api/docs
- Supabase docs: https://supabase.com/docs
- shadcn/ui: https://ui.shadcn.com/
- TipTap: https://tiptap.dev/

### Repository
- Current location: `/Users/varunprasad/code/prjs/tendercreator/tendercreator/`
- Build on existing Next.js 14 project
- Research: `/ai_docs/`
- PRD: `/ai_docs/PRD.md`

---

## For Future AI Sessions

**When resuming this project:**

1. **Read this file first** (CONTEXT.md)
2. **Review PRD** (`/ai_docs/PRD.md`)
3. **Check current phase** (ask user which phase we're on)
4. **Review existing code** (what's been built)
5. **Continue from there**

**Key Principles:**
- **Scope discipline** - MVP only, no feature creep
- **Match TenderCreator UI** - reference docs.tendercreator.ai
- **Gemini 2.5 Flash everywhere** - no other models
- **Simple context strategy** - dump all, no RAG
- **Demo quality** - functional > perfect

**Communication Style:**
- User prefers concise (sacrifices grammar for brevity)
- Focus on execution, not over-planning
- Ask critical questions, don't assume
- Acknowledge decisions clearly before building

---

**Project start date:** 2025-11-04
**Target completion:** 3-4 weeks
**Current phase:** Planning complete, ready for Phase 1 implementation

**Ready to build.**

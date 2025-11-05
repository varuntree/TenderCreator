-- =============================================================================
-- Tender Creator - Database Schema
-- =============================================================================
-- Version: 1.0
-- Purpose: Complete database schema for multi-document tender response platform
-- Note: This is the definitive schema. All phases must follow this structure.
-- =============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- ORGANIZATIONS
-- =============================================================================

CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    settings JSONB NOT NULL DEFAULT '{
        "ai_model": "gemini-2.0-flash-exp",
        "default_tone": "professional"
    }'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_organizations_created_at ON organizations(created_at);

COMMENT ON TABLE organizations IS 'Top-level organization workspaces';
COMMENT ON COLUMN organizations.settings IS 'AI model, tone, and other org-wide preferences';

-- =============================================================================
-- USERS
-- =============================================================================

CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('admin', 'writer', 'reader')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_users_organization_id ON users(organization_id);
CREATE INDEX idx_users_email ON users(email);

COMMENT ON TABLE users IS 'Application users linked to Supabase Auth';
COMMENT ON COLUMN users.role IS 'admin: full access, writer: create/edit, reader: view only';

-- =============================================================================
-- ORGANIZATION DOCUMENTS (Knowledge Base)
-- =============================================================================

CREATE TABLE organization_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    uploaded_by UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Metadata
    category TEXT,
    tags TEXT[] DEFAULT '{}',

    -- AI Processing
    content_extracted BOOLEAN DEFAULT FALSE,
    content_text TEXT,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_org_docs_organization_id ON organization_documents(organization_id);
CREATE INDEX idx_org_docs_uploaded_at ON organization_documents(uploaded_at DESC);
CREATE INDEX idx_org_docs_category ON organization_documents(category);

COMMENT ON TABLE organization_documents IS 'Company knowledge base: capability statements, case studies, certifications';
COMMENT ON COLUMN organization_documents.content_text IS 'Extracted text from file via Gemini API';

-- =============================================================================
-- PROJECTS
-- =============================================================================

CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

    -- Project Details
    name TEXT NOT NULL,
    client_name TEXT,
    deadline TIMESTAMP WITH TIME ZONE,
    status TEXT NOT NULL DEFAULT 'setup' CHECK (status IN ('setup', 'analysis', 'in_progress', 'completed')),

    -- User Instructions
    instructions TEXT,

    -- Audit
    created_by UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_projects_organization_id ON projects(organization_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_created_at ON projects(created_at DESC);

COMMENT ON TABLE projects IS 'Tender response projects';
COMMENT ON COLUMN projects.instructions IS 'Optional user guidance for AI generation';

-- =============================================================================
-- PROJECT DOCUMENTS (RFT Files)
-- =============================================================================

CREATE TABLE project_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    is_primary_rft BOOLEAN DEFAULT FALSE,
    uploaded_by UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- AI Processing
    content_extracted BOOLEAN DEFAULT FALSE,
    content_text TEXT,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_project_docs_project_id ON project_documents(project_id);
CREATE INDEX idx_project_docs_uploaded_at ON project_documents(uploaded_at DESC);
CREATE INDEX idx_project_docs_is_primary ON project_documents(is_primary_rft);

COMMENT ON TABLE project_documents IS 'RFT documents and addendums for specific project';
COMMENT ON COLUMN project_documents.content_text IS 'Extracted text from file via Gemini API';

-- =============================================================================
-- WORK PACKAGES
-- =============================================================================

CREATE TABLE work_packages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,

    -- Document Definition
    document_type TEXT NOT NULL,
    document_description TEXT,

    -- Requirements (array of objects)
    requirements JSONB NOT NULL DEFAULT '[]'::jsonb,

    -- Assignment (UI only for MVP)
    assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed')),

    -- Order/Priority
    "order" INTEGER NOT NULL DEFAULT 0,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_work_packages_project_id ON work_packages(project_id);
CREATE INDEX idx_work_packages_status ON work_packages(status);
CREATE INDEX idx_work_packages_assigned_to ON work_packages(assigned_to);
CREATE INDEX idx_work_packages_order ON work_packages("order");

COMMENT ON TABLE work_packages IS 'Individual submission documents to be created';
COMMENT ON COLUMN work_packages.requirements IS 'Array of requirement objects: [{id, text, priority, source}]';
COMMENT ON COLUMN work_packages."order" IS 'Display order in project dashboard';

-- =============================================================================
-- WORK PACKAGE CONTENT
-- =============================================================================

CREATE TABLE work_package_content (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    work_package_id UUID NOT NULL REFERENCES work_packages(id) ON DELETE CASCADE,

    -- Strategy Phase
    win_themes TEXT[] DEFAULT '{}',
    key_messages TEXT[] DEFAULT '{}',

    -- Generated Content
    content TEXT,
    content_version INTEGER DEFAULT 1,

    -- Export
    exported_file_path TEXT,
    exported_at TIMESTAMP WITH TIME ZONE,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_wp_content_work_package_id ON work_package_content(work_package_id);
CREATE INDEX idx_wp_content_exported_at ON work_package_content(exported_at);

COMMENT ON TABLE work_package_content IS 'Generated content and exports for each work package';
COMMENT ON COLUMN work_package_content.content IS 'Generated document content (HTML or Markdown)';
COMMENT ON COLUMN work_package_content.content_version IS 'Version tracking for regeneration';

-- =============================================================================
-- AI INTERACTIONS (Logging)
-- =============================================================================

CREATE TABLE ai_interactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    work_package_id UUID REFERENCES work_packages(id) ON DELETE CASCADE,

    -- Interaction Details
    type TEXT NOT NULL CHECK (type IN ('analysis', 'generation', 'editing', 'strategy', 'extraction')),
    prompt TEXT NOT NULL,
    response TEXT NOT NULL,

    -- Context Used
    context_tokens INTEGER,
    model TEXT NOT NULL DEFAULT 'gemini-2.0-flash-exp',

    -- Error tracking
    error BOOLEAN DEFAULT FALSE,
    error_message TEXT,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_ai_interactions_project_id ON ai_interactions(project_id);
CREATE INDEX idx_ai_interactions_work_package_id ON ai_interactions(work_package_id);
CREATE INDEX idx_ai_interactions_type ON ai_interactions(type);
CREATE INDEX idx_ai_interactions_created_at ON ai_interactions(created_at DESC);

COMMENT ON TABLE ai_interactions IS 'Audit log for all AI API calls';
COMMENT ON COLUMN ai_interactions.type IS 'analysis: RFT analysis, generation: content gen, editing: AI assist, strategy: win themes, extraction: text extraction';

-- =============================================================================
-- TRIGGERS (Auto-update updated_at)
-- =============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_projects_updated_at
    BEFORE UPDATE ON projects
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_work_packages_updated_at
    BEFORE UPDATE ON work_packages
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_wp_content_updated_at
    BEFORE UPDATE ON work_package_content
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================================================

-- Enable RLS on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_package_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_interactions ENABLE ROW LEVEL SECURITY;

-- Organizations: Users can only see their own organization
CREATE POLICY "Users can view their own organization"
    ON organizations FOR SELECT
    USING (id IN (SELECT organization_id FROM users WHERE id = auth.uid()));

-- Users: Can view users in their organization
CREATE POLICY "Users can view users in their organization"
    ON users FOR SELECT
    USING (organization_id IN (SELECT organization_id FROM users WHERE id = auth.uid()));

-- Organization Documents: Can view/create/update/delete docs in their org
CREATE POLICY "Users can manage org documents in their organization"
    ON organization_documents FOR ALL
    USING (organization_id IN (SELECT organization_id FROM users WHERE id = auth.uid()));

-- Projects: Can manage projects in their organization
CREATE POLICY "Users can manage projects in their organization"
    ON projects FOR ALL
    USING (organization_id IN (SELECT organization_id FROM users WHERE id = auth.uid()));

-- Project Documents: Can manage documents in their org's projects
CREATE POLICY "Users can manage project documents in their organization"
    ON project_documents FOR ALL
    USING (project_id IN (
        SELECT id FROM projects WHERE organization_id IN (
            SELECT organization_id FROM users WHERE id = auth.uid()
        )
    ));

-- Work Packages: Can manage work packages in their org's projects
CREATE POLICY "Users can manage work packages in their organization"
    ON work_packages FOR ALL
    USING (project_id IN (
        SELECT id FROM projects WHERE organization_id IN (
            SELECT organization_id FROM users WHERE id = auth.uid()
        )
    ));

-- Work Package Content: Can manage content in their org's work packages
CREATE POLICY "Users can manage work package content in their organization"
    ON work_package_content FOR ALL
    USING (work_package_id IN (
        SELECT id FROM work_packages WHERE project_id IN (
            SELECT id FROM projects WHERE organization_id IN (
                SELECT organization_id FROM users WHERE id = auth.uid()
            )
        )
    ));

-- AI Interactions: Can view AI interactions in their org's projects
CREATE POLICY "Users can view AI interactions in their organization"
    ON ai_interactions FOR SELECT
    USING (project_id IN (
        SELECT id FROM projects WHERE organization_id IN (
            SELECT organization_id FROM users WHERE id = auth.uid()
        )
    ));

-- =============================================================================
-- SAMPLE JSONB STRUCTURES (for reference, not executed)
-- =============================================================================

/*
-- organizations.settings example:
{
    "ai_model": "gemini-2.0-flash-exp",
    "default_tone": "professional"
}

-- work_packages.requirements example:
[
    {
        "id": "req_1",
        "text": "Must describe cloud architecture approach",
        "priority": "mandatory",
        "source": "Section 3.2, Page 12"
    },
    {
        "id": "req_2",
        "text": "Include risk mitigation strategies",
        "priority": "optional",
        "source": "Section 5.1, Page 24"
    }
]
*/

-- =============================================================================
-- END OF SCHEMA
-- =============================================================================

-- Phase 1: Core Schema
-- All tables for organizations, users, documents, projects, work packages

-- Organizations table
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  settings JSONB DEFAULT '{}'::jsonb
);

-- Users table
CREATE TYPE user_role AS ENUM ('admin', 'writer', 'reader');

CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'writer',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Organization documents table
CREATE TABLE organization_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  uploaded_by UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  category TEXT,
  tags TEXT[] DEFAULT '{}',
  content_extracted BOOLEAN NOT NULL DEFAULT false,
  content_text TEXT
);

-- Projects table
CREATE TYPE project_status AS ENUM ('draft', 'active', 'completed', 'archived');

CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  client_name TEXT,
  deadline TIMESTAMPTZ,
  status project_status NOT NULL DEFAULT 'draft',
  instructions TEXT,
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Project documents table
CREATE TABLE project_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  is_primary_rft BOOLEAN NOT NULL DEFAULT false,
  uploaded_by UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  content_extracted BOOLEAN NOT NULL DEFAULT false,
  content_text TEXT
);

-- Work packages table (Phase 2+)
CREATE TYPE work_package_status AS ENUM ('pending', 'in_progress', 'review', 'completed');

CREATE TABLE work_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL,
  document_description TEXT,
  requirements JSONB DEFAULT '{}'::jsonb,
  assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
  status work_package_status NOT NULL DEFAULT 'pending',
  "order" INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Work package content table (Phase 4+)
CREATE TABLE work_package_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  work_package_id UUID NOT NULL REFERENCES work_packages(id) ON DELETE CASCADE,
  win_themes TEXT[] DEFAULT '{}',
  key_messages TEXT[] DEFAULT '{}',
  content TEXT,
  content_version INTEGER NOT NULL DEFAULT 1,
  exported_file_path TEXT,
  exported_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- AI interactions table (Phase 2+)
CREATE TYPE ai_interaction_type AS ENUM ('analysis', 'decomposition', 'generation', 'refinement');

CREATE TABLE ai_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  work_package_id UUID REFERENCES work_packages(id) ON DELETE CASCADE,
  type ai_interaction_type NOT NULL,
  prompt TEXT NOT NULL,
  response TEXT,
  context_tokens INTEGER,
  model TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for common queries
CREATE INDEX idx_users_org ON users(organization_id);
CREATE INDEX idx_org_docs_org ON organization_documents(organization_id);
CREATE INDEX idx_projects_org ON projects(organization_id);
CREATE INDEX idx_project_docs_project ON project_documents(project_id);
CREATE INDEX idx_work_packages_project ON work_packages(project_id);
CREATE INDEX idx_work_package_content_wp ON work_package_content(work_package_id);
CREATE INDEX idx_ai_interactions_project ON ai_interactions(project_id);
CREATE INDEX idx_ai_interactions_wp ON ai_interactions(work_package_id);

-- Add updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_work_packages_updated_at
  BEFORE UPDATE ON work_packages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_work_package_content_updated_at
  BEFORE UPDATE ON work_package_content
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

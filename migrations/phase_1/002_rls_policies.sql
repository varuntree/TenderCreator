-- Phase 1: Row Level Security Policies
-- Multi-tenant isolation by organization_id

-- Enable RLS on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_package_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_interactions ENABLE ROW LEVEL SECURITY;

-- Helper function to get user's organization
CREATE OR REPLACE FUNCTION auth.user_organization_id()
RETURNS UUID AS $$
  SELECT organization_id FROM users WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

-- Helper function to get user's role
CREATE OR REPLACE FUNCTION auth.user_role()
RETURNS user_role AS $$
  SELECT role FROM users WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

-- Organizations: users can only see their own org
CREATE POLICY "Users can view their own organization"
  ON organizations FOR SELECT
  USING (id = auth.user_organization_id());

CREATE POLICY "Admins can update their organization"
  ON organizations FOR UPDATE
  USING (id = auth.user_organization_id() AND auth.user_role() = 'admin');

-- Users: can view users in same org
CREATE POLICY "Users can view users in their organization"
  ON users FOR SELECT
  USING (organization_id = auth.user_organization_id());

CREATE POLICY "Users can insert themselves on signup"
  ON users FOR INSERT
  WITH CHECK (id = auth.uid());

CREATE POLICY "Admins can update users in their org"
  ON users FOR UPDATE
  USING (organization_id = auth.user_organization_id() AND auth.user_role() = 'admin');

-- Organization documents: org isolation
CREATE POLICY "Users can view org documents in their organization"
  ON organization_documents FOR SELECT
  USING (organization_id = auth.user_organization_id());

CREATE POLICY "Writers can create org documents"
  ON organization_documents FOR INSERT
  WITH CHECK (
    organization_id = auth.user_organization_id() AND
    auth.user_role() IN ('writer', 'admin')
  );

CREATE POLICY "Admins can delete org documents"
  ON organization_documents FOR DELETE
  USING (
    organization_id = auth.user_organization_id() AND
    auth.user_role() = 'admin'
  );

-- Projects: org isolation
CREATE POLICY "Users can view projects in their organization"
  ON projects FOR SELECT
  USING (organization_id = auth.user_organization_id());

CREATE POLICY "Writers can create projects"
  ON projects FOR INSERT
  WITH CHECK (
    organization_id = auth.user_organization_id() AND
    auth.user_role() IN ('writer', 'admin')
  );

CREATE POLICY "Writers can update projects"
  ON projects FOR UPDATE
  USING (
    organization_id = auth.user_organization_id() AND
    auth.user_role() IN ('writer', 'admin')
  );

CREATE POLICY "Admins can delete projects"
  ON projects FOR DELETE
  USING (
    organization_id = auth.user_organization_id() AND
    auth.user_role() = 'admin'
  );

-- Project documents: org isolation via project FK
CREATE POLICY "Users can view project documents in their org"
  ON project_documents FOR SELECT
  USING (
    project_id IN (
      SELECT id FROM projects WHERE organization_id = auth.user_organization_id()
    )
  );

CREATE POLICY "Writers can create project documents"
  ON project_documents FOR INSERT
  WITH CHECK (
    project_id IN (
      SELECT id FROM projects WHERE organization_id = auth.user_organization_id()
    ) AND
    auth.user_role() IN ('writer', 'admin')
  );

CREATE POLICY "Writers can update project documents"
  ON project_documents FOR UPDATE
  USING (
    project_id IN (
      SELECT id FROM projects WHERE organization_id = auth.user_organization_id()
    ) AND
    auth.user_role() IN ('writer', 'admin')
  );

CREATE POLICY "Admins can delete project documents"
  ON project_documents FOR DELETE
  USING (
    project_id IN (
      SELECT id FROM projects WHERE organization_id = auth.user_organization_id()
    ) AND
    auth.user_role() = 'admin'
  );

-- Work packages: org isolation via project FK
CREATE POLICY "Users can view work packages in their org"
  ON work_packages FOR SELECT
  USING (
    project_id IN (
      SELECT id FROM projects WHERE organization_id = auth.user_organization_id()
    )
  );

CREATE POLICY "Writers can create work packages"
  ON work_packages FOR INSERT
  WITH CHECK (
    project_id IN (
      SELECT id FROM projects WHERE organization_id = auth.user_organization_id()
    ) AND
    auth.user_role() IN ('writer', 'admin')
  );

CREATE POLICY "Writers can update work packages"
  ON work_packages FOR UPDATE
  USING (
    project_id IN (
      SELECT id FROM projects WHERE organization_id = auth.user_organization_id()
    ) AND
    auth.user_role() IN ('writer', 'admin')
  );

CREATE POLICY "Admins can delete work packages"
  ON work_packages FOR DELETE
  USING (
    project_id IN (
      SELECT id FROM projects WHERE organization_id = auth.user_organization_id()
    ) AND
    auth.user_role() = 'admin'
  );

-- Work package content: org isolation via work_package FK
CREATE POLICY "Users can view work package content in their org"
  ON work_package_content FOR SELECT
  USING (
    work_package_id IN (
      SELECT id FROM work_packages WHERE project_id IN (
        SELECT id FROM projects WHERE organization_id = auth.user_organization_id()
      )
    )
  );

CREATE POLICY "Writers can create work package content"
  ON work_package_content FOR INSERT
  WITH CHECK (
    work_package_id IN (
      SELECT id FROM work_packages WHERE project_id IN (
        SELECT id FROM projects WHERE organization_id = auth.user_organization_id()
      )
    ) AND
    auth.user_role() IN ('writer', 'admin')
  );

CREATE POLICY "Writers can update work package content"
  ON work_package_content FOR UPDATE
  USING (
    work_package_id IN (
      SELECT id FROM work_packages WHERE project_id IN (
        SELECT id FROM projects WHERE organization_id = auth.user_organization_id()
      )
    ) AND
    auth.user_role() IN ('writer', 'admin')
  );

-- AI interactions: org isolation via project FK
CREATE POLICY "Users can view AI interactions in their org"
  ON ai_interactions FOR SELECT
  USING (
    project_id IN (
      SELECT id FROM projects WHERE organization_id = auth.user_organization_id()
    )
  );

CREATE POLICY "Writers can create AI interactions"
  ON ai_interactions FOR INSERT
  WITH CHECK (
    project_id IN (
      SELECT id FROM projects WHERE organization_id = auth.user_organization_id()
    ) AND
    auth.user_role() IN ('writer', 'admin')
  );

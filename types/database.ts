export interface Project {
  id: string
  organization_id: string
  name: string
  client_name?: string
  deadline?: string
  status: 'draft' | 'active' | 'completed' | 'archived'
  instructions?: string
  created_by: string
  created_at: string
  updated_at: string
}

export interface Document {
  id: string
  name: string
  file_path: string
  file_type: string
  file_size: number
  uploaded_by: string
  uploaded_at: string
  content_extracted: boolean
  content_text?: string
}

export interface OrganizationDocument extends Document {
  organization_id: string
  category?: string
  tags?: string[]
}

export interface ProjectDocument extends Document {
  project_id: string
  is_primary_rft: boolean
}

export interface User {
  id: string
  email: string
  name?: string
}

-- Phase 1: Supabase Storage Buckets
-- Create bucket for document uploads

-- Create documents bucket (run via Supabase dashboard or API)
-- This SQL is for reference; actual bucket creation via Supabase dashboard Storage section

-- Storage bucket: documents
-- Configuration:
--   - Name: documents
--   - Public: false (private, requires authentication)
--   - File size limit: 50MB
--   - Allowed MIME types: application/pdf, application/vnd.openxmlformats-officedocument.wordprocessingml.document, text/plain

-- RLS policies for storage.objects (documents bucket)
-- Note: These policies apply to the storage.objects table

-- Allow authenticated users to upload to their org's folder
CREATE POLICY "Users can upload documents to their org folder"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'documents' AND
    auth.role() = 'authenticated' AND
    (storage.foldername(name))[1] IN (
      SELECT id::text FROM organizations WHERE id = auth.user_organization_id()
    )
  );

-- Allow users to view documents in their org's folder
CREATE POLICY "Users can view documents in their org folder"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'documents' AND
    auth.role() = 'authenticated' AND
    (storage.foldername(name))[1] IN (
      SELECT id::text FROM organizations WHERE id = auth.user_organization_id()
    )
  );

-- Allow admins to delete documents in their org's folder
CREATE POLICY "Admins can delete documents in their org folder"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'documents' AND
    auth.role() = 'authenticated' AND
    (storage.foldername(name))[1] IN (
      SELECT id::text FROM organizations WHERE id = auth.user_organization_id()
    ) AND
    auth.user_role() = 'admin'
  );

-- Instructions for manual bucket creation:
-- 1. Go to Supabase Dashboard > Storage
-- 2. Click "New bucket"
-- 3. Name: documents
-- 4. Public: OFF (private)
-- 5. File size limit: 52428800 (50MB)
-- 6. Allowed MIME types: application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain
-- 7. Click "Create bucket"
-- 8. Apply the RLS policies above via SQL Editor

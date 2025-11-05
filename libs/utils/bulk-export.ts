import JSZip from 'jszip'
import { convertMarkdownToDocx } from './export-docx'
import { WorkPackage } from '@/libs/repositories/work-packages'

export interface WorkPackageContent {
  id: string
  work_package_id: string
  content: string | null
  content_json: any
  created_at: string
  updated_at: string
}

export interface Project {
  id: string
  name: string
  organization_id: string
  created_by: string
}

/**
 * Generate filename for individual document in bulk export
 * Format: [DocumentType]_[ProjectName].docx
 */
export function generateDocumentFilename(
  workPackage: WorkPackage,
  project: Project
): string {
  const docType = workPackage.document_type.replace(/[^a-zA-Z0-9]/g, '_')
  const projectName = project.name.replace(/[^a-zA-Z0-9]/g, '_')
  return `${docType}_${projectName}.docx`
}

/**
 * Create ZIP file containing all completed work package documents
 *
 * @param workPackages - Array of completed work packages
 * @param contents - Array of work package contents (matched by work_package_id)
 * @param project - Project metadata for filenames
 * @returns Blob containing ZIP file
 */
export async function createBulkExportZip(
  workPackages: WorkPackage[],
  contents: WorkPackageContent[],
  project: Project
): Promise<Blob> {
  const zip = new JSZip()

  // Create map for quick content lookup
  const contentMap = new Map(
    contents.map(c => [c.work_package_id, c])
  )

  // Generate and add each document to ZIP
  for (const wp of workPackages) {
    const content = contentMap.get(wp.id)
    if (!content || !content.content) {
      console.warn(`[Bulk Export] No content for work package ${wp.id}, skipping`)
      continue
    }

    // Generate filename
    const filename = generateDocumentFilename(wp, project)

    // Convert markdown to Word document
    const docxBlob = await convertMarkdownToDocx(content.content, {
      title: wp.document_type,
      author: project.created_by,
      date: new Date()
    })

    // Convert Blob to ArrayBuffer for JSZip
    const arrayBuffer = await docxBlob.arrayBuffer()

    // Add to ZIP
    zip.file(filename, arrayBuffer)
  }

  // Generate ZIP blob
  const zipBlob = await zip.generateAsync({ type: 'blob' })
  return zipBlob
}

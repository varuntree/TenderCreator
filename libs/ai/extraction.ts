import { GoogleAIFileManager } from '@google/generative-ai/server'

import { model } from './client'

const fileManager = new GoogleAIFileManager(process.env.GEMINI_API_KEY!)

export async function extractTextFromFile(
  fileBuffer: Buffer,
  fileName: string,
  mimeType: string
): Promise<string> {
  try {
    // For text files, just read directly
    if (mimeType === 'text/plain') {
      return fileBuffer.toString('utf-8')
    }

    // For other file types, upload file to Gemini
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const uploadResult = await fileManager.uploadFile(fileBuffer as any, {
      mimeType,
      displayName: fileName,
    })

    try {
      // Extract text with prompt
      const result = await model.generateContent([
        {
          fileData: {
            mimeType: uploadResult.file.mimeType,
            fileUri: uploadResult.file.uri,
          },
        },
        {
          text: `Extract all text content from this document. Return only the plain text, preserving structure and paragraphs. Do not add any commentary or explanation.`,
        },
      ])

      const response = await result.response
      const text = response.text()

      return text
    } finally {
      // Always clean up uploaded file
      try {
        await fileManager.deleteFile(uploadResult.file.name)
      } catch (cleanupError) {
        console.error('Failed to delete uploaded file:', cleanupError)
      }
    }
  } catch (error) {
    console.error('Text extraction error:', error)
    return ''
  }
}

import { GoogleAIFileManager } from '@google/generative-ai/server'

import { model } from './client'

const fileManager = new GoogleAIFileManager(process.env.GEMINI_API_KEY!)

export async function extractTextFromFile(
  fileBuffer: Buffer,
  fileName: string,
  mimeType: string
): Promise<string> {
  try {
    // Upload file to Gemini
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const uploadResult = await fileManager.uploadFile(fileBuffer as any, {
      mimeType,
      displayName: fileName,
    })

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

    // Clean up uploaded file
    await fileManager.deleteFile(uploadResult.file.name)

    return text
  } catch (error) {
    console.error('Text extraction error:', error)
    return ''
  }
}

'use client'

import CharacterCount from '@tiptap/extension-character-count'
import Placeholder from '@tiptap/extension-placeholder'
import { Table } from '@tiptap/extension-table'
import { TableCell } from '@tiptap/extension-table-cell'
import { TableHeader } from '@tiptap/extension-table-header'
import { TableRow } from '@tiptap/extension-table-row'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import debounce from 'lodash/debounce'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'

import { EditorToolbar } from './editor-toolbar'

const HTML_DETECTION_REGEX = /<\/?[a-z][\s\S]*>/i

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

const applyInlineFormatting = (value: string) =>
  value
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/__(.+?)__/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/_(.+?)_/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code>$1</code>')

const parseTable = (lines: string[], startIndex: number): { html: string; endIndex: number } => {
  const tableLines: string[] = []
  let i = startIndex

  // Collect table lines
  while (i < lines.length && lines[i].trim().includes('|')) {
    tableLines.push(lines[i].trim())
    i++
    if (i < lines.length && !lines[i].trim()) break
  }

  if (tableLines.length < 2) {
    return { html: '', endIndex: startIndex }
  }

  // Parse header
  const headerCells = tableLines[0]
    .split('|')
    .map(cell => cell.trim())
    .filter(cell => cell)

  // Skip separator line (tableLines[1] with dashes)

  // Parse body rows
  const bodyRows = tableLines.slice(2).map(line =>
    line.split('|').map(cell => cell.trim()).filter(cell => cell)
  )

  // Build HTML
  let html = '<table><thead><tr>'
  headerCells.forEach(cell => {
    html += `<th>${applyInlineFormatting(escapeHtml(cell))}</th>`
  })
  html += '</tr></thead><tbody>'

  bodyRows.forEach(row => {
    html += '<tr>'
    row.forEach(cell => {
      html += `<td>${applyInlineFormatting(escapeHtml(cell))}</td>`
    })
    html += '</tr>'
  })

  html += '</tbody></table>'

  return { html, endIndex: i }
}

const convertMarkdownToHtml = (markdown: string) => {
  const lines = markdown.split(/\r?\n/)
  const html: string[] = []
  let listType: 'ul' | 'ol' | null = null

  const closeList = () => {
    if (listType) {
      html.push(`</${listType}>`)
      listType = null
    }
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const trimmed = line.trim()

    if (!trimmed) {
      closeList()
      continue
    }

    // Check for table
    if (trimmed.includes('|') && i + 1 < lines.length && lines[i + 1].includes('---')) {
      closeList()
      const { html: tableHtml, endIndex } = parseTable(lines, i)
      if (tableHtml) {
        html.push(tableHtml)
        i = endIndex - 1
        continue
      }
    }

    const headingMatch = trimmed.match(/^(#{1,3})\s+(.*)$/)
    if (headingMatch) {
      closeList()
      const level = Math.min(headingMatch[1].length, 3)
      const content = applyInlineFormatting(escapeHtml(headingMatch[2].trim()))
      html.push(`<h${level}>${content}</h${level}>`)
      continue
    }

    if (/^[-*+]\s+/.test(trimmed)) {
      if (listType !== 'ul') {
        closeList()
        listType = 'ul'
        html.push('<ul>')
      }
      const item = applyInlineFormatting(escapeHtml(trimmed.replace(/^[-*+]\s+/, '')))
      html.push(`<li>${item}</li>`)
      continue
    }

    if (/^\d+\.\s+/.test(trimmed)) {
      if (listType !== 'ol') {
        closeList()
        listType = 'ol'
        html.push('<ol>')
      }
      const item = applyInlineFormatting(escapeHtml(trimmed.replace(/^\d+\.\s+/, '')))
      html.push(`<li>${item}</li>`)
      continue
    }

    closeList()
    const paragraph = applyInlineFormatting(escapeHtml(trimmed))
    html.push(`<p>${paragraph}</p>`)
  }

  closeList()

  return html.join('\n')
}

const normalizeContent = (initialContent: string) => {
  const trimmed = initialContent.trim()
  if (!trimmed) {
    return ''
  }
  if (HTML_DETECTION_REGEX.test(trimmed)) {
    return trimmed
  }
  return convertMarkdownToHtml(trimmed)
}

interface ContentEditorProps {
  workPackageId: string
  initialContent: string
  onContentChange?: (content: string) => void
}

export function ContentEditor({ workPackageId, initialContent, onContentChange }: ContentEditorProps) {
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error'>('saved')
  const resolvedContent = useMemo(() => normalizeContent(initialContent || ''), [initialContent])

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Placeholder.configure({
        placeholder: 'Your generated content will appear here...',
      }),
      CharacterCount,
      Table.configure({
        resizable: false,
        HTMLAttributes: {
          class: 'border-collapse border border-gray-300',
        },
      }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: resolvedContent,
    editorProps: {
      attributes: {
        class:
          'prose prose-sm sm:prose lg:prose-lg dark:prose-invert prose-table:border-collapse prose-th:border prose-th:border-gray-300 prose-th:bg-gray-100 prose-th:p-2 prose-td:border prose-td:border-gray-300 prose-td:p-2 mx-auto h-full min-h-full overflow-y-auto px-4 py-4 focus:outline-none',
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      onContentChange?.(html)
      debouncedSave(html)
    },
  })

  const debouncedSave = useMemo(
    () =>
      debounce(async (content: string) => {
        setSaveStatus('saving')
        try {
          const res = await fetch(`/api/work-packages/${workPackageId}/content`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content }),
          })
          if (res.ok) {
            setSaveStatus('saved')
          } else {
            setSaveStatus('error')
            toast.error('Failed to save changes')
          }
        } catch {
          setSaveStatus('error')
          toast.error('Failed to save changes')
        }
      }, 500),
    [workPackageId]
  )

  useEffect(() => {
    if (editor && resolvedContent && editor.getHTML() !== resolvedContent) {
      editor.commands.setContent(resolvedContent, { emitUpdate: false })
    }
  }, [editor, resolvedContent])

  useEffect(() => {
    return () => {
      debouncedSave.cancel()
    }
  }, [debouncedSave])

  if (!editor) {
    return null
  }

  const wordCount = editor.storage.characterCount.words()

  return (
    <div className="flex flex-1 min-h-0 flex-col space-y-2">
      <div className="flex flex-shrink-0 items-center justify-between">
        <EditorToolbar editor={editor} />
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>{wordCount} words</span>
          {saveStatus === 'saving' && <span>Saving...</span>}
          {saveStatus === 'saved' && <span className="text-green-600 dark:text-green-400">Saved</span>}
          {saveStatus === 'error' && <span className="text-red-600 dark:text-red-400">Error</span>}
        </div>
      </div>
      <div className="flex flex-1 min-h-0 overflow-hidden rounded-lg border bg-background">
        <EditorContent editor={editor} className="h-full w-full" />
      </div>
    </div>
  )
}

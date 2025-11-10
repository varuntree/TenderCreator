'use client'

import type { OffsetOptions } from '@floating-ui/dom'
import type { BubbleMenuPluginProps } from '@tiptap/extension-bubble-menu'
import CharacterCount from '@tiptap/extension-character-count'
import Placeholder from '@tiptap/extension-placeholder'
import { Table } from '@tiptap/extension-table'
import { TableCell } from '@tiptap/extension-table-cell'
import { TableHeader } from '@tiptap/extension-table-header'
import { TableRow } from '@tiptap/extension-table-row'
import type { Editor as TiptapEditor } from '@tiptap/react'
import { EditorContent, useEditor } from '@tiptap/react'
import type { BubbleMenuProps } from '@tiptap/react/menus'
import { BubbleMenu } from '@tiptap/react/menus'
import StarterKit from '@tiptap/starter-kit'
import debounce from 'lodash/debounce'
import { Loader2, PenLine, SendHorizontal } from 'lucide-react'
import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/badge'
import { htmlToMarkdown } from '@/libs/utils/html-to-markdown'

import { EditorToolbar } from './editor-toolbar'
import { AiSelectionHighlight, getAiSelectionRange } from './extensions/ai-selection-highlight'

const HTML_DETECTION_REGEX = /<\/?[a-z][\s\S]*>/i
type BubbleShouldShowProps = Parameters<NonNullable<BubbleMenuProps['shouldShow']>>[0]

const unescapeMarkdown = (value: string) =>
  value
    // Remove markdown escape sequences (backslash before special chars)
    .replace(/\\([\\`*_{}[\]()#+\-.!$])/g, '$1')

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
  console.log('[parseTable] Called at line', startIndex, 'with:', lines[startIndex])
  const tableLines: string[] = []
  let i = startIndex

  // Collect table lines
  while (i < lines.length && lines[i].trim().includes('|')) {
    tableLines.push(lines[i].trim())
    i++
    if (i < lines.length && !lines[i].trim()) break
  }

  console.log('[parseTable] Collected', tableLines.length, 'table lines')
  if (tableLines.length < 2) {
    console.log('[parseTable] Not enough lines for table, returning empty')
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
    const unescaped = unescapeMarkdown(cell)
    html += `<th>${applyInlineFormatting(escapeHtml(unescaped))}</th>`
  })
  html += '</tr></thead><tbody>'

  bodyRows.forEach(row => {
    html += '<tr>'
    row.forEach(cell => {
      const unescaped = unescapeMarkdown(cell)
      html += `<td>${applyInlineFormatting(escapeHtml(unescaped))}</td>`
    })
    html += '</tr>'
  })

  html += '</tbody></table>'

  console.log('[parseTable] Generated table HTML:', html.substring(0, 100))
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

    // Check for table (GFM pipe table format)
    if (trimmed.includes('|') && i + 1 < lines.length) {
      const nextLine = lines[i + 1].trim()
      // Separator line must start with |, contain only |, -, :, and spaces, and end with |
      const isSeparatorLine = /^\|[\s\-:|]+\|$/.test(nextLine) && nextLine.includes('-')
      if (isSeparatorLine) {
        console.log('[convertMarkdownToHtml] Table detected at line', i)
        closeList()
        const { html: tableHtml, endIndex } = parseTable(lines, i)
        if (tableHtml) {
          console.log('[convertMarkdownToHtml] Table HTML added')
          html.push(tableHtml)
          i = endIndex - 1
          continue
        }
      }
    }

    const headingMatch = trimmed.match(/^(#{1,3})\s+(.*)$/)
    if (headingMatch) {
      closeList()
      const level = Math.min(headingMatch[1].length, 3)
      const unescaped = unescapeMarkdown(headingMatch[2].trim())
      const content = applyInlineFormatting(escapeHtml(unescaped))
      html.push(`<h${level}>${content}</h${level}>`)
      continue
    }

    if (/^[-*+]\s+/.test(trimmed)) {
      if (listType !== 'ul') {
        closeList()
        listType = 'ul'
        html.push('<ul>')
      }
      const unescaped = unescapeMarkdown(trimmed.replace(/^[-*+]\s+/, ''))
      const item = applyInlineFormatting(escapeHtml(unescaped))
      html.push(`<li>${item}</li>`)
      continue
    }

    if (/^\d+\.\s+/.test(trimmed)) {
      if (listType !== 'ol') {
        closeList()
        listType = 'ol'
        html.push('<ol>')
      }
      const unescaped = unescapeMarkdown(trimmed.replace(/^\d+\.\s+/, ''))
      const item = applyInlineFormatting(escapeHtml(unescaped))
      html.push(`<li>${item}</li>`)
      continue
    }

    closeList()
    const unescaped = unescapeMarkdown(trimmed)
    const paragraph = applyInlineFormatting(escapeHtml(unescaped))
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
  const [selectionText, setSelectionText] = useState('')
  const [aiInstruction, setAiInstruction] = useState('')
  const [aiErrorMessage, setAiErrorMessage] = useState<string | null>(null)
  const [isAiProcessing, setIsAiProcessing] = useState(false)
  const [isGeneratingContent, setIsGeneratingContent] = useState(false)
  const previousSelectionRef = useRef<string>('')
  const instructionFormRef = useRef<HTMLFormElement | null>(null)
  const streamingContentRef = useRef('')
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
      AiSelectionHighlight,
    ],
    content: resolvedContent,
    editorProps: {
      attributes: {
        class:
          'prose prose-sm sm:prose lg:prose-lg dark:prose-invert prose-table:border-collapse prose-th:border prose-th:border-gray-300 prose-th:bg-gray-100 prose-th:p-2 prose-td:border prose-td:border-gray-300 prose-td:p-2 mx-auto h-full min-h-full overflow-y-auto px-3 py-3 focus:outline-none',
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      // Convert HTML back to markdown for storage
      const markdown = htmlToMarkdown(html)
      onContentChange?.(markdown)
      debouncedSave(markdown)
    },
  })

  useEffect(() => {
    if (!editor) {
      return
    }

    const handleSelectionUpdate = ({ editor: instance }: { editor: TiptapEditor }) => {
      const { from, to } = instance.state.selection
      const isCollapsed = from === to

      if (isCollapsed) {
        const focusInsideInstruction =
          instructionFormRef.current?.contains(document.activeElement) ?? false
        const persisted = getAiSelectionRange(instance.state)
        if (focusInsideInstruction && persisted && persisted.to > persisted.from) {
          return
        }

        setSelectionText('')
        instance.commands.clearAiSelectionHighlight()
        return
      }

      const text = instance.state.doc.textBetween(from, to, '\n').trim()

      if (text) {
        setSelectionText(text)
        instance.commands.setAiSelectionHighlight(from, to)
      } else {
        setSelectionText('')
        instance.commands.clearAiSelectionHighlight()
      }
    }

    editor.on('selectionUpdate', handleSelectionUpdate)

    return () => {
      editor.off('selectionUpdate', handleSelectionUpdate)
    }
  }, [editor])

  useEffect(() => {
    if (!selectionText) {
      previousSelectionRef.current = ''
      setAiInstruction('')
      setAiErrorMessage(null)
      editor?.commands.clearAiSelectionHighlight()
      return
    }

    if (previousSelectionRef.current !== selectionText) {
      previousSelectionRef.current = selectionText
      setAiInstruction('')
      setAiErrorMessage(null)
    }
  }, [selectionText, editor])


  const bubbleMenuShouldShow = useCallback(
    ({ state }: BubbleShouldShowProps) => {
      if (isAiProcessing) {
        return true
      }

      const { from, to } = state.selection
      if (from !== to) {
        const text = state.doc.textBetween(from, to, '\n').trim()
        return Boolean(text)
      }

      const persisted = getAiSelectionRange(state)
      return Boolean(persisted && persisted.to > persisted.from)
    },
    [isAiProcessing]
  )

  const bubbleMenuOptions: BubbleMenuPluginProps['options'] | undefined = useMemo(() => {
    if (!editor) {
      return undefined
    }

    const getReferenceClientRect = () => {
      const persisted = getAiSelectionRange(editor.state)
      const range =
        persisted && persisted.to > persisted.from
          ? persisted
          : editor.state.selection

      try {
        const start = editor.view.coordsAtPos(range.from)
        const end = editor.view.coordsAtPos(range.to)
        const top = Math.min(start.top, end.top)
        const bottom = Math.max(start.bottom, end.bottom)
        const left = Math.min(start.left, end.left)
        const right = Math.max(start.right, end.right)
        return new DOMRect(left, top, Math.max(right - left, 1), Math.max(bottom - top, 1))
      } catch {
        return editor.view.dom.getBoundingClientRect()
      }
    }

    const offsetOptions: OffsetOptions = { mainAxis: 16, crossAxis: 0 }

    return {
      placement: 'bottom-start',
      offset: offsetOptions,
      interactive: true,
      duration: 0,
      getReferenceClientRect,
    }
  }, [editor])

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

  // Listen for streaming content generation
  useEffect(() => {
    if (!editor || initialContent) return // Only stream if no initial content

    const controller = new AbortController()
    const decoder = new TextDecoder()
    let buffer = ''
    let isStreamActive = true

    const processEvent = (rawEvent: string) => {
      const trimmed = rawEvent.trim()
      if (!trimmed) return

      const lines = trimmed.split('\n')
      let eventType = 'message'
      const dataLines: string[] = []

      for (const line of lines) {
        if (line.startsWith('event:')) {
          eventType = line.slice(6).trim() || 'message'
        } else if (line.startsWith('data:')) {
          dataLines.push(line.slice(5).trim())
        }
      }

      const dataString = dataLines.join('\n')
      if (!dataString) {
        return
      }

      try {
        const payload = JSON.parse(dataString)
        if (eventType === 'chunk') {
          const chunk = payload.text || ''
          if (chunk) {
            streamingContentRef.current += chunk
            const html = convertMarkdownToHtml(streamingContentRef.current)
            if (html) {
              editor.commands.setContent(html, { emitUpdate: false })
            }
          }
        } else if (eventType === 'done') {
          const fullContent = payload.fullContent || streamingContentRef.current
          if (fullContent) {
            const html = convertMarkdownToHtml(fullContent)
            editor.commands.setContent(html)
          }
          toast.success('Content generated successfully')
          setIsGeneratingContent(false)
          streamingContentRef.current = ''
          isStreamActive = false
        } else if (eventType === 'error') {
          console.error('[Streaming] Server error:', payload.error)
          toast.error(payload.error || 'Streaming failed')
          setIsGeneratingContent(false)
          streamingContentRef.current = ''
          isStreamActive = false
        }
      } catch (error) {
        console.error('[Streaming] Failed to parse event payload:', error)
      }
    }

    const processBuffer = () => {
      let boundary = buffer.indexOf('\n\n')
      while (boundary !== -1) {
        const rawEvent = buffer.slice(0, boundary)
        buffer = buffer.slice(boundary + 2)
        processEvent(rawEvent)
        boundary = buffer.indexOf('\n\n')
      }
    }

    const streamContent = async () => {
      try {
        setIsGeneratingContent(true)
        streamingContentRef.current = ''
        const response = await fetch(`/api/work-packages/${workPackageId}/generate-content`, {
          method: 'POST',
          headers: { Accept: 'text/event-stream' },
          signal: controller.signal,
        })

        if (!response.ok || !response.body) {
          throw new Error('Failed to start content stream')
        }

        const reader = response.body.getReader()

        while (isStreamActive) {
          const { value, done } = await reader.read()
          if (done) {
            break
          }

          buffer += decoder.decode(value, { stream: true })
          processBuffer()
        }
      } catch (error) {
        if ((error as DOMException).name === 'AbortError') {
          return
        }
        console.error('[Streaming] Connection error', error)
        toast.error('Failed to stream generated content')
        setIsGeneratingContent(false)
        streamingContentRef.current = ''
      }
    }

    streamContent()

    return () => {
      isStreamActive = false
      controller.abort()
    }
  }, [editor, workPackageId, initialContent])

  useEffect(() => {
    return () => {
      debouncedSave.cancel()
    }
  }, [debouncedSave])

  const handleSelectionInstruction = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!editor) {
      return
    }

    const trimmedInstruction = aiInstruction.trim()
    if (!trimmedInstruction) {
      setAiErrorMessage('Enter a request for the AI.')
      return
    }

    const persistedRange = editor ? getAiSelectionRange(editor.state) : null
    const selectionRange = editor ? editor.state.selection : null
    const range = persistedRange && persistedRange.to > persistedRange.from ? persistedRange : selectionRange

    if (!range || range.to <= range.from) {
      setAiErrorMessage('Highlight the content you want to change.')
      return
    }
    const { from, to } = range

    const latestSelected = editor.state.doc.textBetween(from, to, '\n').trim()
    if (!latestSelected) {
      setAiErrorMessage('Selected content is empty. Highlight the text again.')
      return
    }

    // Re-apply the persisted highlight so the green selection stays visible while Gemini processes.
    editor.commands.setAiSelectionHighlight(from, to)

    setIsAiProcessing(true)
    setAiErrorMessage(null)

    try {
      const fullMarkdown = htmlToMarkdown(editor.getHTML())
      const response = await fetch(`/api/work-packages/${workPackageId}/selection-edit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          instruction: trimmedInstruction,
          selected_text: latestSelected,
          full_document: fullMarkdown,
        }),
      })

      const data = await response.json()
      if (!response.ok) {
        if (response.status === 429) {
          const retrySeconds = (data.retry_after_seconds as number | null) ?? null
          const friendlyMessage =
            typeof data.error === 'string'
              ? data.error
              : retrySeconds
              ? `Gemini rate limit reached. Please wait ${retrySeconds} seconds and try again.`
              : 'Gemini rate limit reached. Please try again shortly.'
          setAiErrorMessage(friendlyMessage)
          toast.warning(friendlyMessage)
          return
        }
        throw new Error((data && data.error) || 'Failed to apply AI changes.')
      }

      const modifiedText = (data.modified_text as string | undefined)?.trim()
      if (!modifiedText) {
        throw new Error('AI returned an empty response.')
      }

      editor
        .chain()
        .focus()
        .setTextSelection({ from, to })
        .insertContent(modifiedText)
        .run()

      setAiInstruction('')
      setSelectionText('')
      previousSelectionRef.current = ''
      editor.commands.clearAiSelectionHighlight()
      toast.success('Selection updated')
    } catch (error) {
      console.error('[Selection Edit]', error)
      const message = error instanceof Error ? error.message : 'Failed to apply AI changes.'
      setAiErrorMessage(message)
      toast.error('Failed to update selection')
    } finally {
      setIsAiProcessing(false)
    }
  }

  if (!editor) {
    return null
  }

  const wordCount = editor.storage.characterCount.words()

  return (
    <div className="flex flex-1 min-h-0 flex-col space-y-2">
      {isGeneratingContent && (
        <div className="flex items-center gap-2 p-3 bg-primary/10 text-primary rounded-lg border border-primary/20">
          <Loader2 className="size-3 animate-spin" />
          <span className="text-xs font-medium">Generating content... Content will appear below as it&apos;s generated.</span>
        </div>
      )}
      <div className="flex flex-shrink-0 items-center justify-between">
        <EditorToolbar editor={editor} />
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <Badge variant="secondary" className="h-5 text-xs">{wordCount} words</Badge>
          {saveStatus === 'saving' && <Badge variant="outline" className="h-5 text-xs">Saving...</Badge>}
          {saveStatus === 'saved' && <Badge variant="outline" className="h-5 text-xs text-green-600">Saved</Badge>}
          {saveStatus === 'error' && <Badge variant="destructive" className="h-5 text-xs">Error</Badge>}
        </div>
      </div>
      <div className="relative flex flex-1 min-h-0 overflow-hidden rounded-lg border bg-background">
        <BubbleMenu
          editor={editor}
          shouldShow={bubbleMenuShouldShow}
          appendTo={() => document.body}
          options={bubbleMenuOptions}
          className="pointer-events-auto z-[120] flex justify-center"
        >
          <form
            ref={instructionFormRef}
            onSubmit={handleSelectionInstruction}
            onPointerDownCapture={event => event.stopPropagation()}
            onKeyDownCapture={event => event.stopPropagation()}
            className="w-[520px] max-w-[min(520px,calc(100vw-64px))]"
          >
            <div className="flex items-center gap-3 rounded-[24px] border-2 border-[#10B981] bg-white px-4 py-3 shadow-[0_20px_32px_rgba(16,185,129,0.18)] dark:border-[#14A66F] dark:bg-slate-900 dark:shadow-[0_20px_36px_rgba(20,166,111,0.22)]">
              <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[#10B981]/10 text-[#047857] dark:bg-[#14A66F]/20 dark:text-[#6EE7B7]">
                <PenLine className="size-4" strokeWidth={2} />
              </span>
              <input
                className="flex-1 border-none bg-transparent text-sm font-medium leading-relaxed text-foreground outline-none placeholder:text-muted-foreground/70 disabled:opacity-70 dark:text-foreground"
                placeholder="Find me evidence for this statement"
                value={aiInstruction}
                onChange={event => {
                  setAiInstruction(event.target.value)
                  if (aiErrorMessage) {
                    setAiErrorMessage(null)
                  }
                }}
                disabled={isAiProcessing}
              />
              <button
                type="submit"
                className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[#10B981] text-white shadow-[0_14px_28px_rgba(16,185,129,0.35)] transition hover:bg-[#0EA371] disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none dark:bg-[#14A66F] dark:hover:bg-[#119360]"
                disabled={isAiProcessing || !aiInstruction.trim()}
                aria-label="Send instruction to AI"
              >
                {isAiProcessing ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <SendHorizontal className="size-4" />
                )}
              </button>
            </div>
            {aiErrorMessage ? (
              <p className="mt-2 text-xs font-medium text-red-500">{aiErrorMessage}</p>
            ) : null}
          </form>
        </BubbleMenu>
        <EditorContent editor={editor} className="h-full w-full" />
      </div>
    </div>
  )
}

import {
  AlignmentType,
  Document,
  HeadingLevel,
  LevelFormat,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  UnderlineType,
  WidthType,
} from 'docx'
import { marked, Tokens, TokensList } from 'marked'
import { saveAs } from 'file-saver'

export interface DocumentMetadata {
  title: string
  author?: string
  date?: Date
}

const DOCX_MIME_TYPE =
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
const ORDERED_LIST_REFERENCE = 'ordered-list'
const BULLET_LIST_REFERENCE = 'bullet-list'
const MAX_LIST_LEVEL = 4
const CODE_BLOCK_FONT = 'Courier New'
const LINK_COLOR = '0E4F9E'

const markedOptions: Partial<typeof marked.defaults> & {
  headerIds?: boolean
  mangle?: boolean
  smartLists?: boolean
} = {
  gfm: true,
  breaks: false,
  headerIds: false,
  mangle: false,
  smartLists: true,
}

marked.setOptions(markedOptions)

type UnderlineValue = (typeof UnderlineType)[keyof typeof UnderlineType]
type HeadingLevelValue = (typeof HeadingLevel)[keyof typeof HeadingLevel]
type AlignmentValue = (typeof AlignmentType)[keyof typeof AlignmentType]

type BlockNode = Paragraph | Table

interface InlineFormatting {
  bold?: boolean
  italics?: boolean
  strike?: boolean
  underline?: UnderlineValue
  color?: string
  font?: string
  size?: number
}

/**
 * Convert markdown (with GFM table support) into a properly structured DOCX Blob
 */
export async function convertMarkdownToDocx(
  markdown: string,
  metadata: DocumentMetadata
): Promise<Blob> {
  const normalized = normalizeMarkdown(markdown)
  const tokens = marked.lexer(normalized)
  const blocks = buildBlocks(tokens)

  const doc = new Document({
    creator: metadata.author,
    title: metadata.title,
    description: metadata.title,
    numbering: buildNumberingConfig(),
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 720,
              bottom: 720,
              left: 720,
              right: 720,
            },
          },
        },
        children: blocks.length ? blocks : [new Paragraph({ text: 'No content available.' })],
      },
    ],
  })

  const buffer = await Packer.toBuffer(doc)
  const arrayBuffer = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength) as ArrayBuffer
  const binary = new Uint8Array(arrayBuffer)
  return new Blob([binary], { type: DOCX_MIME_TYPE })
}

/**
 * Clean incoming markdown so the parser can operate consistently
 */
function normalizeMarkdown(content: string): string {
  if (!content) {
    return ''
  }
  return content.replace(/\r\n/g, '\n').trim()
}

/**
 * Build the DOCX block nodes (paragraphs, tables, etc.) from the markdown tokens
 */
function buildBlocks(tokens: TokensList): BlockNode[] {
  if (!tokens || tokens.length === 0) {
    return []
  }

  const blocks: BlockNode[] = []

  for (const token of tokens) {
    switch (token.type) {
      case 'space':
        blocks.push(new Paragraph({ text: '' }))
        break
      case 'heading': {
        const headingToken = token as Tokens.Heading
        blocks.push(
          new Paragraph({
            heading: getHeadingLevel(headingToken.depth),
            children: createInlineRuns(headingToken.tokens),
          })
        )
        break
      }
      case 'paragraph': {
        const paragraphToken = token as Tokens.Paragraph
        blocks.push(
          new Paragraph({
            children: createInlineRuns(paragraphToken.tokens),
          })
        )
        break
      }
      case 'list':
        blocks.push(...buildList(token as Tokens.List))
        break
      case 'blockquote':
        blocks.push(...buildBlockquote(token as Tokens.Blockquote))
        break
      case 'code':
        blocks.push(buildCodeBlock(token as Tokens.Code))
        break
      case 'table':
        blocks.push(buildTable(token as Tokens.Table))
        break
      case 'hr':
        blocks.push(
          new Paragraph({
            border: {
              bottom: { color: 'D1D5DB', size: 6, space: 4, style: 'single' },
            },
            spacing: { after: 120 },
          })
        )
        break
      case 'html': {
        const htmlToken = token as Tokens.HTML
        const sanitized = stripHtml(htmlToken.text)
        if (sanitized) {
          blocks.push(
            new Paragraph({
              children: [new TextRun({ text: sanitized })],
            })
          )
        }
        break
      }
      case 'text': {
        const textToken = token as Tokens.Text
        blocks.push(
          new Paragraph({
            children: createInlineRuns([textToken]),
          })
        )
        break
      }
      default:
        // Fallback to raw text when we do not have a dedicated handler
        const fallbackText = (token as Partial<Tokens.Text>).text || (token as any).raw
        if (fallbackText?.trim()) {
          blocks.push(
            new Paragraph({
              children: [new TextRun({ text: fallbackText })],
            })
          )
        }
    }
  }

  return blocks
}

/**
 * Build paragraphs for ordered/unordered lists (with nested levels)
 */
function buildList(token: Tokens.List, level = 0): Paragraph[] {
  const paragraphs: Paragraph[] = []
  const listLevel = Math.min(level, MAX_LIST_LEVEL)

  for (const item of token.items) {
    const inlineTokens = extractInlineTokens(item)
    const children = createInlineRuns(inlineTokens)
    const content = item.task
      ? [createTextRun(item.checked ? '☑ ' : '☐ ', {}), ...children]
      : children

    paragraphs.push(
      new Paragraph({
        children: content,
        numbering: {
          reference: token.ordered ? ORDERED_LIST_REFERENCE : BULLET_LIST_REFERENCE,
          level: listLevel,
        },
      })
    )

    if (item.tokens) {
      for (const childToken of item.tokens) {
        if (childToken.type === 'list') {
          paragraphs.push(...buildList(childToken as Tokens.List, listLevel + 1))
        }
      }
    }
  }

  return paragraphs
}

/**
 * Convert a blockquote into indented paragraphs
 */
function buildBlockquote(token: Tokens.Blockquote): Paragraph[] {
  if (!token.tokens || token.tokens.length === 0) {
    return [
      new Paragraph({
        children: [new TextRun(token.text)],
        indent: { left: 720 },
        border: { left: { color: 'CBD5F5', size: 12, space: 3, style: 'single' } },
        spacing: { before: 120, after: 120 },
      }),
    ]
  }

  const paragraphs: Paragraph[] = []
  for (const child of token.tokens) {
    if (child.type === 'paragraph' || child.type === 'text') {
      paragraphs.push(
        new Paragraph({
          children: createInlineRuns(child.type === 'paragraph' ? child.tokens : [child]),
          indent: { left: 720 },
          border: { left: { color: 'CBD5F5', size: 12, space: 3, style: 'single' } },
          spacing: { before: 60, after: 60 },
        })
      )
    } else if (child.type === 'list') {
      paragraphs.push(...buildList(child as Tokens.List))
    }
  }

  return paragraphs.length
    ? paragraphs
    : [
        new Paragraph({
          children: [new TextRun(stripHtml(token.text))],
          indent: { left: 720 },
          border: { left: { color: 'CBD5F5', size: 12, space: 3, style: 'single' } },
        }),
      ]
}

/**
 * Render fenced/indented code blocks with monospaced styling
 */
function buildCodeBlock(token: Tokens.Code): Paragraph {
  const lines = token.text.split('\n')
  const runs = lines.map((line, index) =>
    new TextRun({
      text: line || ' ',
      font: CODE_BLOCK_FONT,
      size: 20,
      break: index === 0 ? undefined : 1,
    })
  )

  return new Paragraph({
    children: runs,
    shading: {
      fill: 'F3F4F6',
    },
    border: {
      left: { color: 'D1D5DB', size: 12, space: 2, style: 'single' },
    },
    spacing: { before: 120, after: 120 },
  })
}

/**
 * Render GitHub-flavored markdown tables using DOCX table nodes
 */
function buildTable(token: Tokens.Table): Table {
  const headerRow = new TableRow({
    children: token.header.map((cell) => createTableCell(cell, true)),
  })

  const bodyRows = token.rows.map(
    (row) =>
      new TableRow({
        children: row.map((cell) => createTableCell(cell, false)),
      })
  )

  return new Table({
    width: {
      size: 100,
      type: WidthType.PERCENTAGE,
    },
    rows: [headerRow, ...bodyRows],
  })
}

function createTableCell(cell: Tokens.TableCell, isHeader: boolean): TableCell {
  const runs = createInlineRuns(cell.tokens?.length ? cell.tokens : [{ type: 'text', raw: cell.text, text: cell.text } as Tokens.Text])

  return new TableCell({
    children: [
      new Paragraph({
        children: runs,
        alignment: getTableAlignment(cell.align),
      }),
    ],
    shading: isHeader
      ? {
          fill: 'EEF2FF',
        }
      : undefined,
    margins: {
      top: 80,
      bottom: 80,
      left: 120,
      right: 120,
    },
  })
}

/**
 * Convert inline markdown tokens (bold, italic, links, etc.) to DOCX text runs
 */
function createInlineRuns(tokens?: Tokens.Generic[], formatting: InlineFormatting = {}): TextRun[] {
  if (!tokens || tokens.length === 0) {
    return [createTextRun('', formatting)]
  }

  const runs: TextRun[] = []

  for (const token of tokens) {
    switch (token.type) {
      case 'text':
      case 'escape':
        runs.push(createTextRun(token.text, formatting))
        break
      case 'strong':
        runs.push(...createInlineRuns(token.tokens, { ...formatting, bold: true }))
        break
      case 'em':
        runs.push(...createInlineRuns(token.tokens, { ...formatting, italics: true }))
        break
      case 'codespan':
        runs.push(
          createTextRun(token.text, {
            ...formatting,
            font: CODE_BLOCK_FONT,
            size: 22,
          })
        )
        break
      case 'del':
        runs.push(...createInlineRuns(token.tokens, { ...formatting, strike: true }))
        break
      case 'link':
        runs.push(
          ...createInlineRuns(token.tokens, {
            ...formatting,
            color: LINK_COLOR,
            underline: UnderlineType.SINGLE,
          })
        )
        break
      case 'br':
        runs.push(new TextRun({ break: 1 }))
        break
      case 'image':
        runs.push(createTextRun(`[${token.text}]`, { ...formatting, italics: true }))
        if (token.href) {
          runs.push(createTextRun(` (${token.href})`, { ...formatting, color: LINK_COLOR }))
        }
        break
      default:
        if ('tokens' in token && token.tokens) {
          runs.push(...createInlineRuns(token.tokens, formatting))
        } else if ('text' in token && token.text) {
          runs.push(createTextRun(token.text, formatting))
        }
    }
  }

  return runs.length ? runs : [createTextRun('', formatting)]
}

function createTextRun(text: string, formatting: InlineFormatting): TextRun {
  return new TextRun({
    text: text ?? '',
    bold: formatting.bold,
    italics: formatting.italics,
    strike: formatting.strike,
    color: formatting.color,
    size: formatting.size,
    font: formatting.font,
    underline: formatting.underline ? { type: formatting.underline } : undefined,
  })
}

/**
 * Extract inline tokens from a list item, skipping nested lists
 */
function extractInlineTokens(item: Tokens.ListItem): Tokens.Generic[] {
  if (!item.tokens || item.tokens.length === 0) {
    return [{ type: 'text', raw: item.raw, text: item.text } as Tokens.Text]
  }

  const inlineTokens: Tokens.Generic[] = []

  for (const token of item.tokens) {
    if (token.type === 'list') {
      continue
    }

    if (token.type === 'paragraph' || token.type === 'text') {
      inlineTokens.push(...(token.tokens?.length ? token.tokens : [token]))
    } else {
      inlineTokens.push(token)
    }
  }

  return inlineTokens.length ? inlineTokens : [{ type: 'text', raw: item.raw, text: item.text } as Tokens.Text]
}

function buildNumberingConfig() {
  return {
    config: [
      {
        reference: ORDERED_LIST_REFERENCE,
        levels: Array.from({ length: MAX_LIST_LEVEL + 1 }).map((_, level) => ({
          level,
          format: LevelFormat.DECIMAL,
          text: `%${level + 1}.`,
          alignment: AlignmentType.START,
        })),
      },
      {
        reference: BULLET_LIST_REFERENCE,
        levels: Array.from({ length: MAX_LIST_LEVEL + 1 }).map((_, level) => ({
          level,
          format: LevelFormat.BULLET,
          text: level === 0 ? '•' : level === 1 ? '◦' : '▪',
          alignment: AlignmentType.START,
        })),
      },
    ],
  }
}

function getHeadingLevel(depth: number): HeadingLevelValue {
  switch (depth) {
    case 1:
      return HeadingLevel.HEADING_1
    case 2:
      return HeadingLevel.HEADING_2
    case 3:
      return HeadingLevel.HEADING_3
    case 4:
      return HeadingLevel.HEADING_4
    case 5:
      return HeadingLevel.HEADING_5
    default:
      return HeadingLevel.HEADING_6
  }
}

function stripHtml(value: string): string {
  if (!value) {
    return ''
  }
  return value.replace(/<[^>]+>/g, '').trim()
}

function getTableAlignment(
  alignment: Tokens.TableCell['align']
): AlignmentValue {
  if (alignment === 'center') {
    return AlignmentType.CENTER
  }
  if (alignment === 'right') {
    return AlignmentType.RIGHT
  }
  return AlignmentType.LEFT
}

/**
 * Download docx file
 */
export function downloadDocx(blob: Blob, filename: string): void {
  saveAs(blob, filename)
}

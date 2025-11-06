'use client'

import { Editor } from '@tiptap/react'
import {
  Bold,
  Heading1,
  Heading2,
  Heading3,
  Italic,
  List,
  ListOrdered,
  Redo,
  RemoveFormatting,
  Table as TableIcon,
  Undo,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface EditorToolbarProps {
  editor: Editor
}

export function EditorToolbar({ editor }: EditorToolbarProps) {
  return (
    <div className="flex items-center gap-1 flex-wrap">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
      >
        <Undo className="size-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
      >
        <Redo className="size-4" />
      </Button>

      <div className="w-px h-6 bg-border mx-1" />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm">
            Heading
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>
            <Heading1 className="mr-2 size-4" />
            Heading 1
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
            <Heading2 className="mr-2 size-4" />
            Heading 2
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
            <Heading3 className="mr-2 size-4" />
            Heading 3
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => editor.chain().focus().setParagraph().run()}>
            Paragraph
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleBold().run()}
        data-active={editor.isActive('bold')}
        className="data-[active=true]:bg-muted"
      >
        <Bold className="size-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        data-active={editor.isActive('italic')}
        className="data-[active=true]:bg-muted"
      >
        <Italic className="size-4" />
      </Button>

      <div className="w-px h-6 bg-border mx-1" />

      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        data-active={editor.isActive('bulletList')}
        className="data-[active=true]:bg-muted"
      >
        <List className="size-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        data-active={editor.isActive('orderedList')}
        className="data-[active=true]:bg-muted"
      >
        <ListOrdered className="size-4" />
      </Button>

      <div className="w-px h-6 bg-border mx-1" />

      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
        title="Insert Table"
      >
        <TableIcon className="size-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().addRowAfter().run()}
        disabled={!editor.can().addRowAfter()}
        title="Add Row"
      >
        Row+
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().deleteRow().run()}
        disabled={!editor.can().deleteRow()}
        title="Delete Row"
      >
        Row-
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().addColumnAfter().run()}
        disabled={!editor.can().addColumnAfter()}
        title="Add Column"
      >
        Col+
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().deleteColumn().run()}
        disabled={!editor.can().deleteColumn()}
        title="Delete Column"
      >
        Col-
      </Button>

      <div className="w-px h-6 bg-border mx-1" />

      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
      >
        <RemoveFormatting className="size-4" />
      </Button>
    </div>
  )
}

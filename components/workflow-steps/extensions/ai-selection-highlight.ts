import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import { Decoration, DecorationSet } from '@tiptap/pm/view'

const pluginKey = new PluginKey('aiSelectionHighlight')

interface HighlightRange {
  from: number
  to: number
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    aiSelectionHighlight: {
      setAiSelectionHighlight: (from: number, to: number) => ReturnType
      clearAiSelectionHighlight: () => ReturnType
    }
  }
}

export const AiSelectionHighlight = Extension.create<{ className: string }>({
  name: 'aiSelectionHighlight',

  addOptions() {
    return {
      className: 'ai-selection-highlight',
    }
  },

  addCommands() {
    return {
      setAiSelectionHighlight:
        (from: number, to: number) =>
        ({ tr, dispatch, state }) => {
          if (dispatch) {
            const clampedFrom = Math.max(0, Math.min(from, state.doc.content.size))
            const clampedTo = Math.max(clampedFrom, Math.min(to, state.doc.content.size))
            dispatch(
              tr.setMeta(pluginKey, {
                type: 'set',
                range: { from: clampedFrom, to: clampedTo },
              })
            )
          }
          return true
        },
      clearAiSelectionHighlight:
        () =>
        ({ tr, dispatch }) => {
          if (dispatch) {
            dispatch(
              tr.setMeta(pluginKey, {
                type: 'clear',
              })
            )
          }
          return true
        },
    }
  },

  addProseMirrorPlugins() {
    const { className } = this.options

    return [
      new Plugin<HighlightRange | null>({
        key: pluginKey,
        state: {
          init: () => null,
          apply(tr, value) {
            const meta = tr.getMeta(pluginKey) as
              | { type: 'set'; range: HighlightRange }
              | { type: 'clear' }
              | undefined

            if (meta?.type === 'set') {
              return meta.range
            }

            if (meta?.type === 'clear') {
              return null
            }

            if (value && tr.docChanged) {
              const mappedFrom = tr.mapping.map(value.from)
              const mappedTo = tr.mapping.map(value.to)
              if (mappedFrom === mappedTo) {
                return null
              }
              return { from: mappedFrom, to: mappedTo }
            }

            if (!meta && tr.selectionSet) {
              return null
            }

            return value
          },
        },
        props: {
          decorations(state) {
            const range = pluginKey.getState(state) as HighlightRange | null
            if (!range) {
              return null
            }
            const { from, to } = range
            if (from === to) {
              return null
            }
            return DecorationSet.create(state.doc, [
              Decoration.inline(from, to, { class: className }),
            ])
          },
        },
      }),
    ]
  },
})

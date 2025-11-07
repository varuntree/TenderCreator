import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import { Decoration, DecorationSet } from '@tiptap/pm/view'

export const aiSelectionPluginKey = new PluginKey('aiSelectionHighlight')

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

export type AiSelectionRange = HighlightRange | null

export const AiSelectionHighlight = Extension.create<{ className: string }>({
  name: 'aiSelectionHighlight',

  addOptions() {
    return {
      className: 'ai-selection-highlight',
    }
  },

  addStorage() {
    return {
      range: null as AiSelectionRange,
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
              tr.setMeta(aiSelectionPluginKey, {
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
              tr.setMeta(aiSelectionPluginKey, {
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
    const storage = this.storage

    return [
      new Plugin<HighlightRange | null>({
        key: aiSelectionPluginKey,
        state: {
          init: () => null,
          apply(tr, value, _oldState, newState) {
            const meta = tr.getMeta(aiSelectionPluginKey) as
              | { type: 'set'; range: HighlightRange }
              | { type: 'clear' }
              | undefined

            if (meta?.type === 'set') {
              storage.range = meta.range
              return meta.range
            }

            if (meta?.type === 'clear') {
              storage.range = null
              return null
            }

            if (value && tr.docChanged) {
              const mappedFrom = tr.mapping.map(value.from)
              const mappedTo = tr.mapping.map(value.to)
              if (mappedFrom === mappedTo) {
                storage.range = null
                return null
              }
              const mappedRange = { from: mappedFrom, to: mappedTo }
              storage.range = mappedRange
              return mappedRange
            }

            storage.range =
              (aiSelectionPluginKey.getState(newState) as HighlightRange | null) ?? null
            return value
          },
        },
        props: {
          decorations(state) {
            const range = aiSelectionPluginKey.getState(state) as HighlightRange | null
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

type DecorationsFn = NonNullable<Plugin['props']['decorations']>

export const getAiSelectionRange = (state: Parameters<DecorationsFn>[0]) => {
  return (aiSelectionPluginKey.getState(state) as HighlightRange | null) ?? null
}

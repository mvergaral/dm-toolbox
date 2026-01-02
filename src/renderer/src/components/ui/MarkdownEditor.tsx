import MDEditor from '@uiw/react-md-editor'
import { useState } from 'react'

interface MarkdownEditorProps {
  value: string
  onChange: (value: string) => void
  label?: string
  placeholder?: string
  height?: number
  preview?: 'live' | 'edit' | 'preview'
}

export default function MarkdownEditor({
  value,
  onChange,
  label,
  height = 300,
  preview = 'live'
}: MarkdownEditorProps) {
  const [previewMode, setPreviewMode] = useState<'live' | 'edit' | 'preview'>(preview)

  return (
    <div>
      {label && <label className="block text-sm font-medium text-slate-300 mb-2">{label}</label>}

      <div data-color-mode="dark" className="markdown-editor-wrapper">
        <style>
          {`
            .markdown-editor-wrapper .w-md-editor {
              background-color: rgb(30, 41, 59) !important;
              border: 1px solid rgb(51, 65, 85) !important;
              color: white !important;
            }
            .markdown-editor-wrapper .w-md-editor-toolbar {
              background-color: rgb(30, 41, 59) !important;
              border-bottom: 1px solid rgb(51, 65, 85) !important;
              color: white !important;
            }
            .markdown-editor-wrapper .w-md-editor-toolbar li > button {
              color: white !important;
            }
            .markdown-editor-wrapper .w-md-editor-text-pre,
            .markdown-editor-wrapper .w-md-editor-text-input {
              background-color: rgb(30, 41, 59) !important;
              color: white !important;
              caret-color: white !important;
            }
            .markdown-editor-wrapper .w-md-editor-text-pre > code,
            .markdown-editor-wrapper .w-md-editor-text-input,
            .markdown-editor-wrapper textarea {
              color: white !important;
              -webkit-text-fill-color: white !important;
            }
            .markdown-editor-wrapper .w-md-editor-preview,
            .markdown-editor-wrapper .wmde-markdown {
              background-color: rgb(30, 41, 59) !important;
              color: white !important;
            }
            /* Ocultar el resaltado de espacios */
            .markdown-editor-wrapper .w-md-editor-text-pre .space {
              background-color: transparent !important;
            }
            .markdown-editor-wrapper .w-md-editor-preview .space {
              background-color: transparent !important;
            }
            /* Quitar fondo de headers y otros elementos de Markdown */
            .markdown-editor-wrapper .w-md-editor-text-pre > code > .token.title,
            .markdown-editor-wrapper .w-md-editor-text-pre > code > .token.title.important,
            .markdown-editor-wrapper .w-md-editor-text-pre > code > .token.header,
            .markdown-editor-wrapper .w-md-editor-text-pre > code > .token.bold,
            .markdown-editor-wrapper .w-md-editor-text-pre > code > .token.italic {
              background-color: transparent !important;
            }
            .markdown-editor-wrapper .w-md-editor-text-pre .token {
              background-color: transparent !important;
            }
          `}
        </style>
        <MDEditor
          value={value}
          onChange={(val) => onChange(val || '')}
          preview={previewMode}
          height={height}
          previewOptions={{
            className: 'prose prose-invert prose-sm max-w-none'
          }}
        />
      </div>

      {/* Botones de modo de vista */}
      <div className="flex gap-2 mt-2">
        <button
          type="button"
          onClick={() => setPreviewMode('edit')}
          className={`px-3 py-1 text-xs rounded transition-colors ${
            previewMode === 'edit'
              ? 'bg-indigo-600 text-white'
              : 'bg-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          Editar
        </button>
        <button
          type="button"
          onClick={() => setPreviewMode('live')}
          className={`px-3 py-1 text-xs rounded transition-colors ${
            previewMode === 'live'
              ? 'bg-indigo-600 text-white'
              : 'bg-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          Dividido
        </button>
        <button
          type="button"
          onClick={() => setPreviewMode('preview')}
          className={`px-3 py-1 text-xs rounded transition-colors ${
            previewMode === 'preview'
              ? 'bg-indigo-600 text-white'
              : 'bg-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          Vista Previa
        </button>
      </div>
    </div>
  )
}

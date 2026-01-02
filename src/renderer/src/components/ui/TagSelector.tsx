import { useState, useEffect } from 'react'
import { useDB } from '../../context/DbContext'
import { useTranslation } from 'react-i18next'
import { Plus, Check, Tag } from 'lucide-react'
import type { RxDocument } from 'rxdb'

interface GameSystemTag {
  id: string
  name: string
  color: string
  createdAt: number
}

interface TagSelectorProps {
  selectedTag?: string
  onTagSelect: (tagName: string, tagColor: string) => void
}

const PRESET_COLORS = [
  {
    name: 'indigo',
    value: 'indigo',
    bg: 'bg-indigo-500',
    text: 'text-indigo-400',
    border: 'border-indigo-500'
  },
  { name: 'red', value: 'red', bg: 'bg-red-500', text: 'text-red-400', border: 'border-red-500' },
  {
    name: 'green',
    value: 'green',
    bg: 'bg-green-500',
    text: 'text-green-400',
    border: 'border-green-500'
  },
  {
    name: 'blue',
    value: 'blue',
    bg: 'bg-blue-500',
    text: 'text-blue-400',
    border: 'border-blue-500'
  },
  {
    name: 'yellow',
    value: 'yellow',
    bg: 'bg-yellow-500',
    text: 'text-yellow-400',
    border: 'border-yellow-500'
  },
  {
    name: 'purple',
    value: 'purple',
    bg: 'bg-purple-500',
    text: 'text-purple-400',
    border: 'border-purple-500'
  },
  {
    name: 'pink',
    value: 'pink',
    bg: 'bg-pink-500',
    text: 'text-pink-400',
    border: 'border-pink-500'
  },
  {
    name: 'orange',
    value: 'orange',
    bg: 'bg-orange-500',
    text: 'text-orange-400',
    border: 'border-orange-500'
  }
]

export default function TagSelector({ selectedTag, onTagSelect }: TagSelectorProps) {
  const db = useDB()
  const { t } = useTranslation()
  const [tags, setTags] = useState<GameSystemTag[]>([])
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newTagName, setNewTagName] = useState('')
  const [newTagColor, setNewTagColor] = useState('indigo')
  const [selectedColor, setSelectedColor] = useState('indigo')

  useEffect(() => {
    const subscription = db.gameSystemTags
      .find()
      .$.subscribe((docs: RxDocument<GameSystemTag>[]) => {
        const tagList = docs.map((doc) => doc.toJSON()).sort((a, b) => a.name.localeCompare(b.name))
        setTags(tagList)

        // Si hay un tag seleccionado, obtener su color
        if (selectedTag) {
          const tag = tagList.find((t) => t.name === selectedTag)
          if (tag) {
            setSelectedColor(tag.color)
          }
        }
      })

    return () => subscription.unsubscribe()
  }, [db, selectedTag])

  const createTag = async () => {
    if (!newTagName.trim()) return

    try {
      const newTag = {
        id: `tag_${Date.now()}`,
        name: newTagName.trim(),
        color: newTagColor,
        createdAt: Date.now()
      }

      await db.gameSystemTags.insert(newTag)
      onTagSelect(newTag.name, newTag.color)

      setNewTagName('')
      setNewTagColor('indigo')
      setShowCreateForm(false)
    } catch (error) {
      console.error('Error creando tag:', error)
    }
  }

  const selectTag = (tag: GameSystemTag) => {
    onTagSelect(tag.name, tag.color)
    setSelectedColor(tag.color)
  }

  const getColorClasses = (color: string) => {
    const colorObj = PRESET_COLORS.find((c) => c.value === color)
    return colorObj || PRESET_COLORS[0]
  }

  return (
    <div>
      <label className="block text-sm font-medium text-slate-300 mb-2">
        {t('tagSelector.label')}
      </label>

      {/* Tags existentes */}
      <div className="flex flex-wrap gap-2 mb-3">
        {tags.map((tag) => {
          const colors = getColorClasses(tag.color)
          const isSelected = selectedTag === tag.name

          return (
            <button
              key={tag.id}
              type="button"
              onClick={() => selectTag(tag)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border-2 transition-all text-sm font-medium ${
                isSelected
                  ? `${colors.bg}/20 ${colors.border} ${colors.text}`
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'
              }`}
            >
              {isSelected && <Check size={14} />}
              {tag.name}
            </button>
          )
        })}

        {/* Botón para crear nuevo tag */}
        <button
          type="button"
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border-2 border-dashed border-slate-700 text-slate-500 hover:border-slate-600 hover:text-slate-400 transition-all text-sm font-medium"
        >
          <Plus size={14} />
          {t('tagSelector.new')}
        </button>
      </div>

      {/* Formulario para crear tag */}
      {showCreateForm && (
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 space-y-3">
          <div>
            <input
              type="text"
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              placeholder={t('tagSelector.placeholder')}
              autoFocus
              className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <p className="text-xs text-slate-400 mb-2">{t('tagSelector.colorLabel')}</p>
            <div className="flex flex-wrap gap-2">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => setNewTagColor(color.value)}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${color.bg} ${
                    newTagColor === color.value
                      ? 'border-white scale-110'
                      : 'border-slate-700 hover:scale-105'
                  }`}
                  title={t(`tagSelector.colors.${color.name}`)}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                setShowCreateForm(false)
                setNewTagName('')
                setNewTagColor('indigo')
              }}
              className="flex-1 bg-slate-700 hover:bg-slate-600 text-white px-3 py-2 rounded text-sm font-medium transition-colors"
            >
              {t('common.cancel')}
            </button>
            <button
              type="button"
              onClick={createTag}
              disabled={!newTagName.trim()}
              className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 disabled:text-slate-500 text-white px-3 py-2 rounded text-sm font-medium transition-colors disabled:cursor-not-allowed"
            >
              {t('tagSelector.createTag')}
            </button>
          </div>
        </div>
      )}

      {/* Tag seleccionado actual (input oculto para mantener compatibilidad) */}
      {selectedTag && !tags.find((t) => t.name === selectedTag) && (
        <div className="mt-2">
          <div
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border-2 ${getColorClasses(selectedColor).bg}/20 ${getColorClasses(selectedColor).border} ${getColorClasses(selectedColor).text} text-sm font-medium`}
          >
            <Tag size={14} />
            {selectedTag}
          </div>
        </div>
      )}
    </div>
  )
}

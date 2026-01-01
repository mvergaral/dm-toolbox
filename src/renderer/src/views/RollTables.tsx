import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Dices, Plus, Trash2, Edit2, Save, ArrowLeft, Search } from 'lucide-react'
import { useDB } from '../context/DbContext'
import { useToast } from '../context/ToastContext'
import { useConfirm } from '../context/ConfirmationContext'
import BackButton from '../components/ui/BackButton'
import TagSelector from '../components/ui/TagSelector'
import { useParams } from 'react-router-dom'

interface RollTable {
  id: string
  title: string
  description: string
  system: string
  createdAt: number
  rows: {
    id: string
    range: [number, number]
    result: string
  }[]
}

export default function RollTables() {
  const { t } = useTranslation()
  const db = useDB()
  const { addToast } = useToast()
  const { confirm } = useConfirm()
  const { id: campaignId } = useParams()

  const [tables, setTables] = useState<RollTable[]>([])
  const [systemTags, setSystemTags] = useState<string[]>([])
  const [selectedTable, setSelectedTable] = useState<RollTable | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [rollResult, setRollResult] = useState<{ result: string; roll: number } | null>(null)
  const [campaignSystem, setCampaignSystem] = useState<string | null>(null)
  const [activeSystemFilter, setActiveSystemFilter] = useState<string>('All')

  // Form states
  const [formData, setFormData] = useState<Partial<RollTable>>({
    title: '',
    description: '',
    system: '',
    rows: []
  })

  // Load Campaign System if in campaign context
  useEffect(() => {
    if (campaignId && db) {
      db.campaigns.findOne(campaignId).exec().then((doc) => {
        if (doc) {
          setCampaignSystem(doc.system)
          setActiveSystemFilter(doc.system)
        }
      })
    } else {
      setCampaignSystem(null)
      setActiveSystemFilter('All')
    }
  }, [campaignId, db])

  useEffect(() => {
    if (!db) return
    const sub = db.rollTables.find({
      sort: [{ createdAt: 'desc' }]
    }).$.subscribe((docs) => {
      setTables(docs.map((d) => d.toJSON() as RollTable))
    })

    const tagsSub = db.gameSystemTags.find().$.subscribe((docs) => {
      setSystemTags(docs.map((d) => d.name))
    })

    return () => {
      sub.unsubscribe()
      tagsSub.unsubscribe()
    }
  }, [db])

  const handleCreate = () => {
    setFormData({
      title: '',
      description: '',
      system: campaignSystem || '',
      rows: [{ id: crypto.randomUUID(), range: [1, 20], result: '' }]
    })
    setSelectedTable(null)
    setIsEditing(true)
    setRollResult(null)
  }

  const handleEdit = (table: RollTable) => {
    setFormData(JSON.parse(JSON.stringify(table)))
    setSelectedTable(table)
    setIsEditing(true)
    setRollResult(null)
  }

  const handleSave = async () => {
    if (!db || !formData.title) return

    try {
      const dataToSave = {
        ...formData,
        updatedAt: Date.now()
      }

      if (selectedTable) {
        const doc = await db.rollTables.findOne(selectedTable.id).exec()
        if (doc) {
          await doc.patch(dataToSave)
          addToast(t('common.saveChanges'), 'success')
        }
      } else {
        await db.rollTables.insert({
          ...dataToSave,
          id: crypto.randomUUID(),
          createdAt: Date.now()
        })
        addToast(t('common.create'), 'success')
      }
      setIsEditing(false)
      setSelectedTable(null)
    } catch (error) {
      console.error(error)
      addToast('Error saving table', 'error')
    }
  }

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!db) return

    confirm({
      title: t('common.delete'),
      message: t('common.deleteConfirm'),
      confirmText: t('common.delete'),
      cancelText: t('common.cancel'),
      type: 'danger',
      onConfirm: async () => {
        try {
          const doc = await db.rollTables.findOne(id).exec()
          if (doc) await doc.remove()
          addToast(t('common.delete'), 'success')
          if (selectedTable?.id === id) {
            setSelectedTable(null)
            setIsEditing(false)
          }
        } catch (error) {
          console.error(error)
          addToast('Error deleting table', 'error')
        }
      }
    })
  }

  const handleRoll = () => {
    if (!selectedTable || selectedTable.rows.length === 0) return

    // Find max range
    let max = 0
    selectedTable.rows.forEach(row => {
      if (row.range[1] > max) max = row.range[1]
    })

    const roll = Math.floor(Math.random() * max) + 1
    const match = selectedTable.rows.find(row => roll >= row.range[0] && roll <= row.range[1])

    setRollResult({
      roll,
      result: match ? match.result : 'No result'
    })
  }

  const addRow = () => {
    const currentRows = formData.rows || []
    const lastRow = currentRows[currentRows.length - 1]
    const start = lastRow ? lastRow.range[1] + 1 : 1
    const end = start

    setFormData({
      ...formData,
      rows: [
        ...currentRows,
        { id: crypto.randomUUID(), range: [start, end], result: '' }
      ]
    })
  }

  const updateRow = (index: number, field: 'min' | 'max' | 'result', value: string | number) => {
    const newRows = [...(formData.rows || [])]
    if (field === 'min') newRows[index].range[0] = Number(value)
    if (field === 'max') newRows[index].range[1] = Number(value)
    if (field === 'result') newRows[index].result = String(value)
    setFormData({ ...formData, rows: newRows })
  }

  const removeRow = (index: number) => {
    const newRows = [...(formData.rows || [])]
    newRows.splice(index, 1)
    setFormData({ ...formData, rows: newRows })
  }

  // Seed initial data if empty
  useEffect(() => {
    if (!db) return
    const checkAndSeed = async () => {
      const count = await db.rollTables.count().exec()
      if (count === 0) {
        // Seed D&D 5e Loot Table (Example)
        await db.rollTables.insert({
          id: crypto.randomUUID(),
          title: 'D&D 5e - Treasure Hoard: Challenge 0-4',
          description: 'Random loot for low level encounters',
          system: 'D&D 5e',
          createdAt: Date.now(),
          rows: [
            { id: crypto.randomUUID(), range: [1, 6], result: 'Nothing' },
            { id: crypto.randomUUID(), range: [7, 16], result: '2d6 (7) x 10 cp' },
            { id: crypto.randomUUID(), range: [17, 26], result: '4d6 (14) x 10 sp' },
            { id: crypto.randomUUID(), range: [27, 36], result: '2d6 (7) x 10 gp' },
            { id: crypto.randomUUID(), range: [37, 44], result: '1d6 (3) x 10 pp' },
            { id: crypto.randomUUID(), range: [45, 52], result: '2d6 (7) x 10 gp + 1d6 gems (10 gp each)' },
            { id: crypto.randomUUID(), range: [53, 60], result: '2d6 (7) x 10 gp + 2d4 art objects (25 gp each)' },
            { id: crypto.randomUUID(), range: [61, 65], result: '2d6 (7) x 10 gp + 1d4 magic items (Table A)' },
            { id: crypto.randomUUID(), range: [66, 70], result: '2d6 (7) x 10 gp + 1d6 magic items (Table B)' },
            { id: crypto.randomUUID(), range: [71, 75], result: '2d6 (7) x 10 gp + 1d6 magic items (Table C)' },
            { id: crypto.randomUUID(), range: [76, 80], result: '2d6 (7) x 10 gp + 1d6 magic items (Table F)' },
            { id: crypto.randomUUID(), range: [81, 85], result: '2d6 (7) x 10 gp + 1d6 magic items (Table G)' },
            { id: crypto.randomUUID(), range: [86, 90], result: '2d6 (7) x 10 gp + 1d4 magic items (Table H)' },
            { id: crypto.randomUUID(), range: [91, 95], result: '2d6 (7) x 10 gp + 1d4 magic items (Table I)' },
            { id: crypto.randomUUID(), range: [96, 100], result: '2d6 (7) x 10 gp + 1d4 magic items (Table J)' }
          ]
        })
      }
    }
    checkAndSeed()
  }, [db])

  // Get unique systems for tabs
  const systems = ['All', ...Array.from(new Set([...tables.map(t => t.system), ...systemTags])).sort()]

  const filteredTables = tables.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.system.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesSystem = activeSystemFilter === 'All' || t.system === activeSystemFilter

    return matchesSearch && matchesSystem
  })

  // Render Editor
  if (isEditing) {
    return (
      <div className="p-8 max-w-5xl mx-auto w-full h-full flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsEditing(false)}
              className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
            >
              <ArrowLeft size={20} className="text-slate-400" />
            </button>
            <h1 className="text-2xl font-bold text-white">
              {selectedTable ? t('common.edit') : t('common.create')} Table
            </h1>
          </div>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            <Save size={18} />
            {t('common.save')}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 overflow-hidden">
          {/* Metadata */}
          <div className="space-y-4">
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="e.g. Random Encounters"
                />
              </div>
              <div>
                <TagSelector
                  selectedTag={formData.system || ''}
                  onTagSelect={(tagName) => setFormData({ ...formData, system: tagName })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-indigo-500 outline-none h-24 resize-none"
                  placeholder="Optional description..."
                />
              </div>
            </div>
          </div>

          {/* Rows Editor */}
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl flex flex-col overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
              <h3 className="font-bold text-white">Table Rows</h3>
              <button
                onClick={addRow}
                className="text-sm text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
              >
                <Plus size={16} /> Add Row
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-2">
              {formData.rows?.map((row, index) => (
                <div key={row.id} className="flex items-center gap-2 group">
                  <div className="flex items-center gap-1 w-32">
                    <input
                      type="number"
                      value={row.range[0]}
                      onChange={(e) => updateRow(index, 'min', e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-center text-sm text-white"
                    />
                    <span className="text-slate-500">-</span>
                    <input
                      type="number"
                      value={row.range[1]}
                      onChange={(e) => updateRow(index, 'max', e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-center text-sm text-white"
                    />
                  </div>
                  <input
                    type="text"
                    value={row.result}
                    onChange={(e) => updateRow(index, 'result', e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded px-3 py-1 text-sm text-white"
                    placeholder="Result..."
                  />
                  <button
                    onClick={() => removeRow(index)}
                    className="p-1 text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Render Detail / Roller
  if (selectedTable) {
    return (
      <div className="p-8 max-w-4xl mx-auto w-full h-full flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                setSelectedTable(null)
                setRollResult(null)
              }}
              className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
            >
              <ArrowLeft size={20} className="text-slate-400" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-white">{selectedTable.title}</h1>
              <p className="text-slate-400 text-sm">{selectedTable.system}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleEdit(selectedTable)}
              className="p-2 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors"
            >
              <Edit2 size={20} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Roller Section */}
          <div className="md:col-span-1 space-y-6">
            <div className="bg-gradient-to-br from-indigo-900/50 to-slate-900 border border-indigo-500/30 rounded-2xl p-6 text-center">
              <div className="w-20 h-20 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-500/30">
                <Dices size={40} className="text-white" />
              </div>
              <button
                onClick={handleRoll}
                className="w-full bg-white text-indigo-900 font-bold py-3 rounded-xl hover:bg-indigo-50 transition-colors shadow-lg active:scale-95 transform duration-100"
              >
                Roll!
              </button>
            </div>

            {rollResult && (
              <div className="bg-slate-900 border border-indigo-500/50 rounded-2xl p-6 animate-in zoom-in duration-300">
                <div className="text-center mb-2">
                  <span className="text-4xl font-bold text-indigo-400">{rollResult.roll}</span>
                </div>
                <p className="text-white text-center text-lg font-medium leading-relaxed">
                  {rollResult.result}
                </p>
              </div>
            )}
          </div>

          {/* Table View */}
          <div className="md:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="overflow-y-auto max-h-[600px]">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-950 text-slate-400 sticky top-0">
                  <tr>
                    <th className="px-4 py-3 font-medium w-24 text-center">Roll</th>
                    <th className="px-4 py-3 font-medium">Result</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {selectedTable.rows.map((row) => (
                    <tr
                      key={row.id}
                      className={rollResult && rollResult.roll >= row.range[0] && rollResult.roll <= row.range[1]
                        ? 'bg-indigo-500/20 text-white'
                        : 'text-slate-300 hover:bg-slate-800/50'
                      }
                    >
                      <td className="px-4 py-3 text-center font-mono text-slate-500">
                        {row.range[0] === row.range[1] ? row.range[0] : `${row.range[0]}-${row.range[1]}`}
                      </td>
                      <td className="px-4 py-3">{row.result}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Render List
  return (
    <div className="p-8 max-w-7xl mx-auto w-full h-full flex flex-col">
      {campaignId && <BackButton fallbackPath={`/campaign/${campaignId}`} />}

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <Dices className="text-indigo-500" />
            {campaignSystem ? `${campaignSystem} Tables` : 'Roll Tables'}
          </h1>
          <p className="text-slate-400">Create and manage random tables for your games.</p>
        </div>
        <button
          onClick={handleCreate}
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 shadow-lg shadow-indigo-500/20"
        >
          <Plus size={20} />
          New Table
        </button>
      </div>

      {/* System Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
        {systems.map(sys => (
          <button
            key={sys}
            onClick={() => setActiveSystemFilter(sys)}
            className={`
              px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all
              ${activeSystemFilter === sys
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25'
                : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-white border border-slate-800'
              }
            `}
          >
            {sys}
          </button>
        ))}
      </div>

      <div className="mb-6 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
        <input
          type="text"
          placeholder="Search tables..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTables.map((table) => (
          <div
            key={table.id}
            onClick={() => setSelectedTable(table)}
            className="bg-slate-900 border border-slate-800 hover:border-indigo-500/50 rounded-xl p-5 cursor-pointer transition-all group relative"
          >
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs font-medium px-2 py-1 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                {table.system}
              </span>
              <button
                onClick={(e) => handleDelete(table.id, e)}
                className="text-slate-600 hover:text-red-400 transition-colors p-1"
              >
                <Trash2 size={16} />
              </button>
            </div>
            <h3 className="text-lg font-bold text-white mb-1 group-hover:text-indigo-400 transition-colors">
              {table.title}
            </h3>
            <p className="text-slate-500 text-sm line-clamp-2 mb-4">
              {table.description || 'No description'}
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <span className="bg-slate-950 px-2 py-1 rounded border border-slate-800">
                {table.rows.length} rows
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

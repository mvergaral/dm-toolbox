import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useDB } from '../context/DbContext'
import { useTranslation } from 'react-i18next'
import ImageUploader from '../components/ui/ImageUploader'
import BackButton from '../components/ui/BackButton'
import { Plus, Trash2, Users, Heart, Shield, X, Swords, FileText, Skull, Edit2, Search, ChevronDown, ChevronUp } from 'lucide-react'

interface Npc {
  id: string
  campaignId: string
  name: string
  race: string
  role: string
  hp: number
  ac: number
  attacks: string
  imageData: string
  notes: string
  isHostile: boolean
  createdAt: number
}

export default function Npcs() {
  const { id: campaignId } = useParams()
  const db = useDB()
  const { t } = useTranslation()

  const [npcs, setNpcs] = useState<Npc[]>([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingNpc, setEditingNpc] = useState<string | null>(null)
  const [expandedNpcId, setExpandedNpcId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState<'all' | 'hostile' | 'friendly'>('all')
  const [formData, setFormData] = useState({
    name: '',
    race: '',
    role: '',
    hp: 10,
    ac: 10,
    attacks: '',
    imageData: '',
    notes: '',
    isHostile: false
  })

  // Cargar NPCs de la campaña
  useEffect(() => {
    if (!db || !campaignId) return

    const loadNpcs = async () => {
      const collection = db.npcs
      const query = collection.find({
        selector: {
          campaignId: campaignId,
          type: 'npc'
        },
        sort: [{ createdAt: 'desc' }]
      })

      const sub = query.$.subscribe((docs) => {
        setNpcs(docs.map((doc) => doc.toJSON() as Npc))
      })

      return () => sub.unsubscribe()
    }

    loadNpcs()
  }, [db, campaignId])

  const saveNpc = async () => {
    if (!db || !formData.name.trim()) return

    try {
      if (editingNpc) {
        const doc = await db.npcs.findOne(editingNpc).exec()
        if (doc) {
          await doc.update({
            $set: {
              name: formData.name.trim(),
              race: formData.race.trim(),
              role: formData.role.trim(),
              hp: formData.hp,
              ac: formData.ac,
              attacks: formData.attacks.trim(),
              imageData: formData.imageData,
              notes: formData.notes.trim(),
              isHostile: formData.isHostile
            }
          })
        }
      } else {
        const newNpc = {
          id: `npc_${Date.now()}`,
          campaignId: campaignId!,
          name: formData.name.trim(),
          type: 'npc',
          race: formData.race.trim(),
          role: formData.role.trim(),
          hp: formData.hp,
          ac: formData.ac,
          attacks: formData.attacks.trim(),
          imageData: formData.imageData,
          notes: formData.notes.trim(),
          isHostile: formData.isHostile,
          createdAt: Date.now()
        }

        await db.npcs.insert(newNpc)
      }

      // Reset form
      setFormData({
        name: '',
        race: '',
        role: '',
        hp: 10,
        ac: 10,
        attacks: '',
        imageData: '',
        notes: '',
        isHostile: false
      })
      setShowCreateModal(false)
      setEditingNpc(null)
    } catch (error) {
      console.error('Error al guardar NPC:', error)
    }
  }

  const openEditModal = (npc: Npc) => {
    setFormData({
      name: npc.name,
      race: npc.race,
      role: npc.role,
      hp: npc.hp,
      ac: npc.ac,
      attacks: npc.attacks,
      imageData: npc.imageData,
      notes: npc.notes,
      isHostile: npc.isHostile
    })
    setEditingNpc(npc.id)
    setShowCreateModal(true)
  }

  const deleteNpc = async (npcId: string) => {
    if (!db) return
    if (!confirm(t('npcs.delete.confirm') + ' ' + t('npcs.delete.message'))) return

    try {
      const doc = await db.npcs.findOne(npcId).exec()
      if (doc) {
        await doc.remove()
      }
    } catch (error) {
      console.error('Error al eliminar NPC:', error)
    }
  }

  const toggleHostile = async (npcId: string, currentHostile: boolean) => {
    if (!db) return

    try {
      const doc = await db.npcs.findOne(npcId).exec()
      if (doc) {
        await doc.update({
          $set: {
            isHostile: !currentHostile
          }
        })
      }
    } catch (error) {
      console.error('Error al cambiar hostilidad:', error)
    }
  }

  const filteredNpcs = npcs.filter((npc) => {
    const matchesSearch =
      npc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      npc.race.toLowerCase().includes(searchTerm.toLowerCase()) ||
      npc.role.toLowerCase().includes(searchTerm.toLowerCase())

    if (filter === 'hostile') return matchesSearch && npc.isHostile
    if (filter === 'friendly') return matchesSearch && !npc.isHostile
    return matchesSearch
  })

  return (
    <div className="p-8 max-w-7xl mx-auto w-full">
      {/* Botón Volver */}
      <div className="mb-6">
        <BackButton fallbackPath={`/campaign/${campaignId}`} />
      </div>

      {/* Header */}
      <div className="flex justify-between items-end mb-8 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <Users className="text-purple-500" />
            {t('npcs.title')}
          </h1>
          <p className="text-slate-400">{t('npcs.description')}</p>
        </div>

        <button
          onClick={() => {
            setFormData({
              name: '',
              race: '',
              role: '',
              hp: 10,
              ac: 10,
              attacks: '',
              imageData: '',
              notes: '',
              isHostile: false
            })
            setEditingNpc(null)
            setShowCreateModal(true)
          }}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white px-5 py-2.5 rounded-lg font-medium transition-all shadow-lg shadow-purple-500/20 active:scale-95"
        >
          <Plus size={20} />
          {t('npcs.new')}
        </button>
      </div>

      {/* Filtros y Búsqueda */}
      <div className="flex flex-col md:flex-row gap-4 mb-6 justify-between items-center">
        <div className="flex gap-2 bg-slate-900 p-1 rounded-lg border border-slate-800">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-md font-medium transition-all ${
              filter === 'all'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {t('npcs.filter.all')}
          </button>
          <button
            onClick={() => setFilter('hostile')}
            className={`px-4 py-2 rounded-md font-medium transition-all ${
              filter === 'hostile'
                ? 'bg-red-900/30 text-red-200 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {t('npcs.filter.hostile')}
          </button>
          <button
            onClick={() => setFilter('friendly')}
            className={`px-4 py-2 rounded-md font-medium transition-all ${
              filter === 'friendly'
                ? 'bg-green-900/30 text-green-200 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {t('npcs.filter.friendly')}
          </button>
        </div>

        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t('common.search')}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Lista de NPCs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredNpcs.length === 0 ? (
          <div className="col-span-full py-20 flex flex-col items-center justify-center border-2 border-dashed border-slate-800 rounded-3xl bg-slate-900/20 text-slate-500">
            <div className="bg-slate-900 p-4 rounded-full mb-4">
              {searchTerm ? <Search size={48} className="text-slate-700" /> : <Users size={48} className="text-slate-700" />}
            </div>
            <p className="text-lg font-medium text-slate-400">
              {searchTerm ? t('common.noData') : t('npcs.noNpcs')}
            </p>
            <p className="text-sm opacity-60 mb-6">
              {searchTerm ? t('common.searchNoResults') : t('npcs.noNpcsDesc')}
            </p>
            {!searchTerm && (
              <button
                onClick={() => {
                  setFormData({
                    name: '',
                    race: '',
                    role: '',
                    hp: 10,
                    ac: 10,
                    attacks: '',
                    imageData: '',
                    notes: '',
                    isHostile: false
                  })
                  setEditingNpc(null)
                  setShowCreateModal(true)
                }}
                className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                <Plus size={18} />
                {t('npcs.new')}
              </button>
            )}
          </div>
        ) : (
          filteredNpcs.map((npc) => (
            <div
              key={npc.id}
              className={`group bg-slate-900 border rounded-xl p-5 transition-all ${
                npc.isHostile
                  ? 'border-red-900/50 hover:border-red-500/50'
                  : 'border-slate-800 hover:border-purple-500/50'
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3 flex-1">
                  {/* Avatar */}
                  <div className="w-12 h-12 rounded-full bg-slate-800 border-2 border-slate-700 flex-shrink-0 overflow-hidden">
                    {npc.imageData ? (
                      <img
                        src={npc.imageData}
                        alt={npc.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-600">
                        {npc.isHostile ? <Skull size={24} /> : <Users size={24} />}
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-1">{npc.name}</h3>
                    <p className="text-sm text-slate-400">
                      {npc.race && npc.role ? `${npc.race} - ${npc.role}` : npc.race || npc.role || t('common.unspecified')}
                    </p>
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => openEditModal(npc)}
                    className="text-slate-600 hover:text-purple-500 transition-colors p-1"
                    title={t('common.edit')}
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => deleteNpc(npc.id)}
                    className="text-slate-600 hover:text-red-500 transition-colors p-1"
                    title={t('common.delete')}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Heart size={14} />
                    HP
                  </span>
                  <span className="text-white font-bold">{npc.hp}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Shield size={14} />
                    AC
                  </span>
                  <span className="text-white font-bold">{npc.ac}</span>
                </div>
              </div>

              <button
                onClick={() => setExpandedNpcId(expandedNpcId === npc.id ? null : npc.id)}
                className="w-full mb-4 flex items-center justify-center gap-2 text-xs font-medium text-slate-500 hover:text-slate-300 transition-colors py-2 border-t border-slate-800/50"
              >
                {expandedNpcId === npc.id ? (
                  <>
                    <ChevronUp size={14} />
                    {t('common.lessDetails')}
                  </>
                ) : (
                  <>
                    <ChevronDown size={14} />
                    {t('common.moreDetails')}
                  </>
                )}
              </button>

              {expandedNpcId === npc.id && (
                <div className="mb-4 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                  {npc.attacks && (
                    <div>
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                        <Swords size={12} />
                        Ataques
                      </h4>
                      <p className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed bg-slate-950/50 p-3 rounded-lg border border-slate-800">
                        {npc.attacks}
                      </p>
                    </div>
                  )}

                  {npc.notes && (
                    <div>
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                        <FileText size={12} />
                        Notas
                      </h4>
                      <p className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed bg-slate-950/50 p-3 rounded-lg border border-slate-800">
                        {npc.notes}
                      </p>
                    </div>
                  )}
                </div>
              )}

              <button
                onClick={() => toggleHostile(npc.id, npc.isHostile)}
                className={`w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg font-medium text-sm transition-colors ${
                  npc.isHostile
                    ? 'bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20'
                    : 'bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20'
                }`}
              >
                {npc.isHostile ? t('npcs.toggleFriendly') : t('npcs.toggleHostile')}
              </button>
            </div>
          ))
        )}
      </div>

      {/* Modal para crear NPC */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between sticky top-0 bg-slate-900 z-10">
              <h2 className="text-2xl font-bold text-white">
                {editingNpc ? t('npcs.edit') : t('npcs.new')}
              </h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault()
                saveNpc()
              }}
              className="p-6 space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  {t('npcs.form.name')} *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder={t('npcs.form.namePlaceholder')}
                  autoFocus
                  required
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    {t('npcs.form.race')}
                  </label>
                  <input
                    type="text"
                    value={formData.race}
                    onChange={(e) => setFormData({ ...formData, race: e.target.value })}
                    placeholder={t('npcs.form.racePlaceholder')}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    {t('npcs.form.role')}
                  </label>
                  <input
                    type="text"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    placeholder={t('npcs.form.rolePlaceholder')}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Imagen del NPC */}
              <div>
                <ImageUploader
                  currentImage={formData.imageData}
                  onImageChange={(image) => setFormData({ ...formData, imageData: image })}
                  size="medium"
                  label={t('npcs.form.image')}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    {t('npcs.form.hp')}
                  </label>
                  <input
                    type="number"
                    value={formData.hp}
                    onChange={(e) => setFormData({ ...formData, hp: parseInt(e.target.value) || 1 })}
                    onFocus={(e) => e.target.select()}
                    min="1"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    {t('npcs.form.ac')}
                  </label>
                  <input
                    type="number"
                    value={formData.ac}
                    onChange={(e) => setFormData({ ...formData, ac: parseInt(e.target.value) || 10 })}
                    onFocus={(e) => e.target.select()}
                    min="0"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  {t('npcs.form.attacks')}
                </label>
                <textarea
                  value={formData.attacks}
                  onChange={(e) => setFormData({ ...formData, attacks: e.target.value })}
                  placeholder={t('npcs.form.attacksPlaceholder')}
                  rows={3}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  {t('npcs.form.notes')}
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder={t('npcs.form.notesPlaceholder')}
                  rows={4}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                />
              </div>

              <div className="flex items-center gap-3 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                <input
                  type="checkbox"
                  id="isHostile"
                  checked={formData.isHostile}
                  onChange={(e) => setFormData({ ...formData, isHostile: e.target.checked })}
                  className="w-4 h-4 text-red-600 bg-slate-700 border-slate-600 rounded focus:ring-red-500 focus:ring-2"
                />
                <label htmlFor="isHostile" className="text-sm font-medium text-slate-300 cursor-pointer">
                  {t('npcs.toggleHostile')}
                </label>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={!formData.name.trim()}
                  className="flex-1 bg-purple-600 hover:bg-purple-500 disabled:bg-slate-800 disabled:text-slate-600 text-white px-4 py-2.5 rounded-lg font-medium transition-colors disabled:cursor-not-allowed"
                >
                  {editingNpc ? t('common.save') : t('common.create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useDB } from '../context/DbContext'
import { useTranslation } from 'react-i18next'
import ImageUploader from '../components/ui/ImageUploader'
import BackButton from '../components/ui/BackButton'
import {
  Plus,
  Trash2,
  Heart,
  Shield,
  X,
  Swords,
  FileText,
  Skull,
  Edit2,
  ChevronDown,
  ChevronUp,
  Search
} from 'lucide-react'

interface Monster {
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

export default function Monsters() {
  const { id: campaignId } = useParams()
  const db = useDB()
  const { t } = useTranslation()

  const [monsters, setMonsters] = useState<Monster[]>([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingMonster, setEditingMonster] = useState<Monster | null>(null)
  const [expandedMonsterId, setExpandedMonsterId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    race: '',
    role: '',
    hp: 10,
    ac: 10,
    attacks: '',
    imageData: '',
    notes: '',
    isHostile: true // Monstruos son hostiles por defecto
  })

  // Cargar Monstruos de la campaña
  useEffect(() => {
    if (!db || !campaignId) return

    const loadMonsters = async () => {
      const collection = db.npcs
      const query = collection.find({
        selector: {
          campaignId: campaignId,
          type: 'monster'
        },
        sort: [{ createdAt: 'desc' }]
      })

      const sub = query.$.subscribe((docs) => {
        setMonsters(docs.map((doc) => doc.toJSON() as Monster))
      })

      return () => sub.unsubscribe()
    }

    loadMonsters()
  }, [db, campaignId])

  const openCreateModal = () => {
    setEditingMonster(null)
    setFormData({
      name: '',
      race: '',
      role: '',
      hp: 10,
      ac: 10,
      attacks: '',
      imageData: '',
      notes: '',
      isHostile: true
    })
    setShowCreateModal(true)
  }

  const openEditModal = (monster: Monster) => {
    setEditingMonster(monster)
    setFormData({
      name: monster.name,
      race: monster.race,
      role: monster.role,
      hp: monster.hp,
      ac: monster.ac,
      attacks: monster.attacks,
      imageData: monster.imageData,
      notes: monster.notes,
      isHostile: monster.isHostile
    })
    setShowCreateModal(true)
  }

  const saveMonster = async () => {
    if (!db || !formData.name.trim()) return

    try {
      if (editingMonster) {
        // Editar existente
        const doc = await db.npcs.findOne(editingMonster.id).exec()
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
        // Crear nuevo
        const newMonster = {
          id: `mon_${Date.now()}`,
          campaignId: campaignId!,
          name: formData.name.trim(),
          type: 'monster',
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
        await db.npcs.insert(newMonster)
      }

      setShowCreateModal(false)
    } catch (error) {
      console.error('Error al guardar Monstruo:', error)
    }
  }

  const deleteMonster = async (monsterId: string) => {
    if (!db) return
    if (!confirm(t('monsters.delete.confirm') + ' ' + t('monsters.delete.message'))) return

    try {
      const doc = await db.npcs.findOne(monsterId).exec()
      if (doc) {
        await doc.remove()
      }
    } catch (error) {
      console.error('Error al eliminar Monstruo:', error)
    }
  }

  const filteredMonsters = monsters.filter((monster) => {
    return (
      monster.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      monster.race.toLowerCase().includes(searchTerm.toLowerCase()) ||
      monster.role.toLowerCase().includes(searchTerm.toLowerCase())
    )
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
            <Skull className="text-red-500" />
            {t('monsters.title')}
          </h1>
          <p className="text-slate-400">{t('monsters.description')}</p>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white px-5 py-2.5 rounded-lg font-medium transition-all shadow-lg shadow-red-500/20 active:scale-95"
        >
          <Plus size={20} />
          {t('monsters.new')}
        </button>
      </div>

      {/* Búsqueda */}
      <div className="mb-6">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t('common.search')}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Lista de Monstruos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMonsters.length === 0 ? (
          <div className="col-span-full py-20 flex flex-col items-center justify-center border-2 border-dashed border-slate-800 rounded-3xl bg-slate-900/20 text-slate-500">
            <div className="bg-slate-900 p-4 rounded-full mb-4">
              {searchTerm ? (
                <Search size={48} className="text-slate-700" />
              ) : (
                <Skull size={48} className="text-slate-700" />
              )}
            </div>
            <p className="text-lg font-medium text-slate-400">
              {searchTerm ? t('common.noData') : t('monsters.noMonsters')}
            </p>
            <p className="text-sm opacity-60 mb-6">
              {searchTerm ? t('common.searchNoResults') : t('monsters.noMonstersDesc')}
            </p>
            {!searchTerm && (
              <button
                onClick={openCreateModal}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                <Plus size={18} />
                {t('monsters.new')}
              </button>
            )}
          </div>
        ) : (
          filteredMonsters.map((monster) => (
            <div
              key={monster.id}
              className={`group bg-slate-900 border rounded-xl p-5 transition-all ${
                expandedMonsterId === monster.id
                  ? 'border-red-500/50 ring-1 ring-red-500/20'
                  : 'border-slate-800 hover:border-red-500/50'
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3 flex-1">
                  {/* Avatar */}
                  <div className="w-12 h-12 rounded-full bg-slate-800 border-2 border-slate-700 flex-shrink-0 overflow-hidden">
                    {monster.imageData ? (
                      <img
                        src={monster.imageData}
                        alt={monster.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-600">
                        <Skull size={24} />
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-1">{monster.name}</h3>
                    <p className="text-sm text-slate-400">
                      {monster.race && monster.role
                        ? `${monster.race} - ${monster.role}`
                        : monster.race || monster.role || t('common.unspecified')}
                    </p>
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => openEditModal(monster)}
                    className="text-slate-600 hover:text-indigo-400 transition-colors p-1"
                    title={t('common.edit')}
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => deleteMonster(monster.id)}
                    className="text-slate-600 hover:text-red-500 transition-colors p-1"
                    title={t('common.delete')}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Heart size={14} />
                    HP
                  </span>
                  <span className="text-white font-bold">{monster.hp}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Shield size={14} />
                    AC
                  </span>
                  <span className="text-white font-bold">{monster.ac}</span>
                </div>
              </div>

              {/* Expandable content */}
              <button
                onClick={() =>
                  setExpandedMonsterId(expandedMonsterId === monster.id ? null : monster.id)
                }
                className="w-full mt-4 flex items-center justify-center gap-2 text-xs font-medium text-slate-500 hover:text-slate-300 transition-colors py-2 border-t border-slate-800/50"
              >
                {expandedMonsterId === monster.id ? (
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

              {expandedMonsterId === monster.id && (
                <div className="mt-4 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                  {monster.attacks && (
                    <div>
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                        <Swords size={12} />
                        {t('monsters.form.attacks')}
                      </h4>
                      <p className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed bg-slate-950/50 p-3 rounded-lg border border-slate-800">
                        {monster.attacks}
                      </p>
                    </div>
                  )}

                  {monster.notes && (
                    <div>
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                        <FileText size={12} />
                        {t('monsters.form.notes')}
                      </h4>
                      <p className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed bg-slate-950/50 p-3 rounded-lg border border-slate-800">
                        {monster.notes}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Modal para crear/editar Monstruo */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between sticky top-0 bg-slate-900 z-10">
              <h2 className="text-2xl font-bold text-white">
                {editingMonster ? t('monsters.edit') : t('monsters.new')}
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
                saveMonster()
              }}
              className="p-6 space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  {t('monsters.form.name')} *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder={t('monsters.form.namePlaceholder')}
                  autoFocus
                  required
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    {t('monsters.form.race')}
                  </label>
                  <input
                    type="text"
                    value={formData.race}
                    onChange={(e) => setFormData({ ...formData, race: e.target.value })}
                    placeholder={t('monsters.form.racePlaceholder')}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    {t('monsters.form.role')}
                  </label>
                  <input
                    type="text"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    placeholder={t('monsters.form.rolePlaceholder')}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Imagen del Monstruo */}
              <div>
                <ImageUploader
                  currentImage={formData.imageData}
                  onImageChange={(image) => setFormData({ ...formData, imageData: image })}
                  size="medium"
                  label={t('monsters.form.image')}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    {t('monsters.form.hp')}
                  </label>
                  <input
                    type="number"
                    value={formData.hp}
                    onChange={(e) =>
                      setFormData({ ...formData, hp: parseInt(e.target.value) || 1 })
                    }
                    onFocus={(e) => e.target.select()}
                    min="1"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    {t('monsters.form.ac')}
                  </label>
                  <input
                    type="number"
                    value={formData.ac}
                    onChange={(e) =>
                      setFormData({ ...formData, ac: parseInt(e.target.value) || 10 })
                    }
                    onFocus={(e) => e.target.select()}
                    min="0"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  {t('monsters.form.attacks')}
                </label>
                <textarea
                  value={formData.attacks}
                  onChange={(e) => setFormData({ ...formData, attacks: e.target.value })}
                  placeholder={t('monsters.form.attacksPlaceholder')}
                  rows={3}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  {t('monsters.form.notes')}
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder={t('monsters.form.notesPlaceholder')}
                  rows={4}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                />
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
                  className="flex-1 bg-red-600 hover:bg-red-500 disabled:bg-slate-800 disabled:text-slate-600 text-white px-4 py-2.5 rounded-lg font-medium transition-colors disabled:cursor-not-allowed"
                >
                  {editingMonster ? t('common.saveChanges') : t('common.create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

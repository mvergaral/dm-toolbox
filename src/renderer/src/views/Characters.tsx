import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useDB } from '../context/DbContext'
import { useTranslation } from 'react-i18next'
import ImageUploader from '../components/ui/ImageUploader'
import BackButton from '../components/ui/BackButton'
import { Edit2, Plus, Trash2, UserCheck, Heart, Shield, X, Skull, HeartPulse, Search, ChevronDown, ChevronUp, FileText } from 'lucide-react'

interface Character {
  id: string
  campaignId: string
  name: string
  playerName: string
  race: string
  class: string
  level: number
  maxHp: number
  ac: number
  initiativeBonus: number
  isAlive: boolean
  imageData: string
  notes: string
  createdAt: number
}

export default function Characters() {
  const { id: campaignId } = useParams<{ id: string }>()
  const db = useDB()
  const { t } = useTranslation()

  const [characters, setCharacters] = useState<Character[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingCharacter, setEditingCharacter] = useState<Character | null>(null)
  const [expandedCharacterId, setExpandedCharacterId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  // Estados del formulario
  const [formData, setFormData] = useState({
    name: '',
    playerName: '',
    race: '',
    class: '',
    level: 1,
    maxHp: 10,
    ac: 10,
    initiativeBonus: 0,
    imageData: '',
    notes: ''
  })

  // Cargar personajes
  useEffect(() => {
    if (!campaignId) return

    const subscription = db.characters
      .find({
        selector: {
          campaignId: campaignId
        }
      })
      .$.subscribe({
        next: (docs: any[]) => {
          const chars = docs
            .map((doc) => doc.toJSON())
            .sort((a, b) => b.createdAt - a.createdAt)
          setCharacters(chars)
          setIsLoading(false)
        },
        error: (error) => {
          console.error('Error cargando personajes:', error)
          setIsLoading(false)
        }
      })

    return () => subscription.unsubscribe()
  }, [campaignId, db])

  const openCreateModal = () => {
    setEditingCharacter(null)
    setFormData({
      name: '',
      playerName: '',
      race: '',
      class: '',
      level: 1,
      maxHp: 10,
      ac: 10,
      initiativeBonus: 0,
      imageData: '',
      notes: ''
    })
    setShowCreateModal(true)
  }

  const openEditModal = (character: Character) => {
    setEditingCharacter(character)
    setFormData({
      name: character.name,
      playerName: character.playerName,
      race: character.race,
      class: character.class,
      level: character.level,
      maxHp: character.maxHp,
      ac: character.ac,
      initiativeBonus: character.initiativeBonus,
      imageData: character.imageData,
      notes: character.notes
    })
    setShowCreateModal(true)
  }

  const saveCharacter = async () => {
    if (!formData.name.trim()) return

    try {
      if (editingCharacter) {
        // Editar existente
        const doc = await db.characters.findOne(editingCharacter.id).exec()
        if (doc) {
          await doc.update({
            $set: {
              name: formData.name.trim(),
              playerName: formData.playerName.trim(),
              race: formData.race.trim(),
              class: formData.class.trim(),
              level: formData.level,
              maxHp: formData.maxHp,
              ac: formData.ac,
              initiativeBonus: formData.initiativeBonus,
              imageData: formData.imageData,
              notes: formData.notes.trim()
            }
          })
        }
      } else {
        // Crear nuevo
        const newCharacter = {
          id: `char_${Date.now()}`,
          campaignId: campaignId!,
          name: formData.name.trim(),
          playerName: formData.playerName.trim(),
          race: formData.race.trim(),
          class: formData.class.trim(),
          level: formData.level,
          maxHp: formData.maxHp,
          ac: formData.ac,
          initiativeBonus: formData.initiativeBonus,
          isAlive: true,
          imageData: formData.imageData,
          notes: formData.notes.trim(),
          createdAt: Date.now()
        }
        await db.characters.insert(newCharacter)
      }

      setShowCreateModal(false)
    } catch (error: any) {
      console.error('Error guardando personaje:', error)
      alert(`No se pudo guardar el personaje: ${error.message}`)
    }
  }

  const toggleAlive = async (characterId: string, currentStatus: boolean) => {
    try {
      const doc = await db.characters.findOne(characterId).exec()
      if (doc) {
        await doc.update({
          $set: {
            isAlive: !currentStatus
          }
        })
      }
    } catch (error) {
      console.error('Error actualizando estado:', error)
    }
  }

  const deleteCharacter = async (characterId: string) => {
    if (!confirm(t('characters.delete.confirm') + ' ' + t('characters.delete.message'))) return

    try {
      const doc = await db.characters.findOne(characterId).exec()
      if (doc) await doc.remove()
    } catch (error) {
      console.error('Error eliminando personaje:', error)
    }
  }

  const filteredCharacters = characters.filter((character) => {
    return (
      character.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      character.playerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      character.race.toLowerCase().includes(searchTerm.toLowerCase()) ||
      character.class.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-slate-400">{t('common.loading')}</p>
      </div>
    )
  }

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
            <UserCheck className="text-indigo-500" />
            {t('characters.title')}
          </h1>
          <p className="text-slate-400">{t('characters.description')}</p>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-lg font-medium transition-all shadow-lg shadow-indigo-500/20 active:scale-95"
        >
          <Plus size={20} />
          {t('characters.new')}
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
            className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Lista de personajes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCharacters.length === 0 ? (
          <div className="col-span-full py-20 flex flex-col items-center justify-center border-2 border-dashed border-slate-800 rounded-3xl bg-slate-900/20 text-slate-500">
            <div className="bg-slate-900 p-4 rounded-full mb-4">
              {searchTerm ? <Search size={48} className="text-slate-700" /> : <UserCheck size={48} className="text-slate-700" />}
            </div>
            <p className="text-lg font-medium text-slate-400">
              {searchTerm ? t('common.noData') : t('characters.noCharacters')}
            </p>
            <p className="text-sm opacity-60 mb-6">
              {searchTerm ? t('common.searchNoResults') : t('characters.noCharactersDesc')}
            </p>
            {!searchTerm && (
              <button
                onClick={openCreateModal}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                <Plus size={18} />
                {t('characters.new')}
              </button>
            )}
          </div>
        ) : (
          filteredCharacters.map((character) => (
            <div
              key={character.id}
              className={`group bg-slate-900 border rounded-xl p-5 transition-all ${
                character.isAlive
                  ? 'border-slate-800 hover:border-indigo-500/50'
                  : 'border-red-900/50 bg-slate-900/50 opacity-75'
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3 flex-1">
                  {/* Avatar */}
                  <div className="w-12 h-12 rounded-full bg-slate-800 border-2 border-slate-700 flex-shrink-0 overflow-hidden">
                    {character.imageData ? (
                      <img
                        src={character.imageData}
                        alt={character.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-600">
                        <UserCheck size={24} />
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
                      {character.name}
                      {!character.isAlive && (
                        <Skull size={18} className="text-red-500" />
                      )}
                    </h3>
                    <p className="text-sm text-slate-400">
                      {character.playerName || t('common.unspecified')}
                    </p>
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => openEditModal(character)}
                    className="text-slate-600 hover:text-indigo-400 transition-colors p-1"
                    title={t('common.edit')}
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => deleteCharacter(character.id)}
                    className="text-slate-600 hover:text-red-500 transition-colors p-1"
                    title={t('common.delete')}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">{t('characters.classAndLevel')}</span>
                  <span className="text-white font-medium">
                    {character.class || 'N/A'} {character.level}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400 flex items-center gap-1">
                    <Heart size={14} />
                    {t('characters.maxHp')}
                  </span>
                  <span className="text-white font-medium">{character.maxHp}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400 flex items-center gap-1">
                    <Shield size={14} />
                    {t('characters.form.ac')}
                  </span>
                  <span className="text-white font-medium">{character.ac}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">{t('characters.form.initiative')}</span>
                  <span className="text-white font-medium">
                    {character.initiativeBonus >= 0 ? '+' : ''}{character.initiativeBonus}
                  </span>
                </div>
              </div>

              {character.notes && (
                <>
                  <button
                    onClick={() => setExpandedCharacterId(expandedCharacterId === character.id ? null : character.id)}
                    className="w-full mb-4 flex items-center justify-center gap-2 text-xs font-medium text-slate-500 hover:text-slate-300 transition-colors py-2 border-t border-slate-800/50"
                  >
                    {expandedCharacterId === character.id ? (
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

                  {expandedCharacterId === character.id && (
                    <div className="mb-4 animate-in fade-in slide-in-from-top-2 duration-200">
                      <div>
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                          <FileText size={12} />
                          {t('characters.form.notes')}
                        </h4>
                        <p className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed bg-slate-950/50 p-3 rounded-lg border border-slate-800">
                          {character.notes}
                        </p>
                      </div>
                    </div>
                  )}
                </>
              )}

              <button
                onClick={() => toggleAlive(character.id, character.isAlive)}
                className={`w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg font-medium text-sm transition-colors ${
                  character.isAlive
                    ? 'bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20'
                    : 'bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20'
                }`}
              >
                {character.isAlive ? (
                  <>
                    <Skull size={16} />
                    {t('characters.toggleAlive')}
                  </>
                ) : (
                  <>
                    <HeartPulse size={16} />
                    {t('characters.toggleDead')}
                  </>
                )}
              </button>
            </div>
          ))
        )}
      </div>

      {/* Modal para crear personaje */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between sticky top-0 bg-slate-900 z-10">
              <h2 className="text-2xl font-bold text-white">
                {editingCharacter ? t('characters.edit') : t('characters.new')}
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
                saveCharacter()
              }}
              className="p-6 space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    {t('characters.form.name')} *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder={t('characters.form.namePlaceholder')}
                    autoFocus
                    required
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    {t('characters.form.playerName')}
                  </label>
                  <input
                    type="text"
                    value={formData.playerName}
                    onChange={(e) => setFormData({ ...formData, playerName: e.target.value })}
                    placeholder={t('characters.form.playerNamePlaceholder')}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    {t('characters.form.race')}
                  </label>
                  <input
                    type="text"
                    value={formData.race}
                    onChange={(e) => setFormData({ ...formData, race: e.target.value })}
                    placeholder={t('characters.form.racePlaceholder')}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    {t('characters.form.class')}
                  </label>
                  <input
                    type="text"
                    value={formData.class}
                    onChange={(e) => setFormData({ ...formData, class: e.target.value })}
                    placeholder={t('characters.form.classPlaceholder')}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    {t('characters.form.level')}
                  </label>
                  <input
                    type="number"
                    value={formData.level}
                    onChange={(e) => setFormData({ ...formData, level: parseInt(e.target.value) || 1 })}
                    onFocus={(e) => e.target.select()}
                    min="1"
                    max="20"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Imagen del Personaje */}
              <div>
                <ImageUploader
                  currentImage={formData.imageData}
                  onImageChange={(image) => setFormData({ ...formData, imageData: image })}
                  size="medium"
                  label={t('characters.form.image')}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    {t('characters.form.hp')}
                  </label>
                  <input
                    type="number"
                    value={formData.maxHp}
                    onChange={(e) => setFormData({ ...formData, maxHp: parseInt(e.target.value) || 1 })}
                    onFocus={(e) => e.target.select()}
                    min="1"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    {t('characters.form.ac')}
                  </label>
                  <input
                    type="number"
                    value={formData.ac}
                    onChange={(e) => setFormData({ ...formData, ac: parseInt(e.target.value) || 10 })}
                    onFocus={(e) => e.target.select()}
                    min="0"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    {t('characters.form.initiative')}
                  </label>
                  <input
                    type="number"
                    value={formData.initiativeBonus}
                    onChange={(e) => setFormData({ ...formData, initiativeBonus: parseInt(e.target.value) || 0 })}
                    onFocus={(e) => e.target.select()}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  {t('characters.form.notes')}
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder={t('characters.form.notesPlaceholder')}
                  rows={4}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
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
                  className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-600 text-white px-4 py-2.5 rounded-lg font-medium transition-colors disabled:cursor-not-allowed"
                >
                  {editingCharacter ? t('common.saveChanges') : t('common.create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

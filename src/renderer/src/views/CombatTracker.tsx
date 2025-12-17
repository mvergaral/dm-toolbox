import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDB } from '../context/DbContext'
import { useTranslation } from 'react-i18next'
import BackButton from '../components/ui/BackButton'
import { Plus, Swords, Clock, Trash2, Play, X } from 'lucide-react'

interface CombatEncounter {
  id: string
  campaignId: string
  name: string
  round: number
  currentTurn: number
  isActive: boolean
  createdAt: number
  updatedAt: number
}

export default function CombatTracker() {
  const { id: campaignId } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const db = useDB()
  const { t } = useTranslation()

  const [encounters, setEncounters] = useState<CombatEncounter[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newEncounterName, setNewEncounterName] = useState('')

  useEffect(() => {
    if (!campaignId) {
      setIsLoading(false)
      return
    }

    const subscription = db.combatEncounters
      .find({
        selector: {
          campaignId: campaignId
        }
      })
      .$.subscribe({
        next: (docs: any[]) => {
          const sorted = docs
            .map(doc => doc.toJSON())
            .sort((a, b) => b.createdAt - a.createdAt)
          setEncounters(sorted)
          setIsLoading(false)
        },
        error: (error) => {
          console.error('Error en subscription de combatEncounters:', error)
          setIsLoading(false)
        }
      })

    return () => subscription.unsubscribe()
  }, [campaignId, db])

  const createNewEncounter = async () => {
    if (!campaignId || !newEncounterName.trim()) return

    try {
      const newEncounter = {
        id: `enc_${Date.now()}`,
        campaignId,
        name: newEncounterName.trim(),
        round: 1,
        currentTurn: 0,
        isActive: true,
        createdAt: Date.now(),
        updatedAt: Date.now()
      }

      await db.combatEncounters.insert(newEncounter)
      setShowCreateModal(false)
      setNewEncounterName('')
    } catch (error) {
      console.error('Error creando encuentro:', error)
      alert('Error al crear el encuentro')
    }
  }

  const deleteEncounter = async (encounterId: string, e: React.MouseEvent) => {
    e.stopPropagation()

    if (!confirm(t('combat.deleteConfirm'))) return

    try {
      // Eliminar combatientes asociados
      const combatants = await db.combatants
        .find({
          selector: { encounterId }
        })
        .exec()

      await Promise.all(combatants.map(c => c.remove()))

      // Eliminar encuentro
      const doc = await db.combatEncounters.findOne(encounterId).exec()
      if (doc) await doc.remove()
    } catch (error) {
      console.error('Error eliminando encuentro:', error)
    }
  }

  const openEncounter = (encounterId: string) => {
    navigate(`/campaign/${campaignId}/combat/${encounterId}`)
  }

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
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
      <div className="mb-8">
        <div className="flex justify-between items-end border-b border-slate-800 pb-6">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
              <Swords className="text-red-500" />
              {t('combat.title')}
            </h1>
            <p className="text-slate-400">{t('combat.description')}</p>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white px-5 py-2.5 rounded-lg font-medium transition-all shadow-lg shadow-red-500/20 active:scale-95"
          >
            <Plus size={20} />
            {t('combat.new')}
          </button>
        </div>
      </div>

      {/* Lista de encuentros */}
      <div className="space-y-4">
        {encounters.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center border-2 border-dashed border-slate-800 rounded-3xl bg-slate-900/20 text-slate-500">
            <div className="bg-slate-900 p-4 rounded-full mb-4">
              <Swords size={48} className="text-slate-700" />
            </div>
            <p className="text-lg font-medium text-slate-400">{t('combat.empty')}</p>
            <p className="text-sm opacity-60 mb-6">{t('combat.emptyHint')}</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              <Plus size={18} />
              {t('combat.create')}
            </button>
          </div>
        ) : (
          encounters.map((encounter) => (
            <div
              key={encounter.id}
              onClick={() => openEncounter(encounter.id)}
              className="group bg-slate-900 border border-slate-800 p-6 rounded-xl hover:border-red-500/50 hover:bg-slate-800/50 transition-all cursor-pointer relative overflow-hidden"
            >
              {/* Decoración */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-red-500/10 transition-colors"></div>

              <div className="relative z-10 flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold text-white group-hover:text-red-300 transition-colors">
                      {encounter.name}
                    </h3>
                    {encounter.isActive && (
                      <span className="flex items-center gap-1 text-xs bg-green-500/20 text-green-400 border border-green-500/30 px-2 py-1 rounded-full">
                        <Play size={12} className="animate-pulse" />
                        {t('combat.active')}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-6 text-sm text-slate-400">
                    <div className="flex items-center gap-2">
                      <Clock size={16} />
                      <span>{t('combat.round', { number: encounter.round })}</span>
                    </div>
                    <span className="text-slate-600">
                      {t('combat.created')}: {new Date(encounter.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <button
                  onClick={(e) => deleteEncounter(encounter.id, e)}
                  className="text-slate-600 hover:text-red-500 transition-colors p-2 hover:bg-red-500/10 rounded"
                  title="Eliminar encuentro"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal para crear encuentro */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">{t('combat.newEncounter')}</h2>
              <button
                onClick={() => {
                  setShowCreateModal(false)
                  setNewEncounterName('')
                }}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault()
                createNewEncounter()
              }}
              className="p-6 space-y-4"
            >
              <div>
                <label
                  htmlFor="encounterName"
                  className="block text-sm font-medium text-slate-300 mb-2"
                >
                  {t('combat.form.name')} *
                </label>
                <input
                  id="encounterName"
                  type="text"
                  value={newEncounterName}
                  onChange={(e) => setNewEncounterName(e.target.value)}
                  placeholder={t('combat.form.namePlaceholder')}
                  autoFocus
                  required
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false)
                    setNewEncounterName('')
                  }}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={!newEncounterName.trim()}
                  className="flex-1 bg-red-600 hover:bg-red-500 disabled:bg-slate-800 disabled:text-slate-600 text-white px-4 py-2.5 rounded-lg font-medium transition-colors disabled:cursor-not-allowed"
                >
                  {t('common.create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

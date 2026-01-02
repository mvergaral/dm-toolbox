import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDB } from '../context/DbContext'
import { useTranslation } from 'react-i18next'
import AddCombatantModal from '../components/combat/AddCombatantModal'
import EditCombatantModal from '../components/combat/EditCombatantModal'
import ConditionsManager from '../components/combat/ConditionsManager'
import BackButton from '../components/ui/BackButton'
import {
  Plus,
  ChevronRight,
  Trash2,
  Heart,
  Shield,
  Swords,
  User,
  Users,
  Edit2,
  FileText,
  Skull
} from 'lucide-react'
import type { RxDocument } from 'rxdb'

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

interface Combatant {
  id: string
  encounterId: string
  name: string
  initiative: number
  hp: number
  maxHp: number
  ac: number
  isNpc: boolean
  type?: 'npc' | 'monster' | 'character'
  isHostile?: boolean
  isDead?: boolean
  attacks: string
  conditions: string[]
  notes: string
  imageData: string
}

export default function CombatActive() {
  const { id: campaignId, encounterId } = useParams<{
    id: string
    encounterId: string
  }>()
  const navigate = useNavigate()
  const db = useDB()
  useTranslation()

  const [encounter, setEncounter] = useState<CombatEncounter | null>(null)
  const [combatants, setCombatants] = useState<Combatant[]>([])
  const [isLoading, setIsLoading] = useState(!!encounterId)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingCombatant, setEditingCombatant] = useState<Combatant | null>(null)
  const [hpChangeAmount, setHpChangeAmount] = useState<{ [key: string]: number | string }>({})
  const [expandedNotes, setExpandedNotes] = useState<{ [key: string]: boolean }>({})

  // Cargar encuentro
  useEffect(() => {
    if (!encounterId) return

    const subscription = db.combatEncounters.findOne(encounterId).$.subscribe({
      next: (doc: RxDocument<CombatEncounter>) => {
        if (doc) {
          setEncounter(doc.toJSON())
        } else {
          navigate(`/campaign/${campaignId}/combat`)
        }
        setIsLoading(false)
      },
      error: (error) => {
        console.error('Error cargando encuentro:', error)
        setIsLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [encounterId, db, navigate, campaignId])

  // Cargar combatientes
  useEffect(() => {
    if (!encounterId) return

    const subscription = db.combatants
      .find({
        selector: {
          encounterId: encounterId
        }
      })
      .$.subscribe({
        next: (docs: RxDocument<Combatant>[]) => {
          const sorted = docs.map((doc) => doc.toJSON()).sort((a, b) => b.initiative - a.initiative)
          setCombatants(sorted)
        },
        error: (error) => {
          console.error('Error cargando combatientes:', error)
        }
      })

    return () => subscription.unsubscribe()
  }, [encounterId, db])

  const nextTurn = async () => {
    if (!encounter || combatants.length === 0) return

    let nextTurnIndex = encounter.currentTurn
    let newRound = encounter.round
    let attempts = 0

    // Buscar el siguiente combatiente vivo
    do {
      nextTurnIndex = (nextTurnIndex + 1) % combatants.length
      if (nextTurnIndex === 0) newRound++
      attempts++
    } while (combatants[nextTurnIndex].isDead && attempts < combatants.length)

    // Si todos están muertos, avanzar normalmente al siguiente
    if (attempts >= combatants.length) {
      nextTurnIndex = (encounter.currentTurn + 1) % combatants.length
      newRound = nextTurnIndex === 0 ? encounter.round + 1 : encounter.round
    }

    try {
      const doc = await db.combatEncounters.findOne(encounter.id).exec()
      if (doc) {
        await doc.update({
          $set: {
            currentTurn: nextTurnIndex,
            round: newRound,
            updatedAt: Date.now()
          }
        })
      }
    } catch (error) {
      console.error('Error avanzando turno:', error)
    }
  }

  const previousTurn = async () => {
    if (!encounter || combatants.length === 0) return

    let prevTurnIndex = encounter.currentTurn
    let newRound = encounter.round
    let attempts = 0

    // Buscar el anterior combatiente vivo
    do {
      if (prevTurnIndex === 0) {
        prevTurnIndex = combatants.length - 1
        if (newRound > 1) newRound--
      } else {
        prevTurnIndex--
      }
      attempts++
    } while (combatants[prevTurnIndex].isDead && attempts < combatants.length)

    // Si todos están muertos, retroceder normalmente
    if (attempts >= combatants.length) {
      prevTurnIndex =
        encounter.currentTurn === 0 ? combatants.length - 1 : encounter.currentTurn - 1
      newRound =
        encounter.currentTurn === 0 && encounter.round > 1 ? encounter.round - 1 : encounter.round
    }

    try {
      const doc = await db.combatEncounters.findOne(encounter.id).exec()
      if (doc) {
        await doc.update({
          $set: {
            currentTurn: prevTurnIndex,
            round: newRound,
            updatedAt: Date.now()
          }
        })
      }
    } catch (error) {
      console.error('Error retrocediendo turno:', error)
    }
  }

  const updateHP = async (combatantId: string, newHp: number) => {
    try {
      const doc = await db.combatants.findOne(combatantId).exec()
      if (doc) {
        await doc.update({
          $set: {
            hp: Math.max(0, newHp)
          }
        })
      }
    } catch (error) {
      console.error('Error actualizando HP:', error)
    }
  }

  const toggleDead = async (combatantId: string, currentStatus: boolean) => {
    try {
      const doc = await db.combatants.findOne(combatantId).exec()
      if (doc) {
        await doc.update({
          $set: {
            isDead: !currentStatus
          }
        })
      }
    } catch (error) {
      console.error('Error cambiando estado muerto:', error)
    }
  }

  const deleteCombatant = async (combatantId: string) => {
    if (!confirm('¿Eliminar este combatiente?')) return

    try {
      const doc = await db.combatants.findOne(combatantId).exec()
      if (doc) await doc.remove()
    } catch (error) {
      console.error('Error eliminando combatante:', error)
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const addCombatant = async (combatant: any) => {
    try {
      await db.combatants.insert(combatant)
    } catch (error) {
      console.error('Error añadiendo combatiente:', error)
      throw error
    }
  }

  const saveCombatantEdits = async (updatedCombatant: Combatant) => {
    try {
      const doc = await db.combatants.findOne(updatedCombatant.id).exec()
      if (doc) {
        await doc.update({
          $set: {
            name: updatedCombatant.name,
            initiative: updatedCombatant.initiative,
            hp: updatedCombatant.hp,
            maxHp: updatedCombatant.maxHp,
            ac: updatedCombatant.ac,
            isNpc: updatedCombatant.isNpc,
            type: updatedCombatant.type,
            isHostile: updatedCombatant.isHostile,
            attacks: updatedCombatant.attacks,
            notes: updatedCombatant.notes
          }
        })
      }
    } catch (error) {
      console.error('Error guardando combatiente:', error)
      throw error
    }
  }

  const updateConditions = async (combatantId: string, newConditions: string[]) => {
    try {
      const doc = await db.combatants.findOne(combatantId).exec()
      if (doc) {
        await doc.update({
          $set: {
            conditions: newConditions
          }
        })
      }
    } catch (error) {
      console.error('Error actualizando condiciones:', error)
    }
  }

  const toggleNotes = (combatantId: string) => {
    setExpandedNotes((prev) => ({
      ...prev,
      [combatantId]: !prev[combatantId]
    }))
  }

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!encounter) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-slate-400">Encuentro no encontrado</p>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="mb-8">
        <div className="mb-6">
          <BackButton fallbackPath={`/campaign/${campaignId}/combat`} />
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-4">
              <div className="bg-red-500/10 p-3 rounded-xl">
                <Swords className="text-red-500" size={28} />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">{encounter.name}</h1>
                <p className="text-slate-400">Round {encounter.round}</p>
              </div>
            </div>

            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              <Plus size={20} />
              Añadir Combatiente
            </button>
          </div>

          {/* Controles de turno */}
          <div className="flex gap-3">
            <button
              onClick={previousTurn}
              disabled={combatants.length === 0}
              className="flex-1 bg-slate-800 hover:bg-slate-700 disabled:bg-slate-900 disabled:text-slate-600 text-white px-4 py-2.5 rounded-lg font-medium transition-colors disabled:cursor-not-allowed"
            >
              ← Turno Anterior
            </button>
            <button
              onClick={nextTurn}
              disabled={combatants.length === 0}
              className="flex-1 bg-red-600 hover:bg-red-500 disabled:bg-slate-900 disabled:text-slate-600 text-white px-4 py-2.5 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 disabled:cursor-not-allowed"
            >
              Siguiente Turno
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Lista de iniciativa */}
      <div className="space-y-3">
        {combatants.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center border-2 border-dashed border-slate-800 rounded-3xl bg-slate-900/20 text-slate-500">
            <div className="bg-slate-900 p-4 rounded-full mb-4">
              <Users size={48} className="text-slate-700" />
            </div>
            <p className="text-lg font-medium text-slate-400">No hay combatientes</p>
            <p className="text-sm opacity-60 mb-6">Añade PJs y NPCs para comenzar</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              <Plus size={18} />
              Añadir Combatiente
            </button>
          </div>
        ) : (
          combatants.map((combatant, index) => {
            const isCurrentTurn = index === encounter.currentTurn
            const hpPercentage = (combatant.hp / combatant.maxHp) * 100

            return (
              <div
                key={combatant.id}
                className={`group bg-slate-900 border rounded-xl p-4 transition-all ${
                  isCurrentTurn
                    ? 'border-red-500 shadow-lg shadow-red-500/20 scale-[1.02]'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-4">
                  {/* Avatar */}
                  <div
                    className={`flex-shrink-0 w-14 h-14 rounded-full overflow-hidden border-2 ${
                      combatant.isHostile ? 'border-red-500' : 'border-slate-700'
                    } bg-slate-800`}
                  >
                    {combatant.imageData ? (
                      <img
                        src={combatant.imageData}
                        alt={combatant.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-600">
                        {combatant.type === 'monster' ? (
                          <Skull size={20} />
                        ) : combatant.type === 'npc' ? (
                          <Users size={20} />
                        ) : combatant.isNpc ? (
                          <Swords size={20} />
                        ) : (
                          <User size={20} />
                        )}
                      </div>
                    )}
                  </div>

                  {/* Iniciativa */}
                  <div className="flex-shrink-0 w-16 h-16 bg-slate-800 rounded-xl flex items-center justify-center">
                    <span className="text-2xl font-bold text-white">{combatant.initiative}</span>
                  </div>

                  {/* Info del combatiente */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      {combatant.isHostile ? (
                        <Skull size={18} className="text-red-500 flex-shrink-0" />
                      ) : combatant.type === 'npc' ? (
                        <Users size={18} className="text-indigo-400 flex-shrink-0" />
                      ) : combatant.isNpc ? (
                        <Swords size={18} className="text-orange-400 flex-shrink-0" />
                      ) : (
                        <User size={18} className="text-blue-400 flex-shrink-0" />
                      )}
                      <h3
                        className={`text-lg font-bold truncate ${combatant.isHostile ? 'text-red-200' : 'text-white'} ${combatant.isDead ? 'line-through opacity-50' : ''}`}
                      >
                        {combatant.name}
                      </h3>
                      {isCurrentTurn && (
                        <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full font-medium animate-pulse">
                          TURNO
                        </span>
                      )}
                      {combatant.isDead && (
                        <span className="text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded-full font-medium">
                          MUERTO
                        </span>
                      )}
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1 text-slate-400">
                        <Shield size={14} />
                        <span>AC {combatant.ac}</span>
                      </div>
                      {combatant.attacks && (
                        <div className="text-slate-400 text-xs truncate">{combatant.attacks}</div>
                      )}
                    </div>

                    {/* Condiciones */}
                    <div className="mt-2">
                      <ConditionsManager
                        conditions={combatant.conditions}
                        onUpdate={(newConditions) => updateConditions(combatant.id, newConditions)}
                      />
                    </div>
                  </div>

                  {/* HP Controls */}
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="flex items-center gap-2 mb-1">
                        <Heart
                          size={16}
                          className={
                            combatant.hp === 0
                              ? 'text-red-500'
                              : hpPercentage <= 25
                                ? 'text-orange-400'
                                : 'text-green-400'
                          }
                        />
                        <span className="text-lg font-bold text-white">{combatant.hp}</span>
                        <span className="text-slate-500">/</span>
                        <span className="text-slate-400">{combatant.maxHp}</span>
                      </div>
                      <div className="w-32 h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all ${
                            combatant.hp === 0
                              ? 'bg-red-500'
                              : hpPercentage <= 25
                                ? 'bg-orange-400'
                                : 'bg-green-400'
                          }`}
                          style={{ width: `${Math.max(0, hpPercentage)}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1">
                      <div className="flex gap-1">
                        <input
                          type="number"
                          value={
                            hpChangeAmount[combatant.id] !== undefined
                              ? hpChangeAmount[combatant.id]
                              : 1
                          }
                          onChange={(e) => {
                            const val = e.target.value
                            setHpChangeAmount({
                              ...hpChangeAmount,
                              [combatant.id]: val === '' ? '' : parseInt(val)
                            })
                          }}
                          onFocus={(e) => e.target.select()}
                          min="1"
                          className="w-12 h-8 bg-slate-800 border border-slate-700 rounded text-white text-center text-sm focus:outline-none focus:ring-1 focus:ring-red-500"
                        />
                        <button
                          onClick={() => {
                            const amount = Number(hpChangeAmount[combatant.id] || 1)
                            updateHP(combatant.id, combatant.hp - amount)
                          }}
                          className="w-8 h-8 bg-slate-800 hover:bg-red-500 text-white rounded transition-colors text-sm font-medium"
                          title="Restar HP"
                        >
                          -
                        </button>
                        <button
                          onClick={() => {
                            const amount = Number(hpChangeAmount[combatant.id] || 1)
                            updateHP(combatant.id, combatant.hp + amount)
                          }}
                          className="w-8 h-8 bg-slate-800 hover:bg-green-500 text-white rounded transition-colors text-sm font-medium"
                          title="Sumar HP"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <button
                      onClick={() => setEditingCombatant(combatant)}
                      className="text-slate-600 hover:text-blue-400 transition-colors p-2 opacity-0 group-hover:opacity-100"
                      title="Editar combatiente"
                    >
                      <Edit2 size={18} />
                    </button>

                    <button
                      onClick={() => toggleDead(combatant.id, !!combatant.isDead)}
                      className={`transition-colors p-2 opacity-0 group-hover:opacity-100 ${combatant.isDead ? 'text-red-500 hover:text-slate-400' : 'text-slate-600 hover:text-red-500'}`}
                      title={combatant.isDead ? 'Revivir' : 'Marcar como muerto'}
                    >
                      <Skull size={18} />
                    </button>

                    {(combatant.attacks || combatant.notes) && (
                      <button
                        onClick={() => toggleNotes(combatant.id)}
                        className="text-slate-600 hover:text-indigo-400 transition-colors p-2"
                        title={
                          expandedNotes[combatant.id] ? 'Ocultar detalles' : 'Ver ataques/notas'
                        }
                      >
                        <FileText size={18} />
                      </button>
                    )}

                    <button
                      onClick={() => deleteCombatant(combatant.id)}
                      className="text-slate-600 hover:text-red-500 transition-colors p-2 opacity-0 group-hover:opacity-100"
                      title="Eliminar combatiente"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                {/* Sección expandible de ataques/notas */}
                {expandedNotes[combatant.id] && (combatant.attacks || combatant.notes) && (
                  <div className="mt-4 pt-4 border-t border-slate-800">
                    {combatant.attacks && (
                      <div className="mb-3">
                        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                          <Swords size={14} />
                          Ataques
                        </h4>
                        <p className="text-sm text-slate-300 whitespace-pre-wrap bg-slate-800/50 p-3 rounded-lg border border-slate-700/50">
                          {combatant.attacks}
                        </p>
                      </div>
                    )}
                    {combatant.notes && (
                      <div>
                        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                          <FileText size={14} />
                          Notas
                        </h4>
                        <p className="text-sm text-slate-300 whitespace-pre-wrap bg-slate-800/50 p-3 rounded-lg border border-slate-700/50">
                          {combatant.notes}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>

      {/* Modal para agregar combatiente */}
      {showAddModal && (
        <AddCombatantModal
          encounterId={encounterId!}
          campaignId={campaignId!}
          onClose={() => setShowAddModal(false)}
          onAdd={addCombatant}
        />
      )}

      {/* Modal para editar combatiente */}
      {editingCombatant && (
        <EditCombatantModal
          combatant={editingCombatant}
          onClose={() => setEditingCombatant(null)}
          onSave={saveCombatantEdits}
        />
      )}
    </div>
  )
}

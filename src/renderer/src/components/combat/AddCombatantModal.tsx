import { useState, useEffect } from 'react'
import { X, User, Swords, UserCheck, Skull, Users } from 'lucide-react'
import { useDB } from '../../context/DbContext'

interface Character {
  id: string
  name: string
  maxHp: number
  ac: number
  initiativeBonus: number
  isAlive: boolean
  imageData: string
}

interface Npc {
  id: string
  name: string
  hp: number
  ac: number
  attacks: string
  notes: string
  imageData: string
  type: 'npc' | 'monster'
  isHostile: boolean
}

interface AddCombatantModalProps {
  encounterId: string
  campaignId: string
  onClose: () => void
  onAdd: (combatant: {
    id: string
    encounterId: string
    name: string
    initiative: number
    hp: number
    maxHp: number
    ac: number
    isNpc: boolean
    type: 'npc' | 'monster' | 'character'
    isHostile: boolean
    attacks: string
    conditions: string[]
    notes: string
    imageData: string
  }) => Promise<void>
}

type TabType = 'characters' | 'npcs' | 'monsters'

export default function AddCombatantModal({
  encounterId,
  campaignId,
  onClose,
  onAdd
}: AddCombatantModalProps) {
  const db = useDB()
  const [activeTab, setActiveTab] = useState<TabType>('characters')
  const [characters, setCharacters] = useState<Character[]>([])
  const [npcs, setNpcs] = useState<Npc[]>([])
  const [monsters, setMonsters] = useState<Npc[]>([])
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null)

  const [name, setName] = useState('')
  const [initiative, setInitiative] = useState<number | string>('')
  const [initiativeBonus, setInitiativeBonus] = useState<number>(0)
  const [hp, setHp] = useState<number | string>(10)
  const [maxHp, setMaxHp] = useState<number | string>(10)
  const [ac, setAc] = useState<number | string>(10)
  const [isNpc, setIsNpc] = useState(true)
  const [type, setType] = useState<'npc' | 'monster' | 'character'>('npc')
  const [isHostile, setIsHostile] = useState(false)
  const [attacks, setAttacks] = useState('')
  const [notes, setNotes] = useState('')
  const [imageData, setImageData] = useState('')
  const [quantity, setQuantity] = useState<number>(1)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Cargar datos
  useEffect(() => {
    const loadData = async () => {
      try {
        // Cargar Personajes
        const charDocs = await db.characters
          .find({
            selector: {
              campaignId: campaignId,
              isAlive: true
            }
          })
          .exec()
        setCharacters(charDocs.map((doc) => doc.toJSON()))

        // Cargar NPCs y Monstruos
        const npcDocs = await db.npcs
          .find({
            selector: {
              campaignId: campaignId
            }
          })
          .exec()

        const allNpcs = npcDocs.map((doc) => doc.toJSON())
        setNpcs(allNpcs.filter((n) => n.type === 'npc' || !n.type)) // Compatibilidad con docs viejos
        setMonsters(allNpcs.filter((n) => n.type === 'monster'))
      } catch (error) {
        console.error('Error cargando datos:', error)
      }
    }

    loadData()
  }, [db, campaignId])

  const selectCharacter = (character: Character) => {
    setSelectedEntityId(character.id)
    setName(character.name)
    setMaxHp(character.maxHp)
    setHp(character.maxHp)
    setAc(character.ac)
    setInitiative('') // Reset roll
    setInitiativeBonus(character.initiativeBonus || 0)
    setImageData(character.imageData || '')
    setIsNpc(false)
    setType('character')
    setIsHostile(false)
    setAttacks('')
    setNotes('')
    setQuantity(1)
  }

  const selectNpcOrMonster = (entity: Npc) => {
    setSelectedEntityId(entity.id)
    setName(entity.name)
    setMaxHp(entity.hp)
    setHp(entity.hp)
    setAc(entity.ac)
    setInitiative(10) // Default average roll for NPCs
    setInitiativeBonus(0) // TODO: Add dex mod to NPC schema
    setImageData(entity.imageData || '')
    setIsNpc(true)
    setType(entity.type || 'npc')
    setIsHostile(entity.isHostile || false)
    setAttacks(entity.attacks || '')
    setNotes(entity.notes || '')
    setQuantity(1)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    setIsSubmitting(true)
    try {
      const totalInitiative = (Number(initiative) || 0) + initiativeBonus

      // Si es NPC/Monstruo y hay cantidad > 1, crear múltiples
      const count = isNpc && quantity > 1 ? quantity : 1

      for (let i = 0; i < count; i++) {
        const displayName = count > 1 ? `${name.trim()} ${i + 1}` : name.trim()

        await onAdd({
          id: `cbt_${Date.now()}_${i}`,
          encounterId,
          name: displayName,
          initiative: totalInitiative,
          hp: Number(hp),
          maxHp: Number(maxHp),
          ac: Number(ac),
          isNpc,
          type,
          isHostile,
          attacks: attacks.trim(),
          conditions: [],
          notes: notes.trim(),
          imageData
        })
      }
      onClose()
    } catch (error) {
      console.error('Error añadiendo combatiente:', error)
      alert('Error al añadir combatiente')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-slate-900 border-b border-slate-800 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Añadir Combatiente</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Selección rápida */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-3">
              Selección Rápida
            </label>

            {/* Tabs */}
            <div className="flex gap-2 mb-3">
              <button
                type="button"
                onClick={() => setActiveTab('characters')}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                  activeTab === 'characters'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                }`}
              >
                <UserCheck size={16} />
                PJs ({characters.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('npcs')}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                  activeTab === 'npcs'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                }`}
              >
                <Users size={16} />
                NPCs ({npcs.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('monsters')}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                  activeTab === 'monsters'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                }`}
              >
                <Skull size={16} />
                Monstruos ({monsters.length})
              </button>
            </div>

            {/* Lista de selección */}
            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 bg-slate-950/50 rounded-lg border border-slate-800">
              {activeTab === 'characters' &&
                characters.map((char) => (
                  <button
                    key={char.id}
                    type="button"
                    onClick={() => selectCharacter(char)}
                    className={`flex items-center gap-2 p-2 rounded-lg border transition-all text-left ${
                      selectedEntityId === char.id
                        ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300'
                        : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-600'
                    }`}
                  >
                    <User size={16} className="flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{char.name}</div>
                      <div className="text-xs text-slate-500">
                        HP: {char.maxHp} | AC: {char.ac}
                      </div>
                    </div>
                  </button>
                ))}

              {activeTab === 'npcs' &&
                npcs.map((npc) => (
                  <button
                    key={npc.id}
                    type="button"
                    onClick={() => selectNpcOrMonster(npc)}
                    className={`flex items-center gap-2 p-2 rounded-lg border transition-all text-left ${
                      selectedEntityId === npc.id
                        ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300'
                        : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-600'
                    }`}
                  >
                    <Users size={16} className="flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{npc.name}</div>
                      <div className="text-xs text-slate-500">
                        HP: {npc.hp} | AC: {npc.ac}
                      </div>
                    </div>
                  </button>
                ))}

              {activeTab === 'monsters' &&
                monsters.map((monster) => (
                  <button
                    key={monster.id}
                    type="button"
                    onClick={() => selectNpcOrMonster(monster)}
                    className={`flex items-center gap-2 p-2 rounded-lg border transition-all text-left ${
                      selectedEntityId === monster.id
                        ? 'bg-red-500/20 border-red-500 text-red-300'
                        : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-600'
                    }`}
                  >
                    <Skull size={16} className="flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{monster.name}</div>
                      <div className="text-xs text-slate-500">
                        HP: {monster.hp} | AC: {monster.ac}
                      </div>
                    </div>
                  </button>
                ))}

              {((activeTab === 'characters' && characters.length === 0) ||
                (activeTab === 'npcs' && npcs.length === 0) ||
                (activeTab === 'monsters' && monsters.length === 0)) && (
                <div className="col-span-2 py-4 text-center text-slate-500 text-sm">
                  No hay{' '}
                  {activeTab === 'characters'
                    ? 'personajes'
                    : activeTab === 'npcs'
                      ? 'NPCs'
                      : 'monstruos'}{' '}
                  disponibles
                </div>
              )}
            </div>
          </div>

          {/* Tipo: PJ/NPC */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-3">Tipo</label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsNpc(false)
                  setType('character')
                  setIsHostile(false)
                  setSelectedEntityId(null)
                }}
                className={`flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-all ${
                  !isNpc
                    ? 'bg-blue-500/20 border-blue-500 text-blue-300'
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'
                }`}
              >
                <User size={20} />
                <span className="font-medium">Jugador</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsNpc(true)
                  setType('npc')
                  setIsHostile(false)
                  setSelectedEntityId(null)
                }}
                className={`flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-all ${
                  isNpc && type === 'npc'
                    ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300'
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'
                }`}
              >
                <Users size={20} />
                <span className="font-medium">NPC</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsNpc(true)
                  setType('monster')
                  setIsHostile(true)
                  setSelectedEntityId(null)
                }}
                className={`flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-all ${
                  isNpc && type === 'monster'
                    ? 'bg-red-500/20 border-red-500 text-red-300'
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'
                }`}
              >
                <Skull size={20} />
                <span className="font-medium">Monstruo</span>
              </button>
            </div>
          </div>

          {/* Hostil Toggle (solo para NPCs/Monstruos) */}
          {isNpc && (
            <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg border border-slate-700">
              <div
                className={`p-2 rounded-lg ${isHostile ? 'bg-red-500/20 text-red-400' : 'bg-slate-700 text-slate-400'}`}
              >
                <Swords size={20} />
              </div>
              <div className="flex-1">
                <div className="font-medium text-slate-200">Hostil</div>
                <div className="text-xs text-slate-500">Marcar como enemigo en el combate</div>
              </div>
              <button
                type="button"
                onClick={() => setIsHostile(!isHostile)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  isHostile ? 'bg-red-600' : 'bg-slate-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isHostile ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          )}

          {/* Nombre y Cantidad */}
          <div className="flex gap-4">
            <div className="flex-1">
              <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-2">
                Nombre *
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nombre del combatiente"
                required
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>

            {isNpc && (
              <div className="w-24">
                <label htmlFor="quantity" className="block text-sm font-medium text-slate-300 mb-2">
                  Cantidad
                </label>
                <input
                  id="quantity"
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  min="1"
                  max="20"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white text-center focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
            )}
          </div>

          {/* Iniciativa */}
          <div>
            <label htmlFor="initiative" className="block text-sm font-medium text-slate-300 mb-2">
              Iniciativa (Tirada + Bonus) *
            </label>
            <div className="flex items-center gap-3">
              <div className="flex-1 relative">
                <input
                  id="initiative"
                  type="number"
                  value={initiative}
                  onChange={(e) =>
                    setInitiative(e.target.value === '' ? '' : Number(e.target.value))
                  }
                  onFocus={(e) => e.target.select()}
                  placeholder="Tirada d20"
                  min="0"
                  max="99"
                  required
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
              <div className="text-slate-400 font-bold">+</div>
              <div className="w-20">
                <input
                  type="number"
                  value={initiativeBonus}
                  onChange={(e) => setInitiativeBonus(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-white text-center focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  title="Bonus de Iniciativa"
                />
              </div>
              <div className="text-slate-400 font-bold">=</div>
              <div className="w-20 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2.5 text-white text-center font-bold">
                {(Number(initiative) || 0) + initiativeBonus}
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Ingresa el valor del dado, el bonus se sumará automáticamente.
            </p>
          </div>

          {/* HP y AC */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label htmlFor="hp" className="block text-sm font-medium text-slate-300 mb-2">
                HP Actual *
              </label>
              <input
                id="hp"
                type="number"
                value={hp}
                onChange={(e) => setHp(e.target.value === '' ? '' : Number(e.target.value))}
                onFocus={(e) => e.target.select()}
                min="0"
                required
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
            <div>
              <label htmlFor="maxHp" className="block text-sm font-medium text-slate-300 mb-2">
                HP Máximo *
              </label>
              <input
                id="maxHp"
                type="number"
                value={maxHp}
                onChange={(e) => {
                  const val = e.target.value
                  if (val === '') {
                    setMaxHp('')
                  } else {
                    const newMax = Number(val)
                    setMaxHp(newMax)
                    if (Number(hp) > newMax) setHp(newMax)
                  }
                }}
                onFocus={(e) => e.target.select()}
                min="1"
                required
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
            <div>
              <label htmlFor="ac" className="block text-sm font-medium text-slate-300 mb-2">
                AC *
              </label>
              <input
                id="ac"
                type="number"
                value={ac}
                onChange={(e) => setAc(e.target.value === '' ? '' : Number(e.target.value))}
                onFocus={(e) => e.target.select()}
                min="0"
                required
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Ataques (solo para NPCs) */}
          {isNpc && (
            <div>
              <label htmlFor="attacks" className="block text-sm font-medium text-slate-300 mb-2">
                Ataques
              </label>
              <input
                id="attacks"
                type="text"
                value={attacks}
                onChange={(e) => setAttacks(e.target.value)}
                placeholder="Ej: Espada +5 (1d8+3), Mordisco +3 (1d6+1)"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
              <p className="mt-1 text-xs text-slate-500">
                Información rápida sobre los ataques del monstruo
              </p>
            </div>
          )}

          {/* Notas */}
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-slate-300 mb-2">
              Notas
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notas adicionales..."
              rows={3}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 bg-slate-800 hover:bg-slate-700 disabled:bg-slate-800 disabled:text-slate-600 text-white px-4 py-2.5 rounded-lg font-medium transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !name.trim()}
              className="flex-1 bg-red-600 hover:bg-red-500 disabled:bg-slate-800 disabled:text-slate-600 text-white px-4 py-2.5 rounded-lg font-medium transition-colors disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Añadiendo...' : 'Añadir'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

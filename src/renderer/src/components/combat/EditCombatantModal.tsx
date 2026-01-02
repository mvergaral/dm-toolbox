import { useState, useEffect } from 'react'
import { X, User, Swords, Skull, Users } from 'lucide-react'

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
  attacks: string
  conditions: string[]
  notes: string
  imageData: string
}

interface EditCombatantModalProps {
  combatant: Combatant
  onClose: () => void
  onSave: (combatant: Combatant) => Promise<void>
}

export default function EditCombatantModal({
  combatant,
  onClose,
  onSave
}: EditCombatantModalProps) {
  const [name, setName] = useState(combatant.name)
  const [initiative, setInitiative] = useState<number | string>(combatant.initiative)
  const [hp, setHp] = useState<number | string>(combatant.hp)
  const [maxHp, setMaxHp] = useState<number | string>(combatant.maxHp)
  const [ac, setAc] = useState<number | string>(combatant.ac)
  const [isNpc, setIsNpc] = useState(combatant.isNpc)
  const [type, setType] = useState<'npc' | 'monster' | 'character'>(
    combatant.type || (combatant.isNpc ? 'npc' : 'character')
  )
  const [isHostile, setIsHostile] = useState(combatant.isHostile || false)
  const [attacks, setAttacks] = useState(combatant.attacks)
  const [notes, setNotes] = useState(combatant.notes)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    setName(combatant.name)
    setInitiative(combatant.initiative)
    setHp(combatant.hp)
    setMaxHp(combatant.maxHp)
    setAc(combatant.ac)
    setIsNpc(combatant.isNpc)
    setType(combatant.type || (combatant.isNpc ? 'npc' : 'character'))
    setIsHostile(combatant.isHostile || false)
    setAttacks(combatant.attacks)
    setNotes(combatant.notes)
  }, [combatant])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    setIsSubmitting(true)
    try {
      await onSave({
        ...combatant,
        name: name.trim(),
        initiative: Number(initiative),
        hp: Number(hp),
        maxHp: Number(maxHp),
        ac: Number(ac),
        isNpc,
        type,
        isHostile,
        attacks: attacks.trim(),
        notes: notes.trim()
      })
      onClose()
    } catch (error) {
      console.error('Error guardando cambios:', error)
      alert('Error al guardar cambios')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-slate-900 border-b border-slate-800 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Editar Combatiente</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
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

          {/* Nombre */}
          <div>
            <label htmlFor="edit-name" className="block text-sm font-medium text-slate-300 mb-2">
              Nombre *
            </label>
            <input
              id="edit-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nombre del combatiente"
              required
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>

          {/* Iniciativa */}
          <div>
            <label
              htmlFor="edit-initiative"
              className="block text-sm font-medium text-slate-300 mb-2"
            >
              Iniciativa *
            </label>
            <input
              id="edit-initiative"
              type="number"
              value={initiative}
              onChange={(e) => setInitiative(e.target.value === '' ? '' : Number(e.target.value))}
              onFocus={(e) => e.target.select()}
              min="0"
              max="99"
              required
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>

          {/* HP y AC */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label htmlFor="edit-hp" className="block text-sm font-medium text-slate-300 mb-2">
                HP Actual *
              </label>
              <input
                id="edit-hp"
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
              <label htmlFor="edit-maxHp" className="block text-sm font-medium text-slate-300 mb-2">
                HP Máximo *
              </label>
              <input
                id="edit-maxHp"
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
              <label htmlFor="edit-ac" className="block text-sm font-medium text-slate-300 mb-2">
                AC *
              </label>
              <input
                id="edit-ac"
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
              <label
                htmlFor="edit-attacks"
                className="block text-sm font-medium text-slate-300 mb-2"
              >
                Ataques
              </label>
              <input
                id="edit-attacks"
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
            <label htmlFor="edit-notes" className="block text-sm font-medium text-slate-300 mb-2">
              Notas
            </label>
            <textarea
              id="edit-notes"
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
              {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

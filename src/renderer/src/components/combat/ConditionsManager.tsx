import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { X, Plus, Skull, Flame, Droplet, Eye, Zap, Shield, Heart, Brain, Wind } from 'lucide-react'

interface ConditionsManagerProps {
  conditions: string[]
  onUpdate: (newConditions: string[]) => void
}

// Condiciones predefinidas con colores e iconos
const PREDEFINED_CONDITIONS = [
  { id: 'stunned', icon: Brain, color: 'purple' },
  { id: 'poisoned', icon: Droplet, color: 'green' },
  { id: 'blinded', icon: Eye, color: 'yellow' },
  { id: 'burning', icon: Flame, color: 'red' },
  { id: 'paralyzed', icon: Zap, color: 'blue' },
  { id: 'frightened', icon: Skull, color: 'pink' },
  { id: 'protected', icon: Shield, color: 'indigo' },
  { id: 'blessed', icon: Heart, color: 'orange' },
  { id: 'slowed', icon: Wind, color: 'blue' }
]

const CONDITION_COLORS: Record<string, {
  bg: string
  text: string
  border: string
  hover: string
}> = {
  purple: {
    bg: 'bg-purple-500/10',
    text: 'text-purple-400',
    border: 'border-purple-500/30',
    hover: 'hover:bg-purple-500/20'
  },
  green: {
    bg: 'bg-green-500/10',
    text: 'text-green-400',
    border: 'border-green-500/30',
    hover: 'hover:bg-green-500/20'
  },
  yellow: {
    bg: 'bg-yellow-500/10',
    text: 'text-yellow-400',
    border: 'border-yellow-500/30',
    hover: 'hover:bg-yellow-500/20'
  },
  red: {
    bg: 'bg-red-500/10',
    text: 'text-red-400',
    border: 'border-red-500/30',
    hover: 'hover:bg-red-500/20'
  },
  blue: {
    bg: 'bg-blue-500/10',
    text: 'text-blue-400',
    border: 'border-blue-500/30',
    hover: 'hover:bg-blue-500/20'
  },
  pink: {
    bg: 'bg-pink-500/10',
    text: 'text-pink-400',
    border: 'border-pink-500/30',
    hover: 'hover:bg-pink-500/20'
  },
  indigo: {
    bg: 'bg-indigo-500/10',
    text: 'text-indigo-400',
    border: 'border-indigo-500/30',
    hover: 'hover:bg-indigo-500/20'
  },
  orange: {
    bg: 'bg-orange-500/10',
    text: 'text-orange-400',
    border: 'border-orange-500/30',
    hover: 'hover:bg-orange-500/20'
  }
}

export default function ConditionsManager({ conditions, onUpdate }: ConditionsManagerProps) {
  const { t } = useTranslation()
  const [showPicker, setShowPicker] = useState(false)
  const [customCondition, setCustomCondition] = useState('')

  const addCondition = (conditionName: string) => {
    if (!conditions.includes(conditionName)) {
      onUpdate([...conditions, conditionName])
    }
    setShowPicker(false)
  }

  const removeCondition = (conditionName: string) => {
    onUpdate(conditions.filter(c => c !== conditionName))
  }

  const addCustomCondition = () => {
    if (customCondition.trim() && !conditions.includes(customCondition.trim())) {
      onUpdate([...conditions, customCondition.trim()])
      setCustomCondition('')
      setShowPicker(false)
    }
  }

  const getConditionColor = (conditionName: string): string => {
    const predefined = PREDEFINED_CONDITIONS.find(c => t(`combat.conditions.${c.id}`) === conditionName)
    return predefined?.color || 'indigo'
  }

  const getConditionIcon = (conditionName: string) => {
    const predefined = PREDEFINED_CONDITIONS.find(c => t(`combat.conditions.${c.id}`) === conditionName)
    return predefined?.icon || Shield
  }

  return (
    <div className="relative">
      {/* Condiciones actuales */}
      <div className="flex flex-wrap gap-1.5 mb-2">
        {conditions.map((condition) => {
          const colorKey = getConditionColor(condition)
          const colors = CONDITION_COLORS[colorKey]
          const Icon = getConditionIcon(condition)

          return (
            <span
              key={condition}
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${colors.bg} ${colors.text} ${colors.border}`}
            >
              <Icon size={12} />
              {condition}
              <button
                onClick={() => removeCondition(condition)}
                className={`ml-1 ${colors.hover} rounded-full p-0.5 transition-colors`}
              >
                <X size={10} />
              </button>
            </span>
          )
        })}

        {/* Botón para agregar */}
        <button
          onClick={() => setShowPicker(!showPicker)}
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border border-slate-700 bg-slate-800/50 text-slate-400 hover:bg-slate-700 hover:text-white transition-colors"
          title={t('combat.conditionsManager.addConditionTitle')}
        >
          <Plus size={12} />
          {t('combat.conditionsManager.addCondition')}
        </button>
      </div>

      {/* Picker de condiciones */}
      {showPicker && (
        <div className="absolute top-full left-0 mt-2 z-50 bg-slate-900 border border-slate-700 rounded-lg shadow-xl p-3 min-w-[280px]">
          <p className="text-xs text-slate-400 mb-2 font-medium">{t('combat.conditionsManager.selectCondition')}</p>

          <div className="flex flex-wrap gap-1.5 mb-3">
            {PREDEFINED_CONDITIONS.map(({ id, icon: Icon, color }) => {
              const name = t(`combat.conditions.${id}`)
              const colors = CONDITION_COLORS[color]
              const isActive = conditions.includes(name)

              return (
                <button
                  key={id}
                  onClick={() => addCondition(name)}
                  disabled={isActive}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                    isActive
                      ? 'opacity-50 cursor-not-allowed bg-slate-800 border-slate-700 text-slate-500'
                      : `${colors.bg} ${colors.text} ${colors.border} ${colors.hover}`
                  }`}
                >
                  <Icon size={14} />
                  {name}
                </button>
              )
            })}
          </div>

          <div className="border-t border-slate-800 pt-3">
            <p className="text-xs text-slate-400 mb-2 font-medium">{t('combat.conditionsManager.createCustom')}</p>
            <div className="flex gap-2">
              <input
                type="text"
                value={customCondition}
                onChange={(e) => setCustomCondition(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') addCustomCondition()
                  if (e.key === 'Escape') setShowPicker(false)
                }}
                placeholder={t('combat.conditionsManager.customPlaceholder')}
                className="flex-1 bg-slate-800 border border-slate-700 rounded px-2 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                autoFocus
              />
              <button
                onClick={addCustomCondition}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs font-medium transition-colors"
              >
                {t('combat.conditionsManager.add')}
              </button>
            </div>
          </div>

          <button
            onClick={() => setShowPicker(false)}
            className="mt-2 w-full px-2 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded text-xs transition-colors"
          >
            {t('combat.conditionsManager.close')}
          </button>
        </div>
      )}
    </div>
  )
}

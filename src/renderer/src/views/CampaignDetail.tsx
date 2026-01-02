import { useEffect, useState } from 'react'
import { useParams, useNavigate, Navigate } from 'react-router-dom'
import { useDB } from '../context/DbContext'
import { useTranslation } from 'react-i18next'
import BackButton from '../components/ui/BackButton'
import { TAG_COLOR_CLASSES } from '../utils/tagColors'
import { Swords, Map, Users, AlertCircle, UserCheck, Calendar, Skull } from 'lucide-react'

interface Campaign {
  id: string
  name: string
  system: string
  systemColor: string
  description: string
  createdAt: number
  backgroundImage?: string
}

interface ModuleCard {
  title: string
  description: string
  icon: React.ElementType
  iconColor: string
  path: string
  disabled?: boolean
}

export default function CampaignDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const db = useDB()
  const { t, i18n } = useTranslation()

  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!id) {
      setNotFound(true)
      return
    }

    const loadCampaign = async () => {
      try {
        const doc = await db.campaigns.findOne(id).exec()

        if (doc) {
          setCampaign(doc.toJSON())
        } else {
          setNotFound(true)
        }
      } catch (error) {
        console.error('Error cargando campaña:', error)
        setNotFound(true)
      } finally {
        setIsLoading(false)
      }
    }

    loadCampaign()
  }, [id, db])

  // Redirección si la campaña no existe
  if (notFound) {
    return <Navigate to="/campaigns" replace />
  }

  // Estado de carga
  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  // No debería llegar aquí si está cargando o no encontrado, pero TypeScript lo requiere
  if (!campaign) {
    return null
  }

  const modules: ModuleCard[] = [
    {
      title: t('campaigns.detail.combatTracker.title'),
      description: t('campaigns.detail.combatTracker.description'),
      icon: Swords,
      iconColor: 'text-red-500',
      path: `/campaign/${id}/combat`,
      disabled: false
    },
    {
      title: t('campaigns.detail.characters.title'),
      description: t('campaigns.detail.characters.description'),
      icon: UserCheck,
      iconColor: 'text-indigo-500',
      path: `/campaign/${id}/characters`,
      disabled: false
    },
    {
      title: t('campaigns.detail.npcs.title'),
      description: t('campaigns.detail.npcs.description'),
      icon: Users,
      iconColor: 'text-purple-500',
      path: `/campaign/${id}/npcs`,
      disabled: false
    },
    {
      title: t('monsters.title'),
      description: t('monsters.description'),
      icon: Skull,
      iconColor: 'text-red-500',
      path: `/campaign/${id}/monsters`,
      disabled: false
    },
    {
      title: t('campaigns.detail.sessions.title'),
      description: t('campaigns.detail.sessions.description'),
      icon: Calendar,
      iconColor: 'text-blue-500',
      path: `/campaign/${id}/sessions`,
      disabled: false
    },
    {
      title: t('campaigns.detail.maps.title'),
      description: t('campaigns.detail.maps.description'),
      icon: Map,
      iconColor: 'text-green-500',
      path: `/campaign/${id}/maps`,
      disabled: true
    }
  ]

  return (
    <div className="p-8 max-w-7xl mx-auto w-full">
      {/* Header con navegación */}
      <div className="mb-8">
        <div className="mb-6">
          <BackButton fallbackPath="/campaigns" />
        </div>

        {/* Banner Image */}
        {campaign.backgroundImage && (
          <div className="w-full h-64 rounded-2xl overflow-hidden mb-6 relative shadow-2xl shadow-black/50 group">
            <img
              src={campaign.backgroundImage}
              alt={campaign.name}
              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>

            <div className="absolute bottom-0 left-0 p-8 w-full">
              <div className="flex items-end justify-between">
                <div>
                  <h1 className="text-5xl font-bold text-white mb-3 drop-shadow-lg tracking-tight">
                    {campaign.name}
                  </h1>
                  <span
                    className={`text-xs font-bold bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded uppercase tracking-wider shadow-lg border ${
                      TAG_COLOR_CLASSES[campaign.systemColor]?.text || TAG_COLOR_CLASSES.indigo.text
                    } ${
                      TAG_COLOR_CLASSES[campaign.systemColor]?.border ||
                      TAG_COLOR_CLASSES.indigo.border
                    }`}
                  >
                    {campaign.system}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="border-b border-slate-800 pb-6">
          {!campaign.backgroundImage && (
            <div className="flex items-start justify-between mb-3">
              <h1 className="text-4xl font-bold text-white">{campaign.name}</h1>
              <span
                className={`text-xs font-bold bg-slate-950 px-3 py-1.5 rounded uppercase tracking-wider border ${
                  TAG_COLOR_CLASSES[campaign.systemColor]?.text || TAG_COLOR_CLASSES.indigo.text
                } ${
                  TAG_COLOR_CLASSES[campaign.systemColor]?.border || TAG_COLOR_CLASSES.indigo.border
                }`}
              >
                {campaign.system}
              </span>
            </div>
          )}
          <p className="text-slate-400 text-lg leading-relaxed max-w-3xl">{campaign.description}</p>
          <p className="text-slate-600 text-sm mt-4 flex items-center gap-2">
            <Calendar size={14} />
            {t('campaigns.detail.createdAt')}{' '}
            {new Date(campaign.createdAt).toLocaleDateString(i18n.language, {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </div>
      </div>

      {/* Grid de módulos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {modules.map((module) => (
          <button
            key={module.title}
            onClick={() => !module.disabled && navigate(module.path)}
            disabled={module.disabled}
            className={`
              group relative p-8 rounded-2xl border transition-all duration-300
              ${
                module.disabled
                  ? 'bg-slate-900/50 border-slate-800 cursor-not-allowed opacity-60'
                  : 'bg-slate-900 border-slate-800 hover:border-indigo-500/50 hover:bg-slate-800/50 cursor-pointer active:scale-[0.98]'
              }
            `}
          >
            {/* Decoración de fondo */}
            <div
              className={`
              absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl -mr-16 -mt-16 transition-opacity
              ${module.disabled ? 'opacity-0' : 'opacity-0 group-hover:opacity-100'}
              ${module.iconColor === 'text-red-500' ? 'bg-red-500/10' : ''}
              ${module.iconColor === 'text-green-500' ? 'bg-green-500/10' : ''}
              ${module.iconColor === 'text-blue-500' ? 'bg-blue-500/10' : ''}
            `}
            ></div>

            <div className="relative z-10">
              {/* Icono */}
              <div
                className={`
                mb-6 w-16 h-16 rounded-xl flex items-center justify-center transition-all
                ${module.disabled ? 'bg-slate-800/50' : 'bg-slate-950 group-hover:scale-110'}
              `}
              >
                <module.icon
                  size={32}
                  className={module.disabled ? 'text-slate-700' : module.iconColor}
                />
              </div>

              {/* Contenido */}
              <h3
                className={`
                text-xl font-bold mb-2 transition-colors
                ${module.disabled ? 'text-slate-600' : 'text-white group-hover:text-indigo-300'}
              `}
              >
                {module.title}
              </h3>

              <p className="text-slate-500 text-sm leading-relaxed">{module.description}</p>

              {/* Badge "Próximamente" */}
              {module.disabled && (
                <div className="mt-4 inline-flex items-center gap-2 text-xs text-amber-500 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                  <AlertCircle size={14} />
                  <span>Próximamente</span>
                </div>
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Información adicional */}
      <div className="mt-8 p-6 bg-slate-900/50 border border-slate-800 rounded-xl">
        <p className="text-slate-500 text-sm">
          💡 <span className="font-semibold text-slate-400">Tip:</span> {t('campaigns.detail.tip')}
        </p>
      </div>
    </div>
  )
}

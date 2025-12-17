import { useTranslation, Trans } from 'react-i18next'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDB } from '../context/DbContext'
import {
  Plus,
  Calendar,
  Swords,
  Users,
  ArrowRight,
  BookOpen,
  Settings
} from 'lucide-react'
import logo from '../assets/logo.svg'

interface Campaign {
  id: string
  name: string
  system: string
  systemColor: string
  description: string
  backgroundImage?: string
  createdAt: number
}

interface Session {
  id: string
  campaignId: string
  title: string
  sessionNumber: number
  date: number
  status: 'planned' | 'completed' | 'cancelled'
}

interface SessionWithCampaign extends Session {
  campaignName: string
  systemColor: string
}

export default function Dashboard() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const db = useDB()

  const [recentCampaigns, setRecentCampaigns] = useState<Campaign[]>([])
  const [upcomingSessions, setUpcomingSessions] = useState<SessionWithCampaign[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!db) return

    const loadData = async () => {
      try {
        // Cargar todas las campañas para lookup
        const allCampaigns = await db.campaigns.find().exec()
        const campaignMap = allCampaigns.reduce((acc, doc) => {
          acc[doc.id] = { name: doc.name, color: doc.systemColor }
          return acc
        }, {} as Record<string, { name: string, color: string }>)

        // Cargar campañas recientes
        const campaigns = await db.campaigns
          .find({
            sort: [{ createdAt: 'desc' }],
            limit: 3
          })
          .exec()

        setRecentCampaigns(campaigns.map(doc => doc.toJSON() as Campaign))

        // Cargar próximas sesiones
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        const sessions = await db.sessions.find({
          selector: {
            date: { $gte: today.getTime() },
            status: 'planned'
          },
          sort: [{ date: 'asc' }],
          limit: 5
        }).exec()

        setUpcomingSessions(sessions.map(doc => {
          const data = doc.toJSON() as Session
          const campaignInfo = campaignMap[data.campaignId] || { name: 'Unknown', color: 'indigo' }
          return {
            ...data,
            campaignName: campaignInfo.name,
            systemColor: campaignInfo.color
          }
        }))

        setIsLoading(false)
      } catch (error) {
        console.error('Error loading dashboard data:', error)
        setIsLoading(false)
      }
    }

    loadData()
  }, [db])

  const getColorClass = (color: string) => {
    const colors: Record<string, string> = {
      indigo: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
      red: 'bg-red-500/20 text-red-400 border-red-500/30',
      green: 'bg-green-500/20 text-green-400 border-green-500/30',
      blue: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      yellow: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      purple: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      pink: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
      orange: 'bg-orange-500/20 text-orange-400 border-orange-500/30'
    }
    return colors[color] || colors.indigo
  }

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  // Vista de Onboarding (Sin campañas)
  if (recentCampaigns.length === 0) {
    return (
      <div className="p-8 max-w-5xl mx-auto w-full h-full flex flex-col items-center justify-center text-center">
        <div className="w-32 h-32 bg-indigo-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-indigo-500/30 mb-8 animate-in zoom-in duration-500">
          <img src={logo} alt="DM Toolbox" className="w-20 h-20" />
        </div>

        <h1 className="text-5xl font-bold text-white mb-6 tracking-tight">
          {t('dashboard.welcome')}
        </h1>

        <p className="text-slate-400 text-xl max-w-2xl mx-auto mb-12 leading-relaxed">
          {t('app.subtitle')}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl mb-12">
          <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl">
            <div className="w-12 h-12 bg-indigo-500/20 text-indigo-400 rounded-xl flex items-center justify-center mb-4 mx-auto">
              <BookOpen size={24} />
            </div>
            <h3 className="text-white font-bold mb-2">{t('nav.campaigns')}</h3>
            <p className="text-slate-500 text-sm">Organiza tus aventuras, notas y sesiones en un solo lugar.</p>
          </div>
          <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl">
            <div className="w-12 h-12 bg-red-500/20 text-red-400 rounded-xl flex items-center justify-center mb-4 mx-auto">
              <Swords size={24} />
            </div>
            <h3 className="text-white font-bold mb-2">Combat Tracker</h3>
            <p className="text-slate-500 text-sm">Gestiona iniciativas y turnos de forma fluida y rápida.</p>
          </div>
          <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl">
            <div className="w-12 h-12 bg-purple-500/20 text-purple-400 rounded-xl flex items-center justify-center mb-4 mx-auto">
              <Users size={24} />
            </div>
            <h3 className="text-white font-bold mb-2">NPCs & Monstruos</h3>
            <p className="text-slate-500 text-sm">Crea y administra personajes y enemigos para tus encuentros.</p>
          </div>
        </div>

        <button
          onClick={() => navigate('/campaigns', { state: { openCreateModal: true } })}
          className="group relative inline-flex items-center gap-3 bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-1"
        >
          <Plus size={24} />
          {t('campaigns.createFirst')}
          <span className="absolute inset-0 rounded-xl ring-2 ring-white/20 group-hover:ring-white/40 transition-all"></span>
        </button>
      </div>
    )
  }

  // Dashboard Principal
  return (
    <div className="p-8 max-w-7xl mx-auto w-full space-y-8">
      {/* Header & Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Welcome Card */}
        <div className="lg:col-span-4 bg-gradient-to-br from-indigo-900/50 to-slate-900 border border-indigo-500/20 rounded-2xl p-6 flex flex-col justify-center relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
          <div className="relative z-10">
            <h1 className="text-3xl font-bold text-white mb-2">
              {t('dashboard.welcome')}
            </h1>
            <p className="text-indigo-200/80 mb-6 max-w-md">
              {t('app.subtitle')}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => navigate('/campaigns', { state: { openCreateModal: true } })}
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors flex items-center gap-2 shadow-lg shadow-indigo-500/20"
              >
                <Plus size={16} />
                {t('campaigns.new')}
              </button>
              <button
                onClick={() => navigate('/campaigns')}
                className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors border border-slate-700"
              >
                {t('nav.campaigns')}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Sessions & Campaigns */}
        <div className="lg:col-span-2 space-y-8">

          {/* Upcoming Sessions */}
          <div>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Calendar className="text-indigo-400" size={24} />
              {t('dashboard.upcomingSessions')}
            </h2>

            {upcomingSessions.length > 0 ? (
              <div className="space-y-3">
                {upcomingSessions.map((session) => (
                  <div
                    key={session.id}
                    onClick={() => navigate(`/campaign/${session.campaignId}/sessions/${session.id}`)}
                    className="bg-slate-900 border border-slate-800 hover:border-indigo-500/50 p-4 rounded-xl cursor-pointer transition-all group flex items-center gap-4"
                  >
                    <div className="flex-shrink-0 w-16 h-16 bg-slate-800 rounded-lg flex flex-col items-center justify-center border border-slate-700 group-hover:border-indigo-500/30 transition-colors">
                      <span className="text-xs text-slate-400 uppercase font-bold">
                        {new Date(session.date).toLocaleDateString(i18n.language, { month: 'short' })}
                      </span>
                      <span className="text-2xl font-bold text-white">
                        {new Date(session.date).getDate()}
                      </span>
                    </div>

                    <div className="flex-grow">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs px-2 py-0.5 rounded border ${getColorClass(session.systemColor)}`}>
                          {session.campaignName}
                        </span>
                        <span className="text-xs text-slate-500">
                          {t('sessions.sessionNumber', { number: session.sessionNumber })}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-white group-hover:text-indigo-400 transition-colors">
                        {session.title}
                      </h3>
                    </div>

                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-800 text-slate-500 group-hover:bg-indigo-500/20 group-hover:text-indigo-400 transition-all">
                      <ArrowRight size={20} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-slate-900/50 border border-slate-800 border-dashed rounded-xl p-8 text-center">
                <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-600">
                  <Calendar size={24} />
                </div>
                <p className="text-slate-400 mb-4">{t('dashboard.noUpcomingSessions')}</p>
                <button
                  onClick={() => navigate('/campaigns')}
                  className="text-indigo-400 hover:text-indigo-300 text-sm font-medium transition-colors"
                >
                  {t('dashboard.scheduleSession')}
                </button>
              </div>
            )}
          </div>

          {/* Recent Campaigns */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <BookOpen className="text-indigo-400" size={24} />
                {t('dashboard.recentCampaigns')}
              </h2>
              <button
                onClick={() => navigate('/campaigns')}
                className="text-sm text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
              >
                {t('common.viewAll')} <ArrowRight size={16} />
              </button>
            </div>

            <div className="grid gap-4">
              {recentCampaigns.map((campaign) => (
                <div
                  key={campaign.id}
                  onClick={() => navigate(`/campaign/${campaign.id}`)}
                  className="relative h-32 rounded-xl overflow-hidden cursor-pointer group border border-slate-800 hover:border-indigo-500/50 transition-all shadow-lg shadow-black/20"
                >
                  {/* Background Image */}
                  {campaign.backgroundImage ? (
                    <img
                      src={campaign.backgroundImage}
                      alt={campaign.name}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-r from-slate-900 to-slate-800">
                        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-indigo-500/40 via-transparent to-transparent"></div>
                    </div>
                  )}

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/70 to-transparent/10"></div>

                  {/* Content */}
                  <div className="absolute inset-0 p-5 flex flex-col justify-center z-10">
                    <div className="flex items-center gap-2 mb-2">
                       <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${getColorClass(campaign.systemColor)} bg-slate-950/50 backdrop-blur-sm`}>
                          {campaign.system}
                       </span>
                       <span className="text-xs text-slate-500 flex items-center gap-1">
                          <Calendar size={10} />
                          {new Date(campaign.createdAt).toLocaleDateString(i18n.language, {
                            month: 'short',
                            day: 'numeric'
                          })}
                       </span>
                    </div>
                    <h3 className="text-xl font-bold text-white group-hover:text-indigo-300 transition-colors mb-1 truncate max-w-[85%]">
                      {campaign.name}
                    </h3>
                    <p className="text-slate-400 text-sm line-clamp-1 max-w-[75%]">
                      {campaign.description || t('campaigns.form.defaultDescription')}
                    </p>
                  </div>

                  {/* Arrow Icon */}
                  <div className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-500 group-hover:text-indigo-400 transition-colors bg-slate-950/30 p-2 rounded-full backdrop-blur-sm border border-white/5 group-hover:border-indigo-500/30 group-hover:translate-x-1 duration-300">
                    <ArrowRight size={20} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Quick Actions & Tips */}
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-bold text-white mb-4">{t('dashboard.quickActions.title')}</h2>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-2 space-y-1">
              <button
                onClick={() => navigate('/campaigns', { state: { openCreateModal: true } })}
                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800 text-left transition-colors group"
              >
                <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg group-hover:bg-indigo-500/20 transition-colors">
                  <Plus size={20} />
                </div>
                <div>
                  <span className="block text-white font-medium">{t('campaigns.new')}</span>
                  <span className="text-xs text-slate-400">{t('dashboard.quickActions.createCampaignDesc')}</span>
                </div>
              </button>

              <button
                onClick={() => navigate('/settings')}
                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800 text-left transition-colors group"
              >
                <div className="p-2 bg-slate-700/30 text-slate-400 rounded-lg group-hover:bg-slate-700/50 transition-colors">
                  <Settings size={20} />
                </div>
                <div>
                  <span className="block text-white font-medium">{t('nav.settings')}</span>
                  <span className="text-xs text-slate-400">{t('dashboard.quickActions.settingsDesc')}</span>
                </div>
              </button>
            </div>
          </div>

          {/* Tips Card */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-900 border border-slate-800 rounded-xl p-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl -mr-8 -mt-8"></div>
            <h3 className="text-white font-bold mb-2 flex items-center gap-2">
              <span className="text-lg">💡</span> {t('dashboard.tips.proTip')}
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              <Trans i18nKey="dashboard.tips.combatTracker">
                Puedes usar el <span className="text-indigo-400 font-medium">Combat Tracker</span> sin necesidad de crear una sesión. Simplemente ve a tu campaña y selecciona "Combate".
              </Trans>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

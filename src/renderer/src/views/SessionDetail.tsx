import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDB } from '../context/DbContext'
import { useTranslation } from 'react-i18next'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeSanitize from 'rehype-sanitize'
import BackButton from '../components/ui/BackButton'
import MarkdownEditor from '../components/ui/MarkdownEditor'
import {
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  Swords,
  Users,
  Skull,
  Edit2,
  Trash2,
  Plus,
  X,
  LayoutDashboard,
  ChevronDown,
  ChevronUp,
  FileText
} from 'lucide-react'

interface Session {
  id: string
  campaignId: string
  title: string
  sessionNumber: number
  date: number
  notes: string
  linkedCombatIds: string[]
  linkedNpcIds: string[]
  status: 'planned' | 'completed' | 'cancelled'
  createdAt: number
  updatedAt: number
}

interface CombatEncounter {
  id: string
  name: string
  round: number
  isActive: boolean
}

interface Npc {
  id: string
  name: string
  race: string
  role: string
  hp: number
  ac: number
  isHostile: boolean
  imageData: string
  notes: string
}

export default function SessionDetail() {
  const { id: campaignId, sessionId } = useParams<{ id: string; sessionId: string }>()
  const navigate = useNavigate()
  const db = useDB()
  const { t, i18n } = useTranslation()

  const [session, setSession] = useState<Session | null>(null)
  const [linkedCombats, setLinkedCombats] = useState<CombatEncounter[]>([])
  const [linkedNpcs, setLinkedNpcs] = useState<Npc[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedNpc, setSelectedNpc] = useState<Npc | null>(null)
  const [isEditingNotes, setIsEditingNotes] = useState(false)
  const [showAddCombatModal, setShowAddCombatModal] = useState(false)
  const [showAddNpcModal, setShowAddNpcModal] = useState(false)
  const [availableCombats, setAvailableCombats] = useState<CombatEncounter[]>([])
  const [availableNpcs, setAvailableNpcs] = useState<Npc[]>([])
  const [expandedNpcId, setExpandedNpcId] = useState<string | null>(null)
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Cargar sesión
  useEffect(() => {
    if (!db || !sessionId) return

    const loadSession = async () => {
      try {
        const doc = await db.sessions.findOne(sessionId).exec()
        if (doc) {
          const sessionData = doc.toJSON() as Session
          setSession(sessionData)

          // Cargar combates vinculados
          if (sessionData.linkedCombatIds.length > 0) {
            const combatDocs = await db.combatEncounters
              .find({
                selector: {
                  id: { $in: sessionData.linkedCombatIds }
                }
              })
              .exec()
            setLinkedCombats(combatDocs.map((d) => d.toJSON() as CombatEncounter))
          }

          // Cargar NPCs vinculados
          if (sessionData.linkedNpcIds.length > 0) {
            const npcDocs = await db.npcs
              .find({
                selector: {
                  id: { $in: sessionData.linkedNpcIds }
                }
              })
              .exec()
            setLinkedNpcs(npcDocs.map((d) => d.toJSON() as Npc))
          }
        }
        setIsLoading(false)
      } catch (error) {
        console.error('Error cargando sesión:', error)
        setIsLoading(false)
      }
    }

    loadSession()
  }, [db, sessionId])

  // Cargar combates y NPCs disponibles
  useEffect(() => {
    if (!db || !campaignId) return

    const loadAvailable = async () => {
      try {
        const combatDocs = await db.combatEncounters
          .find({ selector: { campaignId: campaignId } })
          .exec()
        setAvailableCombats(combatDocs.map((d) => d.toJSON() as CombatEncounter))

        const npcDocs = await db.npcs
          .find({
            selector: {
              campaignId: campaignId,
              type: { $ne: 'monster' }
            }
          })
          .exec()
        setAvailableNpcs(npcDocs.map((d) => d.toJSON() as Npc))
      } catch (error) {
        console.error('Error cargando combates/NPCs:', error)
      }
    }

    loadAvailable()
  }, [db, campaignId])

  const deleteSession = async () => {
    if (!confirm(t('sessions.deleteConfirm'))) return

    try {
      const doc = await db.sessions.findOne(sessionId!).exec()
      if (doc) {
        await doc.remove()
        navigate(`/campaign/${campaignId}/sessions`)
      }
    } catch (error) {
      console.error('Error eliminando sesión:', error)
    }
  }

  const updateSessionNotes = (notes: string) => {
    // Actualizar estado local inmediatamente para evitar saltos de cursor
    setSession((prev) => (prev ? { ...prev, notes } : null))

    // Debounce para guardar en DB
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }

    saveTimeoutRef.current = setTimeout(async () => {
      if (!db || !sessionId) return

      try {
        const doc = await db.sessions.findOne(sessionId).exec()
        if (doc) {
          await doc.patch({
            notes: notes,
            updatedAt: Date.now()
          })
        }
      } catch (error) {
        console.error('Error actualizando notas:', error)
      }
    }, 1000)
  }

  const addCombatToSession = async (combatId: string) => {
    if (!db || !sessionId || !session) return

    try {
      const newLinkedCombatIds = [...session.linkedCombatIds, combatId]
      const doc = await db.sessions.findOne(sessionId).exec()
      if (doc) {
        await doc.patch({
          linkedCombatIds: newLinkedCombatIds,
          updatedAt: Date.now()
        })
        // Actualizar estado local
        setSession(prev => prev ? { ...prev, linkedCombatIds: newLinkedCombatIds } : null)
        // Añadir a la lista de combates vinculados
        const combat = availableCombats.find(c => c.id === combatId)
        if (combat) setLinkedCombats(prev => [...prev, combat])
      }
    } catch (error) {
      console.error('Error vinculando combate:', error)
    }
  }

  const removeCombatFromSession = async (combatId: string) => {
    if (!db || !sessionId || !session) return

    try {
      const newLinkedCombatIds = session.linkedCombatIds.filter(id => id !== combatId)
      const doc = await db.sessions.findOne(sessionId).exec()
      if (doc) {
        await doc.patch({
          linkedCombatIds: newLinkedCombatIds,
          updatedAt: Date.now()
        })
        setSession(prev => prev ? { ...prev, linkedCombatIds: newLinkedCombatIds } : null)
        setLinkedCombats(prev => prev.filter(c => c.id !== combatId))
      }
    } catch (error) {
      console.error('Error desvinculando combate:', error)
    }
  }

  const addNpcToSession = async (npcId: string) => {
    if (!db || !sessionId || !session) return

    try {
      const newLinkedNpcIds = [...session.linkedNpcIds, npcId]
      const doc = await db.sessions.findOne(sessionId).exec()
      if (doc) {
        await doc.patch({
          linkedNpcIds: newLinkedNpcIds,
          updatedAt: Date.now()
        })
        setSession(prev => prev ? { ...prev, linkedNpcIds: newLinkedNpcIds } : null)
        const npc = availableNpcs.find(n => n.id === npcId)
        if (npc) setLinkedNpcs(prev => [...prev, npc])
      }
    } catch (error) {
      console.error('Error vinculando NPC:', error)
    }
  }

  const removeNpcFromSession = async (npcId: string) => {
    if (!db || !sessionId || !session) return

    try {
      const newLinkedNpcIds = session.linkedNpcIds.filter(id => id !== npcId)
      const doc = await db.sessions.findOne(sessionId).exec()
      if (doc) {
        await doc.patch({
          linkedNpcIds: newLinkedNpcIds,
          updatedAt: Date.now()
        })
        setSession(prev => prev ? { ...prev, linkedNpcIds: newLinkedNpcIds } : null)
        setLinkedNpcs(prev => prev.filter(n => n.id !== npcId))
      }
    } catch (error) {
      console.error('Error desvinculando NPC:', error)
    }
  }

  const getStatusInfo = (status: Session['status']) => {
    switch (status) {
      case 'planned':
        return { icon: Clock, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20', label: t('sessions.status.planned') }
      case 'completed':
        return { icon: CheckCircle2, color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/20', label: t('sessions.status.completed') }
      case 'cancelled':
        return { icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20', label: t('sessions.status.cancelled') }
    }
  }

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-slate-400">
        <XCircle size={64} className="mb-4 opacity-50" />
        <p className="text-xl font-medium">{t('sessions.notFound')}</p>
        <div className="mt-6">
          <BackButton
            fallbackPath={`/campaign/${campaignId}/sessions`}
            className="text-indigo-400 hover:text-indigo-300"
          />
        </div>
      </div>
    )
  }

  const statusInfo = getStatusInfo(session.status)
  const StatusIcon = statusInfo.icon

  return (
    <div className="p-8 max-w-6xl mx-auto w-full">
      {/* Botón Volver */}
      <div className="mb-6">
        <BackButton
          fallbackPath={`/campaign/${campaignId}/sessions`}
          className="text-slate-400 hover:text-white"
        />
      </div>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-indigo-500/20 text-indigo-400 px-3 py-1.5 rounded-full text-sm font-bold">
              {t('sessions.sessionNumber', { number: session.sessionNumber })}
            </div>
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${statusInfo.bg} ${statusInfo.color} border ${statusInfo.border}`}>
              <StatusIcon size={16} />
              {statusInfo.label}
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">{session.title}</h1>
          <div className="flex items-center gap-4 text-sm text-slate-400">
            <span className="flex items-center gap-1.5">
              <Calendar size={16} />
              {new Date(session.date).toLocaleDateString(i18n.language, {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 ml-4">
          <button
            onClick={() => navigate(`/campaign/${campaignId}`)}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            title={t('nav.goToCampaign')}
          >
            <LayoutDashboard size={18} />
            <span className="hidden sm:inline">{t('nav.goToCampaign')}</span>
          </button>
          <button
            onClick={() => navigate(`/campaign/${campaignId}/sessions`, {
              state: {
                editSession: session
              }
            })}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            <Edit2 size={18} />
            {t('common.edit')}
          </button>
          <button
            onClick={deleteSession}
            className="flex items-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 px-4 py-2 rounded-lg font-medium transition-colors border border-red-500/20"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contenido principal - Notas en Markdown */}
        <div className="lg:col-span-2">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Calendar className="text-indigo-400" />
                {t('sessions.detail.notes')}
              </h2>
              <button
                onClick={() => setIsEditingNotes(!isEditingNotes)}
                className="px-3 py-1.5 text-sm bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 hover:bg-indigo-500/20 rounded-lg font-medium transition-colors"
              >
                {isEditingNotes ? t('common.save') : t('common.edit')}
              </button>
            </div>

            {isEditingNotes ? (
              <MarkdownEditor
                value={session.notes}
                onChange={updateSessionNotes}
                height={500}
                placeholder={t('sessions.detail.notesPlaceholder')}
              />
            ) : session.notes ? (
              <div className="prose prose-invert prose-slate max-w-none"
                style={{
                  color: 'rgb(226, 232, 240)',
                  fontSize: '0.95rem',
                  lineHeight: '1.7'
                }}
              >
                <style>{`
                  .prose h1 { color: rgb(248, 250, 252); font-size: 1.875rem; font-weight: 700; margin-top: 1.5rem; margin-bottom: 1rem; }
                  .prose h2 { color: rgb(241, 245, 249); font-size: 1.5rem; font-weight: 700; margin-top: 1.5rem; margin-bottom: 0.875rem; }
                  .prose h3 { color: rgb(226, 232, 240); font-size: 1.25rem; font-weight: 600; margin-top: 1.25rem; margin-bottom: 0.75rem; }
                  .prose h4 { color: rgb(203, 213, 225); font-size: 1.125rem; font-weight: 600; margin-top: 1rem; margin-bottom: 0.5rem; }
                  .prose p { color: rgb(203, 213, 225); margin-bottom: 1rem; }
                  .prose strong { color: rgb(248, 250, 252); font-weight: 600; }
                  .prose em { color: rgb(226, 232, 240); font-style: italic; }
                  .prose ul, .prose ol { color: rgb(203, 213, 225); margin-left: 1.5rem; margin-bottom: 1rem; }
                  .prose li { margin-bottom: 0.5rem; }
                  .prose code { background-color: rgb(51, 65, 85); color: rgb(229, 231, 235); padding: 0.125rem 0.375rem; border-radius: 0.25rem; font-size: 0.875em; }
                  .prose pre { background-color: rgb(30, 41, 59); padding: 1rem; border-radius: 0.5rem; overflow-x: auto; margin-bottom: 1rem; }
                  .prose pre code { background-color: transparent; padding: 0; }
                  .prose blockquote { border-left: 4px solid rgb(99, 102, 241); padding-left: 1rem; color: rgb(148, 163, 184); font-style: italic; margin-bottom: 1rem; }
                  .prose a { color: rgb(96, 165, 250); text-decoration: underline; }
                  .prose a:hover { color: rgb(147, 197, 253); }
                  .prose table { width: 100%; border-collapse: collapse; margin-bottom: 1rem; }
                  .prose th { background-color: rgb(51, 65, 85); color: rgb(248, 250, 252); padding: 0.5rem; text-align: left; font-weight: 600; }
                  .prose td { border: 1px solid rgb(71, 85, 105); padding: 0.5rem; color: rgb(203, 213, 225); }
                  .prose hr { border: 0; border-top: 1px solid rgb(71, 85, 105); margin: 1.5rem 0; }
                `}</style>
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeSanitize]}
                  components={{
                    a: ({ node, ...props }) => (
                      <a {...props} target="_blank" rel="noopener noreferrer" />
                    )
                  }}
                >
                  {session.notes}
                </ReactMarkdown>
              </div>
            ) : (
              <p className="text-slate-500 italic">{t('sessions.detail.notesEmpty')}</p>
            )}
          </div>
        </div>

        {/* Sidebar - Entidades vinculadas */}
        <div className="space-y-6">
          {/* Combates vinculados */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Swords className="text-red-400" size={20} />
                {t('sessions.detail.combats')} ({linkedCombats.length})
              </h3>
              <button
                onClick={() => setShowAddCombatModal(true)}
                className="px-3 py-1 text-xs bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 rounded-lg font-medium transition-colors flex items-center gap-1"
              >
                <Plus size={14} />
                {t('sessions.detail.link')}
              </button>
            </div>
            {linkedCombats.length === 0 ? (
              <p className="text-slate-500 text-sm italic">{t('sessions.detail.noCombats')}</p>
            ) : (
              <div className="space-y-2">
                {linkedCombats.map((combat) => (
                  <div key={combat.id} className="relative group">
                    <button
                      onClick={() => navigate(`/campaign/${campaignId}/combat/${combat.id}`)}
                      className="w-full bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-red-500/50 rounded-lg p-3 text-left transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 flex-1">
                          <Swords size={16} className="text-red-400" />
                          <span className="text-white font-medium group-hover:text-red-400 transition-colors">
                            {combat.name}
                          </span>
                        </div>
                        {combat.isActive && (
                          <div className="bg-green-500/20 text-green-400 text-xs px-2 py-0.5 rounded-full">
                            {t('sessions.detail.active')}
                          </div>
                        )}
                      </div>
                      {!combat.isActive && combat.round > 0 && (
                        <p className="text-xs text-slate-500 mt-1 ml-6">
                          {t('sessions.detail.finishedRound', { round: combat.round })}
                        </p>
                      )}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        removeCombatFromSession(combat.id)
                      }}
                      className="absolute top-2 right-2 p-1 bg-slate-900 hover:bg-red-500/20 text-slate-600 hover:text-red-400 rounded opacity-0 group-hover:opacity-100 transition-all"
                      title={t('sessions.detail.unlinkCombat')}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* NPCs vinculados */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Users className="text-purple-400" size={20} />
                {t('nav.npcs')} ({linkedNpcs.length})
              </h3>
              <button
                onClick={() => setShowAddNpcModal(true)}
                className="px-3 py-1 text-xs bg-purple-500/10 text-purple-400 border border-purple-500/20 hover:bg-purple-500/20 rounded-lg font-medium transition-colors flex items-center gap-1"
              >
                <Plus size={14} />
                {t('sessions.detail.link')}
              </button>
            </div>
            {linkedNpcs.length === 0 ? (
              <p className="text-slate-500 text-sm italic">{t('sessions.detail.noNpcs')}</p>
            ) : (
              <div className="space-y-2">
                {linkedNpcs.map((npc) => (
                  <div key={npc.id} className="relative group bg-slate-800 border border-slate-700 rounded-lg overflow-hidden hover:border-purple-500/50 transition-colors">
                    <button
                      onClick={() => setSelectedNpc(npc)}
                      className="w-full p-3 text-left transition-all hover:bg-slate-700/50"
                    >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-700 border-2 border-slate-600 flex-shrink-0 overflow-hidden">
                        {npc.imageData ? (
                          <img
                            src={npc.imageData}
                            alt={npc.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-500">
                            {npc.isHostile ? <Skull size={20} /> : <Users size={20} />}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-white font-medium group-hover:text-purple-400 transition-colors truncate">
                            {npc.name}
                          </span>
                          {npc.isHostile && (
                            <Skull size={14} className="text-red-500 flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-xs text-slate-500 truncate">
                          {npc.role || npc.race || 'NPC'}
                        </p>
                      </div>
                    </div>
                  </button>

                  {npc.notes && (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setExpandedNpcId(expandedNpcId === npc.id ? null : npc.id)
                        }}
                        className="w-full flex items-center justify-center py-1 bg-slate-900/30 hover:bg-slate-900/50 border-t border-slate-700/50 text-slate-500 hover:text-slate-300 transition-colors"
                      >
                        {expandedNpcId === npc.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </button>

                      {expandedNpcId === npc.id && (
                        <div className="p-3 bg-slate-900/50 border-t border-slate-700/50">
                          <div className="flex items-center gap-2 mb-1 text-xs font-bold text-slate-500 uppercase tracking-wider">
                            <FileText size={12} />
                            {t('npcs.form.notes')}
                          </div>
                          <p className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">
                            {npc.notes}
                          </p>
                        </div>
                      )}
                    </>
                  )}

                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        removeNpcFromSession(npc.id)
                      }}
                      className="absolute top-2 right-2 p-1 bg-slate-900 hover:bg-purple-500/20 text-slate-600 hover:text-purple-400 rounded opacity-0 group-hover:opacity-100 transition-all"
                      title={t('sessions.detail.unlinkNpc')}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal para vincular combates */}
      {showAddCombatModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Swords className="text-red-400" size={24} />
                {t('sessions.detail.linkCombat')}
              </h2>
              <button
                onClick={() => setShowAddCombatModal(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <XCircle size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {availableCombats.filter(c => !session?.linkedCombatIds.includes(c.id)).length === 0 ? (
                <p className="text-slate-400 text-center py-8">
                  {t('sessions.detail.noCombatsAvailable')}
                </p>
              ) : (
                <div className="space-y-2">
                  {availableCombats
                    .filter(combat => !session?.linkedCombatIds.includes(combat.id))
                    .map((combat) => (
                      <button
                        key={combat.id}
                        onClick={() => {
                          addCombatToSession(combat.id)
                          setShowAddCombatModal(false)
                        }}
                        className="w-full bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-red-500/50 rounded-lg p-4 text-left transition-all group"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 flex-1">
                            <Swords size={18} className="text-red-400" />
                            <div>
                              <span className="text-white font-medium block group-hover:text-red-400 transition-colors">
                                {combat.name}
                              </span>
                              {combat.isActive && (
                                <span className="text-xs text-green-400">{t('sessions.detail.active')}</span>
                              )}
                              {!combat.isActive && combat.round > 0 && (
                                <span className="text-xs text-slate-500">
                                  {t('sessions.detail.finishedRound', { round: combat.round })}
                                </span>
                              )}
                            </div>
                          </div>
                          <Plus size={20} className="text-slate-500 group-hover:text-red-400 transition-colors" />
                        </div>
                      </button>
                    ))}
                </div>
              )}
            </div>

            <div className="p-6 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setShowAddCombatModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-medium transition-colors"
              >
                {t('common.close')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para vincular NPCs */}
      {showAddNpcModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Users className="text-purple-400" size={24} />
                {t('sessions.detail.linkNpc')}
              </h2>
              <button
                onClick={() => setShowAddNpcModal(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <XCircle size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {availableNpcs.filter(n => !session?.linkedNpcIds.includes(n.id)).length === 0 ? (
                <p className="text-slate-400 text-center py-8">
                  {t('sessions.detail.noNpcsAvailable')}
                </p>
              ) : (
                <div className="space-y-2">
                  {availableNpcs
                    .filter(npc => !session?.linkedNpcIds.includes(npc.id))
                    .map((npc) => (
                      <button
                        key={npc.id}
                        onClick={() => {
                          addNpcToSession(npc.id)
                          setShowAddNpcModal(false)
                        }}
                        className="w-full bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-purple-500/50 rounded-lg p-4 text-left transition-all group"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 flex-1">
                            <div className="w-10 h-10 rounded-full bg-slate-700 border-2 border-slate-600 flex-shrink-0 overflow-hidden">
                              {npc.imageData ? (
                                <img
                                  src={npc.imageData}
                                  alt={npc.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-500">
                                  {npc.isHostile ? <Skull size={20} /> : <Users size={20} />}
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-white font-medium group-hover:text-purple-400 transition-colors">
                                  {npc.name}
                                </span>
                                {npc.isHostile && (
                                  <Skull size={14} className="text-red-500 flex-shrink-0" />
                                )}
                              </div>
                              <p className="text-xs text-slate-500">
                                {npc.role || npc.race || 'NPC'}
                              </p>
                            </div>
                          </div>
                          <Plus size={20} className="text-slate-500 group-hover:text-purple-400 transition-colors" />
                        </div>
                      </button>
                    ))}
                </div>
              )}
            </div>

            <div className="p-6 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setShowAddNpcModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-medium transition-colors"
              >
                {t('common.close')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de detalle de NPC */}
      {selectedNpc && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between sticky top-0 bg-slate-900 z-10">
              <div className="flex items-center gap-4">
                {selectedNpc.imageData && (
                  <div className="w-16 h-16 rounded-full bg-slate-800 border-2 border-slate-700 overflow-hidden flex-shrink-0">
                    <img
                      src={selectedNpc.imageData}
                      alt={selectedNpc.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div>
                  <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    {selectedNpc.name}
                    {selectedNpc.isHostile && <Skull size={24} className="text-red-500" />}
                  </h2>
                  <p className="text-slate-400">
                    {selectedNpc.race && selectedNpc.role
                      ? `${selectedNpc.race} - ${selectedNpc.role}`
                      : selectedNpc.race || selectedNpc.role || 'NPC'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedNpc(null)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <XCircle size={24} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
                  <p className="text-slate-400 text-sm mb-1">{t('npcs.form.hp')}</p>
                  <p className="text-2xl font-bold text-white">{selectedNpc.hp}</p>
                </div>
                <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
                  <p className="text-slate-400 text-sm mb-1">{t('npcs.form.ac')}</p>
                  <p className="text-2xl font-bold text-white">{selectedNpc.ac}</p>
                </div>
              </div>

              {/* Estado */}
              <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
                <p className="text-slate-400 text-sm mb-2">{t('npcs.form.status')}</p>
                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
                  selectedNpc.isHostile
                    ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                    : 'bg-green-500/20 text-green-400 border border-green-500/30'
                }`}>
                  {selectedNpc.isHostile ? (
                    <>
                      <Skull size={16} />
                      {t('npcs.hostile')}
                    </>
                  ) : (
                    <>
                      <Users size={16} />
                      {t('npcs.friendly')}
                    </>
                  )}
                </div>
              </div>

              {/* Notas */}
              {selectedNpc.notes && (
                <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
                  <p className="text-slate-400 text-sm mb-2">{t('npcs.form.notes')}</p>
                  <p className="text-white whitespace-pre-wrap">{selectedNpc.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

import { useEffect, useState } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { useDB } from '../context/DbContext'
import { useTranslation } from 'react-i18next'
import BackButton from '../components/ui/BackButton'
import {
  Plus,
  Calendar,
  X,
  CheckCircle2,
  XCircle,
  Clock,
  Swords,
  Users,
  Eye,
  Pencil
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

export default function Sessions() {
  const { id: campaignId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const db = useDB()
  const { t, i18n } = useTranslation()

  const [sessions, setSessions] = useState<Session[]>([])

  const state = location.state as { editSession?: Session }
  const [showCreateModal, setShowCreateModal] = useState(!!state?.editSession)
  const [editingSessionId, setEditingSessionId] = useState<string | null>(
    state?.editSession?.id || null
  )
  const [filterStatus, setFilterStatus] = useState<'all' | 'planned' | 'completed' | 'cancelled'>(
    'all'
  )

  const [formData, setFormData] = useState({
    title: state?.editSession?.title || '',
    sessionNumber: state?.editSession?.sessionNumber || 1,
    date: state?.editSession
      ? new Date(state.editSession.date).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0],
    notes: state?.editSession?.notes || '',
    linkedCombatIds: state?.editSession?.linkedCombatIds || ([] as string[]),
    linkedNpcIds: state?.editSession?.linkedNpcIds || ([] as string[]),
    status: (state?.editSession?.status || 'planned') as 'planned' | 'completed' | 'cancelled'
  })

  // Cargar sesiones
  useEffect(() => {
    if (!db || !campaignId) return

    const loadSessions = async () => {
      const collection = db.sessions
      const query = collection.find({
        selector: {
          campaignId: campaignId
        },
        sort: [{ date: 'desc' }]
      })

      const sub = query.$.subscribe((docs) => {
        setSessions(docs.map((doc) => doc.toJSON() as Session))
      })

      return () => sub.unsubscribe()
    }

    loadSessions()
  }, [db, campaignId])

  // Limpiar el state de navegación si existe
  useEffect(() => {
    if (state?.editSession) {
      navigate(location.pathname, { replace: true, state: {} })
    }
  }, [state, navigate, location.pathname])

  const addSession = async () => {
    if (!db || !formData.title.trim()) return

    try {
      // Convertir fecha string a timestamp (mediodía para evitar problemas de zona horaria)
      const dateObj = new Date(formData.date)
      dateObj.setHours(12, 0, 0, 0)

      const newSession = {
        id: `session_${Date.now()}`,
        campaignId: campaignId!,
        title: formData.title.trim(),
        sessionNumber: formData.sessionNumber,
        date: dateObj.getTime(),
        notes: formData.notes,
        linkedCombatIds: formData.linkedCombatIds,
        linkedNpcIds: formData.linkedNpcIds,
        status: formData.status,
        createdAt: Date.now(),
        updatedAt: Date.now()
      }

      await db.sessions.insert(newSession)

      // Reset form
      setFormData({
        title: '',
        sessionNumber: sessions.length + 2,
        date: new Date().toISOString().split('T')[0],
        notes: '',
        linkedCombatIds: [],
        linkedNpcIds: [],
        status: 'planned'
      })
      setShowCreateModal(false)
    } catch (error) {
      console.error('Error al crear sesión:', error)
    }
  }

  const updateSession = async () => {
    if (!db || !editingSessionId || !formData.title.trim()) return

    try {
      const sessionDoc = await db.sessions.findOne(editingSessionId).exec()
      if (!sessionDoc) return

      // Convertir fecha string a timestamp
      const dateObj = new Date(formData.date)
      dateObj.setHours(12, 0, 0, 0)

      await sessionDoc.patch({
        title: formData.title.trim(),
        sessionNumber: formData.sessionNumber,
        date: dateObj.getTime(),
        notes: formData.notes,
        linkedCombatIds: formData.linkedCombatIds,
        linkedNpcIds: formData.linkedNpcIds,
        status: formData.status,
        updatedAt: Date.now()
      })

      // Reset form
      setFormData({
        title: '',
        sessionNumber: sessions.length + 2,
        date: new Date().toISOString().split('T')[0],
        notes: '',
        linkedCombatIds: [],
        linkedNpcIds: [],
        status: 'planned'
      })
      setShowCreateModal(false)
      setEditingSessionId(null)
    } catch (error) {
      console.error('Error al actualizar sesión:', error)
    }
  }

  const deleteSession = async (sessionId: string) => {
    if (!db) return
    if (!confirm(t('sessions.deleteConfirm'))) return

    try {
      const doc = await db.sessions.findOne(sessionId).exec()
      if (doc) {
        await doc.remove()
      }
    } catch (error) {
      console.error('Error al eliminar sesión:', error)
    }
  }

  const updateStatus = async (
    sessionId: string,
    newStatus: 'planned' | 'completed' | 'cancelled'
  ) => {
    if (!db) return

    try {
      const doc = await db.sessions.findOne(sessionId).exec()
      if (doc) {
        await doc.update({
          $set: {
            status: newStatus,
            updatedAt: Date.now()
          }
        })
      }
    } catch (error) {
      console.error('Error al actualizar estado:', error)
    }
  }

  /*
  const toggleCombat = (combatId: string) => {
    setFormData((prev) => ({
      ...prev,
      linkedCombatIds: prev.linkedCombatIds.includes(combatId)
        ? prev.linkedCombatIds.filter((id) => id !== combatId)
        : [...prev.linkedCombatIds, combatId]
    }))
  }
  */

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 size={16} className="text-green-400" />
      case 'cancelled':
        return <XCircle size={16} className="text-red-400" />
      default:
        return <Clock size={16} className="text-blue-400" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return t('sessions.status.completed')
      case 'cancelled':
        return t('sessions.status.cancelled')
      default:
        return t('sessions.status.planned')
    }
  }

  const filteredSessions = sessions.filter((session) => {
    if (filterStatus === 'all') return true
    return session.status === filterStatus
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
            <Calendar className="text-blue-500" />
            {t('sessions.title')}
          </h1>
          <p className="text-slate-400">{t('sessions.description')}</p>
        </div>

        <button
          onClick={() => {
            setFormData({
              ...formData,
              sessionNumber: sessions.length + 1,
              date: new Date().toISOString().split('T')[0]
            })
            setShowCreateModal(true)
          }}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-lg font-medium transition-all shadow-lg shadow-blue-500/20 active:scale-95"
        >
          <Plus size={20} />
          {t('sessions.new')}
        </button>
      </div>

      {/* Filtros */}
      <div className="flex gap-3 mb-6">
        <button
          onClick={() => setFilterStatus('all')}
          className={`px-4 py-2 rounded-lg font-medium border transition-colors ${
            filterStatus === 'all'
              ? 'bg-slate-800 text-white border-slate-700'
              : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800'
          }`}
        >
          {t('sessions.filter.all')} ({sessions.length})
        </button>
        <button
          onClick={() => setFilterStatus('planned')}
          className={`px-4 py-2 rounded-lg font-medium border transition-colors ${
            filterStatus === 'planned'
              ? 'bg-blue-600 text-white border-blue-500'
              : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800'
          }`}
        >
          {t('sessions.filter.planned')} ({sessions.filter((s) => s.status === 'planned').length})
        </button>
        <button
          onClick={() => setFilterStatus('completed')}
          className={`px-4 py-2 rounded-lg font-medium border transition-colors ${
            filterStatus === 'completed'
              ? 'bg-green-600 text-white border-green-500'
              : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800'
          }`}
        >
          {t('sessions.filter.completed')} (
          {sessions.filter((s) => s.status === 'completed').length})
        </button>
        <button
          onClick={() => setFilterStatus('cancelled')}
          className={`px-4 py-2 rounded-lg font-medium border transition-colors ${
            filterStatus === 'cancelled'
              ? 'bg-red-600 text-white border-red-500'
              : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800'
          }`}
        >
          {t('sessions.filter.cancelled')} (
          {sessions.filter((s) => s.status === 'cancelled').length})
        </button>
      </div>

      {/* Timeline de sesiones */}
      <div className="space-y-4">
        {filteredSessions.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center border-2 border-dashed border-slate-800 rounded-3xl bg-slate-900/20 text-slate-500">
            <div className="bg-slate-900 p-4 rounded-full mb-4">
              <Calendar size={48} className="text-slate-700" />
            </div>
            <p className="text-lg font-medium text-slate-400">{t('sessions.empty')}</p>
            <p className="text-sm opacity-60 mb-6">{t('sessions.emptyHint')}</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              <Plus size={18} />
              {t('sessions.create')}
            </button>
          </div>
        ) : (
          filteredSessions.map((session) => (
            <div
              key={session.id}
              className={`group bg-slate-900 border rounded-xl p-5 transition-all cursor-pointer ${
                session.status === 'completed'
                  ? 'border-green-900/50 hover:border-green-500/50'
                  : session.status === 'cancelled'
                    ? 'border-red-900/50 hover:border-red-500/50'
                    : 'border-slate-800 hover:border-blue-500/50'
              }`}
              onClick={() => navigate(`/campaign/${campaignId}/sessions/${session.id}`)}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-sm font-medium text-slate-500">
                      {t('sessions.sessionNumber', { number: session.sessionNumber })}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {getStatusIcon(session.status)}
                      <span className="text-sm text-slate-400">
                        {getStatusText(session.status)}
                      </span>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors flex items-center gap-2">
                    {session.title}
                    <Eye
                      size={18}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    />
                  </h3>
                  <p className="text-sm text-slate-400">
                    {new Date(session.date).toLocaleDateString(i18n.language, {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setFormData({
                        title: session.title,
                        sessionNumber: session.sessionNumber,
                        date: new Date(session.date).toISOString().split('T')[0],
                        notes: session.notes,
                        linkedCombatIds: session.linkedCombatIds,
                        linkedNpcIds: session.linkedNpcIds,
                        status: session.status
                      })
                      setEditingSessionId(session.id)
                      setShowCreateModal(true)
                    }}
                    className="text-slate-600 hover:text-blue-500 transition-colors p-1 opacity-0 group-hover:opacity-100"
                  >
                    <Pencil size={18} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteSession(session.id)
                    }}
                    className="text-slate-600 hover:text-red-500 transition-colors p-1 opacity-0 group-hover:opacity-100"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* Vínculos */}
              {(session.linkedCombatIds.length > 0 || session.linkedNpcIds.length > 0) && (
                <div className="flex gap-4 mb-4 text-xs">
                  {session.linkedCombatIds.length > 0 && (
                    <div className="flex items-center gap-1.5 text-red-400">
                      <Swords size={14} />
                      <span>
                        {t('sessions.linkedCombats', { count: session.linkedCombatIds.length })}
                      </span>
                    </div>
                  )}
                  {session.linkedNpcIds.length > 0 && (
                    <div className="flex items-center gap-1.5 text-purple-400">
                      <Users size={14} />
                      <span>
                        {t('sessions.linkedNpcs', { count: session.linkedNpcIds.length })}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Acciones de estado */}
              <div className="flex gap-2">
                {session.status !== 'completed' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      updateStatus(session.id, 'completed')
                    }}
                    className="px-3 py-1.5 text-xs bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20 rounded-lg font-medium transition-colors"
                  >
                    {t('sessions.markCompleted')}
                  </button>
                )}
                {session.status !== 'cancelled' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      updateStatus(session.id, 'cancelled')
                    }}
                    className="px-3 py-1.5 text-xs bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 rounded-lg font-medium transition-colors"
                  >
                    {t('sessions.markCancelled')}
                  </button>
                )}
                {session.status !== 'planned' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      updateStatus(session.id, 'planned')
                    }}
                    className="px-3 py-1.5 text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 rounded-lg font-medium transition-colors"
                  >
                    {t('sessions.markPlanned')}
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal para crear sesión */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between sticky top-0 bg-slate-900 z-10">
              <h2 className="text-2xl font-bold text-white">
                {editingSessionId ? t('sessions.editTitle') : t('sessions.newTitle')}
              </h2>
              <button
                onClick={() => {
                  setShowCreateModal(false)
                  setEditingSessionId(null)
                  setFormData({
                    title: '',
                    sessionNumber: sessions.length + 1,
                    date: new Date().toISOString().split('T')[0],
                    notes: '',
                    linkedCombatIds: [],
                    linkedNpcIds: [],
                    status: 'planned'
                  })
                }}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault()
                editingSessionId ? updateSession() : addSession()
              }}
              className="p-6 space-y-4"
            >
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    {t('sessions.form.title')} *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder={t('sessions.form.titlePlaceholder')}
                    autoFocus
                    required
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    {t('sessions.form.number')}
                  </label>
                  <input
                    type="number"
                    value={formData.sessionNumber}
                    onChange={(e) =>
                      setFormData({ ...formData, sessionNumber: parseInt(e.target.value) || 1 })
                    }
                    min="1"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  {t('sessions.form.date')}
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false)
                    setEditingSessionId(null)
                    setFormData({
                      title: '',
                      sessionNumber: sessions.length + 1,
                      date: new Date().toISOString().split('T')[0],
                      notes: '',
                      linkedCombatIds: [],
                      linkedNpcIds: [],
                      status: 'planned'
                    })
                  }}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={!formData.title.trim()}
                  className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-600 text-white px-4 py-2.5 rounded-lg font-medium transition-colors disabled:cursor-not-allowed"
                >
                  {editingSessionId ? t('common.saveChanges') : t('sessions.create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

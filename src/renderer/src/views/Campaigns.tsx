import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useDB } from '../context/DbContext'
import { useToast } from '../context/ToastContext'
import { useConfirm } from '../context/ConfirmationContext'
import { useKeyboardShortcut } from '../hooks/useKeyboardShortcut'
import { useTranslation } from 'react-i18next'
import TagSelector from '../components/ui/TagSelector'
import ImageUploader from '../components/ui/ImageUploader'
import Tooltip from '../components/ui/Tooltip'
import { TAG_COLOR_CLASSES } from '../utils/tagColors'
import { Plus, Trash2, Calendar, BookOpen, X, Pencil } from 'lucide-react'
import type { RxDocument } from 'rxdb'

// Definimos la estructura de datos para TypeScript
interface Campaign {
  id: string
  name: string
  system: string
  systemColor: string
  description: string
  createdAt: number
  backgroundImage?: string
}

export default function Campaigns() {
  const db = useDB()
  const navigate = useNavigate()
  const location = useLocation()
  const { t } = useTranslation()
  const { addToast } = useToast()
  const { confirm } = useConfirm()

  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newCampaignName, setNewCampaignName] = useState('')
  const [newCampaignSystem, setNewCampaignSystem] = useState('')
  const [newCampaignSystemColor, setNewCampaignSystemColor] = useState('')
  const [newCampaignDescription, setNewCampaignDescription] = useState('')
  const [newCampaignBackgroundImage, setNewCampaignBackgroundImage] = useState('')
  const [editingCampaignId, setEditingCampaignId] = useState<string | null>(null)

  // 1. Verificar si venimos con intención de crear (desde Dashboard)
  useEffect(() => {
    if (location.state && (location.state as { openCreateModal?: boolean }).openCreateModal) {
      setShowCreateModal(true)
      // Limpiamos el state para que no se vuelva a abrir al recargar o navegar
      window.history.replaceState({}, document.title)
    }
  }, [location])

  // 2. Suscripción a cambios en tiempo real
  useEffect(() => {
    // Nos suscribimos a la consulta "dame todas las campañas"
    // El "$" al final significa que es un Observable (stream de datos)
    const subscription = db.campaigns.find().$.subscribe((documents: RxDocument<Campaign>[]) => {
      // Convertimos los documentos de RxDB a objetos JSON normales
      const plainData = documents
        .map((doc) => doc.toJSON())
        .sort((a, b) => b.createdAt - a.createdAt) // Ordenar por fecha (más reciente primero)
      setCampaigns(plainData)
    })

    // Limpieza: Cuando sales de esta pantalla, dejamos de escuchar cambios
    return () => {
      subscription.unsubscribe()
    }
  }, [db]) // Se ejecuta cuando obtenemos la DB

  // 3. Función para guardar campaña (crear o editar)
  const handleSaveCampaign = async () => {
    if (!newCampaignName.trim()) return

    try {
      if (editingCampaignId) {
        // Editar existente
        const doc = await db.campaigns.findOne(editingCampaignId).exec()
        if (doc) {
          await doc.patch({
            name: newCampaignName.trim(),
            system: newCampaignSystem.trim(),
            systemColor: newCampaignSystemColor,
            description: newCampaignDescription.trim() || t('campaigns.form.defaultDescription'),
            backgroundImage: newCampaignBackgroundImage
          })
        }
      } else {
        // Crear nueva
        const systemName = newCampaignSystem.trim()

        // Verificar si el tag existe, si no, crearlo
        try {
          const existingTag = await db.gameSystemTags
            .findOne({
              selector: { name: systemName }
            })
            .exec()

          if (!existingTag) {
            await db.gameSystemTags.insert({
              id: `tag_${Date.now()}`,
              name: systemName,
              color: newCampaignSystemColor,
              createdAt: Date.now()
            })
          }
        } catch (tagError) {
          console.error('Error verificando/creando tag:', tagError)
          // No bloqueamos la creación de la campaña si falla el tag
        }

        const newCampaign = {
          id: `camp_${Date.now()}`,
          name: newCampaignName.trim(),
          system: systemName,
          systemColor: newCampaignSystemColor,
          createdAt: Date.now(),
          description: newCampaignDescription.trim() || t('campaigns.form.defaultDescription'),
          backgroundImage: newCampaignBackgroundImage
        }
        await db.campaigns.insert(newCampaign)
      }

      closeModal()
      addToast(
        editingCampaignId ? t('campaigns.edit.success') : t('campaigns.create.success'),
        'success'
      )
    } catch (error: unknown) {
      console.error('Error al guardar:', error)
      addToast(`Error: ${(error as Error).message}`, 'error')
    }
  }

  const closeModal = () => {
    setShowCreateModal(false)
    setEditingCampaignId(null)
    setNewCampaignName('')
    setNewCampaignSystem('')
    setNewCampaignSystemColor('indigo')
    setNewCampaignDescription('')
    setNewCampaignBackgroundImage('')
  }

  const openEditModal = (campaign: Campaign, e: React.MouseEvent) => {
    e.stopPropagation()
    setEditingCampaignId(campaign.id)
    setNewCampaignName(campaign.name)
    setNewCampaignSystem(campaign.system)
    setNewCampaignSystemColor(campaign.systemColor)
    setNewCampaignDescription(campaign.description)
    setNewCampaignBackgroundImage(campaign.backgroundImage || '')
    setShowCreateModal(true)
  }

  const removeCampaign = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()

    confirm({
      title: t('campaigns.delete.title'),
      message: t('campaigns.delete.confirm') + ' ' + t('campaigns.delete.message'),
      confirmText: t('common.delete'),
      type: 'danger',
      onConfirm: async () => {
        try {
          const doc = await db.campaigns.findOne(id).exec()
          if (doc) {
            await doc.remove()
            addToast(t('campaigns.delete.success'), 'success')
          }
        } catch (error: unknown) {
          console.error('Error al borrar:', error)
          addToast(`Error: ${(error as Error).message}`, 'error')
        }
      }
    })
  }

  // Atajos de teclado
  useKeyboardShortcut('Escape', () => closeModal(), showCreateModal)
  useKeyboardShortcut({ key: 'Enter', ctrlKey: true }, () => handleSaveCampaign(), showCreateModal)

  // 5. Renderizado
  return (
    <div className="p-8 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex justify-between items-end mb-8 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <BookOpen className="text-indigo-500" />
            {t('campaigns.title')}
          </h1>
          <p className="text-slate-400">{t('campaigns.description')}</p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-lg font-medium transition-all shadow-lg shadow-indigo-500/20 active:scale-95"
        >
          <Plus size={20} />
          {t('campaigns.new')}
        </button>
      </div>

      {/* Grid de Tarjetas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {campaigns.map((camp) => (
          <div
            key={camp.id}
            onClick={() => navigate(`/campaign/${camp.id}`)}
            className="group bg-slate-900 border border-slate-800 rounded-2xl hover:border-indigo-500/50 hover:bg-slate-800/50 transition-all duration-300 relative overflow-hidden cursor-pointer active:scale-[0.98] flex flex-col h-full"
          >
            {/* Imagen de fondo (Banner) */}
            <div className="h-32 w-full relative overflow-hidden bg-slate-950">
              {camp.backgroundImage ? (
                <img
                  src={camp.backgroundImage}
                  alt={camp.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
                  <BookOpen className="text-slate-700" size={32} />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent opacity-60"></div>

              {/* Tags sobre la imagen */}
              <div className="absolute top-4 right-4">
                <span
                  className={`text-xs font-bold bg-slate-950/80 backdrop-blur-sm px-2 py-1 rounded uppercase tracking-wider border ${
                    TAG_COLOR_CLASSES[camp.systemColor]?.bg || TAG_COLOR_CLASSES.indigo.bg
                  } ${TAG_COLOR_CLASSES[camp.systemColor]?.text || TAG_COLOR_CLASSES.indigo.text} ${
                    TAG_COLOR_CLASSES[camp.systemColor]?.border || TAG_COLOR_CLASSES.indigo.border
                  }`}
                >
                  {camp.system}
                </span>
              </div>
            </div>

            <div className="p-6 pt-4 relative z-10 flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-xl font-bold text-white group-hover:text-indigo-300 transition-colors truncate flex-1 mr-2">
                  {camp.name}
                </h3>
                <div className="flex gap-1 -mt-1 -mr-1">
                  <Tooltip content={t('common.edit')}>
                    <button
                      onClick={(e) => openEditModal(camp, e)}
                      className="text-slate-600 hover:text-indigo-400 transition-colors p-1 hover:bg-indigo-500/10 rounded"
                    >
                      <Pencil size={18} />
                    </button>
                  </Tooltip>
                  <Tooltip content={t('campaigns.delete.title')}>
                    <button
                      onClick={(e) => removeCampaign(camp.id, e)}
                      className="text-slate-600 hover:text-red-500 transition-colors p-1 hover:bg-red-500/10 rounded"
                    >
                      <Trash2 size={18} />
                    </button>
                  </Tooltip>
                </div>
              </div>

              <p className="text-slate-500 text-sm mb-6 line-clamp-2 h-10 flex-1">
                {camp.description}
              </p>

              <div className="flex items-center text-xs text-slate-600 gap-2 pt-4 border-t border-slate-800/50 mt-auto">
                <Calendar size={14} />
                <span>
                  {t('campaigns.detail.createdAt')}: {new Date(camp.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        ))}

        {/* Estado Vacío */}
        {campaigns.length === 0 && (
          <div className="col-span-full py-20 flex flex-col items-center justify-center border-2 border-dashed border-slate-800 rounded-3xl bg-slate-900/20 text-slate-500">
            <div className="bg-slate-900 p-4 rounded-full mb-4">
              <BookOpen size={48} className="text-slate-700" />
            </div>
            <p className="text-lg font-medium text-slate-400">{t('campaigns.noCampaigns')}</p>
            <p className="text-sm opacity-60">{t('campaigns.noCampaignsDesc')}</p>
          </div>
        )}
      </div>

      {/* Modal para crear campaña */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between sticky top-0 bg-slate-900 z-10">
              <h2 className="text-2xl font-bold text-white">
                {editingCampaignId ? t('common.edit') : t('campaigns.new')}
              </h2>
              <button
                onClick={closeModal}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleSaveCampaign()
              }}
              className="p-6 space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="campaignName"
                      className="block text-sm font-medium text-slate-300 mb-2"
                    >
                      {t('campaigns.form.name')} *
                    </label>
                    <input
                      id="campaignName"
                      type="text"
                      value={newCampaignName}
                      onChange={(e) => setNewCampaignName(e.target.value)}
                      placeholder={t('campaigns.form.namePlaceholder')}
                      autoFocus
                      required
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <TagSelector
                      selectedTag={newCampaignSystem}
                      onTagSelect={(tagName, tagColor) => {
                        setNewCampaignSystem(tagName)
                        setNewCampaignSystemColor(tagColor)
                      }}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="campaignDescription"
                      className="block text-sm font-medium text-slate-300 mb-2"
                    >
                      {t('campaigns.form.description')}
                    </label>
                    <textarea
                      id="campaignDescription"
                      value={newCampaignDescription}
                      onChange={(e) => setNewCampaignDescription(e.target.value)}
                      placeholder={t('campaigns.form.descriptionPlaceholder')}
                      rows={4}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                    />
                  </div>
                </div>

                <div>
                  <ImageUploader
                    label="Imagen de Portada (Banner)"
                    currentImage={newCampaignBackgroundImage}
                    onImageChange={setNewCampaignBackgroundImage}
                    size="banner"
                  />
                  <p className="text-xs text-slate-500 mt-2">
                    Esta imagen se mostrará en el dashboard y en la lista de campañas.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={!newCampaignName.trim()}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-600 text-white px-4 py-2.5 rounded-lg font-medium transition-colors disabled:cursor-not-allowed"
                >
                  {editingCampaignId ? t('common.save') : t('common.create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

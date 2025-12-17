import { useTranslation } from 'react-i18next'
import { Settings as SettingsIcon, Languages, Info, Layout } from 'lucide-react'
import LanguageSelector from '../components/ui/LanguageSelector'
import BackButton from '../components/ui/BackButton'
import { useSettings } from '../context/SettingsContext'

export default function Settings() {
  const { t } = useTranslation()
  const { sidebarAutoHide, setSidebarAutoHide } = useSettings()

  return (
    <div className="p-8 max-w-4xl mx-auto w-full">
      <BackButton fallbackPath="/dashboard" />

      {/* Header */}
      <div className="mb-8 border-b border-slate-800 pb-6">
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <SettingsIcon className="text-indigo-500" />
          {t('settings.title')}
        </h1>
        <p className="text-slate-400">{t('settings.description')}</p>
      </div>

      {/* Sección de Idioma */}
      <div className="space-y-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-start gap-4">
            <div className="bg-indigo-500/10 p-3 rounded-xl">
              <Languages className="text-indigo-400" size={24} />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-white mb-2">
                {t('settings.language')}
              </h2>
              <p className="text-slate-400 mb-4 text-sm">
                {t('settings.selectLanguage')}
              </p>
              <LanguageSelector />

              <div className="mt-4 p-3 bg-slate-800/50 border border-slate-700 rounded-lg">
                <p className="text-xs text-slate-400">
                  <Info size={14} className="inline mr-1" />
                  {t('settings.languageInfo')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Sección de Apariencia */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-start gap-4">
            <div className="bg-purple-500/10 p-3 rounded-xl">
              <Layout className="text-purple-400" size={24} />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-white mb-2">
                {t('settings.appearance.title')}
              </h2>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">{t('settings.appearance.sidebarAutoHide')}</p>
                  <p className="text-sm text-slate-400">{t('settings.appearance.sidebarAutoHideDesc')}</p>
                </div>
                <button
                  onClick={() => setSidebarAutoHide(!sidebarAutoHide)}
                  className={`
                    relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-900
                    ${sidebarAutoHide ? 'bg-indigo-600' : 'bg-slate-700'}
                  `}
                >
                  <span
                    className={`
                      inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                      ${sidebarAutoHide ? 'translate-x-6' : 'translate-x-1'}
                    `}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Información de la Aplicación */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-start gap-4">
            <div className="bg-slate-500/10 p-3 rounded-xl">
              <Info className="text-slate-400" size={24} />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-white mb-2">
                {t('settings.about')}
              </h2>
              <div className="space-y-2 text-sm text-slate-400">
                <p>
                  <span className="font-medium text-slate-300">DM Toolbox</span> v0.3.1
                </p>
                <p>
                  {t('settings.appSubtitle')}
                </p>
                <p className="text-xs text-slate-500 pt-2">
                  {t('settings.buildBy')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

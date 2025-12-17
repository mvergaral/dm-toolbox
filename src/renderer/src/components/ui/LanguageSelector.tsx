import { useTranslation } from 'react-i18next'
import { Languages } from 'lucide-react'

const LanguageSelector = () => {
  const { i18n, t } = useTranslation()

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng)
  }

  return (
    <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-lg p-2">
      <Languages size={18} className="text-slate-400" />
      <select
        value={i18n.language}
        onChange={(e) => changeLanguage(e.target.value)}
        className="bg-transparent text-white text-sm focus:outline-none cursor-pointer"
      >
        <option value="es" className="bg-slate-800">
          {t('settings.spanish')}
        </option>
        <option value="en" className="bg-slate-800">
          {t('settings.english')}
        </option>
      </select>
    </div>
  )
}

export default LanguageSelector

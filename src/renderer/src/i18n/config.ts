import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import es from './locales/es.json'
import en from './locales/en.json'

// Detectar idioma guardado o usar el del navegador
const savedLanguage = localStorage.getItem('language')
const browserLanguage = navigator.language.split('-')[0] // 'es-ES' -> 'es'
const defaultLanguage = savedLanguage || (browserLanguage === 'es' || browserLanguage === 'en' ? browserLanguage : 'es')

i18n
  .use(initReactI18next)
  .init({
    resources: {
      es: { translation: es },
      en: { translation: en }
    },
    lng: defaultLanguage,
    fallbackLng: 'es',
    interpolation: {
      escapeValue: false // React ya escapa por defecto
    }
  })

// Guardar idioma cuando cambie
i18n.on('languageChanged', (lng) => {
  localStorage.setItem('language', lng)
})

export default i18n

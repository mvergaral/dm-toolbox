import { useEffect } from 'react'
import { Sidebar } from './Sidebar'
import { useSettings } from '../../context/SettingsContext'
import { useToast } from '../../context/ToastContext'
import { useTranslation } from 'react-i18next'

export function MainLayout({ children }: { children: React.ReactNode }) {
  const { checkForUpdates } = useSettings()
  const { addToast } = useToast()
  const { t } = useTranslation()

  useEffect(() => {
    const check = async () => {
      // @ts-ignore: window.api is not typed in global scope yet
      if (checkForUpdates && window.api && window.api.checkForUpdates) {
        try {
          // @ts-ignore: window.api is not typed in global scope yet
          const result = await window.api.checkForUpdates()
          if (result.updateAvailable) {
            addToast(t('common.updateAvailable', { version: result.version }), 'info', 10000)
          }
        } catch (error) {
          console.error('Failed to check for updates', error)
        }
      }
    }

    check()
  }, [checkForUpdates, addToast, t])

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-950 text-slate-200 font-sans">
      {/* Columna Izquierda: Menú */}
      <Sidebar />

      {/* Columna Derecha: Área de Trabajo */}
      <main className="flex-1 overflow-auto relative flex flex-col">
        {/* Aquí renderizaremos las diferentes vistas (Mapas, Combate, etc.) */}
        {children}
      </main>
    </div>
  )
}

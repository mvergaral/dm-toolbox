import React, { createContext, useContext, useState, useCallback } from 'react'
import { AlertTriangle } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface ConfirmationOptions {
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  type?: 'danger' | 'warning' | 'info'
  onConfirm: () => void
  onCancel?: () => void
}

interface ConfirmationContextType {
  confirm: (options: ConfirmationOptions) => void
}

const ConfirmationContext = createContext<ConfirmationContextType | null>(null)

export function ConfirmationProvider({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const [options, setOptions] = useState<ConfirmationOptions | null>(null)

  const confirm = useCallback((opts: ConfirmationOptions) => {
    setOptions(opts)
    setIsOpen(true)
  }, [])

  const handleConfirm = () => {
    if (options?.onConfirm) {
      options.onConfirm()
    }
    setIsOpen(false)
    setOptions(null)
  }

  const handleCancel = () => {
    if (options?.onCancel) {
      options.onCancel()
    }
    setIsOpen(false)
    setOptions(null)
  }

  return (
    <ConfirmationContext.Provider value={{ confirm }}>
      {children}
      {isOpen && options && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6">
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-full shrink-0 ${
                  options.type === 'danger' ? 'bg-red-500/10 text-red-500' :
                  options.type === 'warning' ? 'bg-amber-500/10 text-amber-500' :
                  'bg-blue-500/10 text-blue-500'
                }`}>
                  <AlertTriangle size={24} />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-white mb-2">{options.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{options.message}</p>
                </div>
              </div>
            </div>

            <div className="bg-slate-950/50 px-6 py-4 flex justify-end gap-3 border-t border-slate-800">
              <button
                onClick={handleCancel}
                className="px-4 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              >
                {options.cancelText || t('common.cancel')}
              </button>
              <button
                onClick={handleConfirm}
                className={`px-4 py-2 rounded-lg text-sm font-medium text-white shadow-lg transition-all active:scale-95 ${
                  options.type === 'danger' ? 'bg-red-600 hover:bg-red-500 shadow-red-500/20' :
                  options.type === 'warning' ? 'bg-amber-600 hover:bg-amber-500 shadow-amber-500/20' :
                  'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-500/20'
                }`}
              >
                {options.confirmText || t('common.confirm')}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmationContext.Provider>
  )
}

export function useConfirm() {
  const context = useContext(ConfirmationContext)
  if (!context) {
    throw new Error('useConfirm must be used within a ConfirmationProvider')
  }
  return context
}

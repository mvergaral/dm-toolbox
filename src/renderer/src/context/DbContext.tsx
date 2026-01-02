import React, { createContext, useContext, useState, useEffect, useRef } from 'react'
import { getDatabase, Database } from '../db'

const DbContext = createContext<Database | null>(null)

export function DbProvider({ children }: { children: React.ReactNode }) {
  const [db, setDb] = useState<Database | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Usar ref para evitar múltiples inicializaciones en Strict Mode
  const initialized = useRef(false)

  useEffect(() => {
    if (initialized.current) return
    initialized.current = true

    const init = async () => {
      try {
        const database = await getDatabase()
        setDb(database)
        setIsLoading(false)
      } catch (err: unknown) {
        setError((err as Error).message || 'Error al conectar con la base de datos')
        setIsLoading(false)
      }
    }

    init()
  }, [])

  if (error) {
    return (
      <div className="h-screen bg-slate-900 flex flex-col items-center justify-center p-10">
        <h1 className="text-2xl font-bold text-red-500 mb-4">Error de Base de Datos</h1>
        <p className="text-white bg-red-900/20 p-4 rounded border border-red-500 max-w-2xl mb-6">
          {error}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="bg-indigo-600 hover:bg-indigo-700 px-6 py-3 rounded-lg text-white transition-colors"
        >
          Reintentar
        </button>
      </div>
    )
  }

  if (isLoading || !db) {
    return (
      <div className="h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return <DbContext.Provider value={db}>{children}</DbContext.Provider>
}

export function useDB() {
  const context = useContext(DbContext)
  if (!context) {
    throw new Error('useDB debe usarse dentro de un DbProvider')
  }
  return context
}

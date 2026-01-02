import { useEffect } from 'react'

type KeyCombo = {
  key: string
  ctrlKey?: boolean
  metaKey?: boolean
  shiftKey?: boolean
  altKey?: boolean
}

export function useKeyboardShortcut(
  combo: KeyCombo | string,
  callback: (e: KeyboardEvent) => void,
  enabled: boolean = true
) {
  useEffect(() => {
    if (!enabled) return

    const handleKeyDown = (event: KeyboardEvent) => {
      // Si es un string simple (ej: "Escape")
      if (typeof combo === 'string') {
        if (event.key === combo) {
          // No prevenimos default para teclas simples como Escape a menos que sea necesario,
          // pero para atajos tipo Ctrl+S sí es buena práctica.
          // En este caso, dejaremos que el callback decida o lo haremos configurable.
          // Para consistencia con el resto, llamamos al callback.
          callback(event)
        }
        return
      }

      // Lógica para combinaciones
      const matchesKey = event.key.toLowerCase() === combo.key.toLowerCase()

      // Verificamos modificadores
      // Si se pide ctrlKey, aceptamos Ctrl o Meta (Command en Mac)
      const requiredCtrl = !!combo.ctrlKey || !!combo.metaKey
      const pressedCtrl = event.ctrlKey || event.metaKey

      const requiredShift = !!combo.shiftKey
      const pressedShift = event.shiftKey

      const requiredAlt = !!combo.altKey
      const pressedAlt = event.altKey

      if (
        matchesKey &&
        requiredCtrl === pressedCtrl &&
        requiredShift === pressedShift &&
        requiredAlt === pressedAlt
      ) {
        event.preventDefault()
        callback(event)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [combo, callback, enabled])
}

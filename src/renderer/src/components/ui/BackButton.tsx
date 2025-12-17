import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface BackButtonProps {
  label?: string
  fallbackPath?: string
  className?: string
  iconSize?: number
}

/**
 * Botón de navegación que vuelve a la página anterior en el historial.
 * Si no hay historial previo, navega a fallbackPath.
 */
export default function BackButton({
  label = 'Volver',
  fallbackPath = '/',
  className = '',
  iconSize = 20
}: BackButtonProps) {
  const navigate = useNavigate()

  const handleBack = () => {
    // Verificar si hay historial previo
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1)
    } else {
      navigate(fallbackPath)
    }
  }

  return (
    <button
      onClick={handleBack}
      className={`inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors group ${className}`}
    >
      <ArrowLeft size={iconSize} className="group-hover:-translate-x-1 transition-transform" />
      <span>{label}</span>
    </button>
  )
}

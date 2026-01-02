import { useState, useRef } from 'react'
import { Upload, X, ImageIcon } from 'lucide-react'

interface ImageUploaderProps {
  currentImage?: string
  onImageChange: (imageData: string) => void
  size?: 'small' | 'medium' | 'large' | 'banner'
  label?: string
}

const SIZE_CONFIG = {
  small: {
    container: 'w-20 h-20',
    maxWidth: 80,
    maxHeight: 80
  },
  medium: {
    container: 'w-32 h-32',
    maxWidth: 128,
    maxHeight: 128
  },
  large: {
    container: 'w-48 h-48',
    maxWidth: 192,
    maxHeight: 192
  },
  banner: {
    container: 'w-full h-48',
    maxWidth: 1200,
    maxHeight: 600
  }
}

export default function ImageUploader({
  currentImage,
  onImageChange,
  size = 'medium',
  label = 'Imagen'
}: ImageUploaderProps) {
  const [preview, setPreview] = useState<string>(currentImage || '')
  const [isProcessing, setIsProcessing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const config = SIZE_CONFIG[size]

  const resizeImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()

      reader.onload = (e) => {
        const img = new Image()
        img.onload = () => {
          const canvas = document.createElement('canvas')
          let width = img.width
          let height = img.height

          // Calcular dimensiones manteniendo aspect ratio
          if (width > height) {
            if (width > config.maxWidth) {
              height = (height * config.maxWidth) / width
              width = config.maxWidth
            }
          } else {
            if (height > config.maxHeight) {
              width = (width * config.maxHeight) / height
              height = config.maxHeight
            }
          }

          canvas.width = width
          canvas.height = height

          const ctx = canvas.getContext('2d')
          if (!ctx) {
            reject(new Error('No se pudo obtener el contexto del canvas'))
            return
          }

          ctx.drawImage(img, 0, 0, width, height)
          const resizedBase64 = canvas.toDataURL('image/jpeg', 0.8)
          resolve(resizedBase64)
        }

        img.onerror = () => reject(new Error('Error al cargar la imagen'))
        img.src = e.target?.result as string
      }

      reader.onerror = () => reject(new Error('Error al leer el archivo'))
      reader.readAsDataURL(file)
    })
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona un archivo de imagen válido')
      return
    }

    // Validar tamaño (máximo 5MB antes de redimensionar)
    if (file.size > 5 * 1024 * 1024) {
      alert('La imagen es muy grande. Máximo 5MB')
      return
    }

    setIsProcessing(true)
    try {
      const resizedImage = await resizeImage(file)
      setPreview(resizedImage)
      onImageChange(resizedImage)
    } catch (error) {
      console.error('Error procesando imagen:', error)
      alert('Error al procesar la imagen')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleRemove = () => {
    setPreview('')
    onImageChange('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div>
      {label && <label className="block text-sm font-medium text-slate-300 mb-2">{label}</label>}

      <div className="flex items-center gap-4">
        {/* Preview/Upload area */}
        <div
          className={`relative ${config.container} rounded-lg border-2 border-dashed transition-all ${
            preview
              ? 'border-slate-700 bg-slate-800'
              : 'border-slate-700 bg-slate-900 hover:border-indigo-500/50 cursor-pointer'
          }`}
          onClick={() => !preview && fileInputRef.current?.click()}
        >
          {preview ? (
            <>
              <img src={preview} alt="Preview" className="w-full h-full object-cover rounded-lg" />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  handleRemove()
                }}
                className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 transition-colors shadow-lg"
                title="Eliminar imagen"
              >
                <X size={14} />
              </button>
            </>
          ) : isProcessing ? (
            <div className="w-full h-full flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-slate-600">
              <ImageIcon size={24} />
              <span className="text-xs mt-1">Subir</span>
            </div>
          )}
        </div>

        {/* Upload button (si hay preview) */}
        {preview && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-lg text-sm transition-colors"
          >
            <Upload size={16} />
            Cambiar
          </button>
        )}

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      <p className="text-xs text-slate-500 mt-2">Formatos: JPG, PNG, GIF. Máximo 5MB</p>
    </div>
  )
}

import React, { useState } from 'react'
import { FileText, Scissors } from 'lucide-react'
import useWhiteboardStore from '../../store/useWhiteboardStore'

const CardCreator = () => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [text, setText] = useState('')
  const [separator, setSeparator] = useState(',')
  const [selectedColor, setSelectedColor] = useState('#ffeb3b')
  const { addElement } = useWhiteboardStore()

  // Predefined colors with their text colors
  const colorOptions = [
    { color: '#ffeb3b', textColor: '#333', name: 'Amarillo' },
    { color: '#f44336', textColor: '#fff', name: 'Rojo' },
    { color: '#4caf50', textColor: '#fff', name: 'Verde' },
    { color: '#2196f3', textColor: '#fff', name: 'Azul' },
    { color: '#9c27b0', textColor: '#fff', name: 'Púrpura' },
    { color: '#ff9800', textColor: '#fff', name: 'Naranja' },
    { color: '#00bcd4', textColor: '#fff', name: 'Cian' },
    { color: '#e91e63', textColor: '#fff', name: 'Rosa' },
    { color: '#795548', textColor: '#fff', name: 'Marrón' },
    { color: '#607d8b', textColor: '#fff', name: 'Gris' },
    { color: '#ffffff', textColor: '#333', name: 'Blanco' },
    { color: '#000000', textColor: '#fff', name: 'Negro' }
  ]

  const handleCreateCards = () => {
    if (!text.trim()) return

    // Split text by separator
    const phrases = text.split(separator).map(phrase => phrase.trim()).filter(phrase => phrase.length > 0)
    
    if (phrases.length === 0) return

    // Get selected color option
    const colorOption = colorOptions.find(option => option.color === selectedColor) || colorOptions[0]

    // Create cards for each phrase
    phrases.forEach((phrase, index) => {
      const cardElement = {
        type: 'sticky',
        x: 100 + (index % 3) * 220, // Arrange in grid
        y: 100 + Math.floor(index / 3) * 170,
        width: 200,
        height: 150,
        color: colorOption.color,
        textColor: colorOption.textColor,
        text: phrase
      }

      addElement(cardElement)
    })

    // Clear the form
    setText('')
    setIsExpanded(false)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleCreateCards()
    }
  }

  if (!isExpanded) {
    return (
      <div className="p-4 border-b border-gray-200">
        <button
          onClick={() => setIsExpanded(true)}
          className="w-full flex items-center justify-center gap-2 p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
        >
          <FileText size={16} />
          <span className="text-sm font-medium text-blue-700">Crear Tarjetas</span>
        </button>
      </div>
    )
  }

  return (
    <div className="p-4 border-b border-gray-200">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-700">Crear Tarjetas</h3>
        <button
          onClick={() => setIsExpanded(false)}
          className="text-gray-400 hover:text-gray-600"
        >
          ×
        </button>
      </div>

      <div className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Texto a dividir
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full h-24 p-2 text-sm border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Escribe el texto que quieres dividir en tarjetas..."
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Separador
          </label>
          <input
            type="text"
            value={separator}
            onChange={(e) => setSeparator(e.target.value)}
            className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder=","
            maxLength={50}
          />
          <p className="text-xs text-gray-500 mt-1">
            Ejemplos: , (coma), . (punto), Postdata: (palabra), | (barra)
          </p>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-2">
            Color de las tarjetas
          </label>
          <div className="grid grid-cols-6 gap-2">
            {colorOptions.map((option) => (
              <button
                key={option.color}
                onClick={() => setSelectedColor(option.color)}
                className={`w-8 h-8 rounded-lg border-2 transition-all ${
                  selectedColor === option.color
                    ? 'border-gray-800 scale-110'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                style={{ backgroundColor: option.color }}
                title={option.name}
              >
                {selectedColor === option.color && (
                  <div className="w-full h-full flex items-center justify-center">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: option.textColor }}
                    />
                  </div>
                )}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            El color del texto se ajusta automáticamente
          </p>
        </div>

        <button
          onClick={handleCreateCards}
          disabled={!text.trim()}
          className="w-full flex items-center justify-center gap-2 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          <Scissors size={16} />
          <span className="text-sm font-medium">Crear Tarjetas</span>
        </button>

        <p className="text-xs text-gray-500 text-center">
          Ctrl + Enter para crear rápidamente
        </p>
      </div>
    </div>
  )
}

export default CardCreator

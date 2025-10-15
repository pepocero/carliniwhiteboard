import React, { useState, useEffect } from 'react'
import { X, Check, Type } from 'lucide-react'
import useWhiteboardStore from '../../store/useWhiteboardStore'

const StickyNoteEditModal = () => {
  const { selectedElement, updateElement } = useWhiteboardStore()
  const [text, setText] = useState('')
  const [fontSize, setFontSize] = useState(14)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (selectedElement && selectedElement.type === 'sticky' && selectedElement.isEditing) {
      setText(selectedElement.text || '')
      setFontSize(selectedElement.fontSize || 14)
      setIsVisible(true)
    } else {
      setIsVisible(false)
    }
  }, [selectedElement])

  const handleSubmit = () => {
    if (selectedElement) {
      updateElement(selectedElement.id, {
        text: text,
        fontSize: fontSize,
        isEditing: false
      })
    }
    setIsVisible(false)
  }

  const handleCancel = () => {
    if (selectedElement) {
      updateElement(selectedElement.id, {
        isEditing: false
      })
    }
    setIsVisible(false)
  }

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      handleCancel()
    }
  }

  if (!selectedElement || selectedElement.type !== 'sticky' || !selectedElement.isEditing || !isVisible) {
    return null
  }

  return (
    <div 
      className="modal-overlay"
      onClick={handleOverlayClick}
    >
      <div className="modal-content">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Editar Nota Adhesiva</h3>
          <button
            onClick={handleCancel}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <Type size={16} />
            Tamaño de fuente: {fontSize}px
          </label>
          <input
            type="range"
            min="10"
            max="32"
            value={fontSize}
            onChange={(e) => setFontSize(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>10px</span>
            <span>32px</span>
          </div>
        </div>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          style={{ fontSize: `${fontSize}px` }}
          className="w-full h-48 p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Escribe tu nota aquí..."
          autoFocus
        />

        <div className="flex gap-2 mt-4">
          <button
            onClick={handleCancel}
            className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Check size={18} />
            Guardar
          </button>
        </div>
      </div>
    </div>
  )
}

export default StickyNoteEditModal

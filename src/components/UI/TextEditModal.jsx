import React, { useState, useEffect } from 'react'
import useWhiteboardStore from '../../store/useWhiteboardStore'

const TextEditModal = () => {
  const { selectedElement, updateElement, setSelectedElement } = useWhiteboardStore()
  const [text, setText] = useState('')
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (selectedElement && selectedElement.type === 'text' && selectedElement.isEditing) {
      setText(selectedElement.text || '')
      setIsVisible(true)
    } else {
      setIsVisible(false)
    }
  }, [selectedElement])

  // Don't render if no selected element or not editing
  if (!selectedElement || selectedElement.type !== 'text' || !selectedElement.isEditing || !isVisible) {
    return null
  }

  const handleSubmit = () => {
    if (selectedElement && selectedElement.type === 'text') {
      updateElement(selectedElement.id, {
        text: text
      })
    }
    setIsVisible(false)
    setSelectedElement(null)
  }

  const handleCancel = () => {
    setIsVisible(false)
    setSelectedElement(null)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    } else if (e.key === 'Escape') {
      handleCancel()
    }
  }


  return (
    <div className="modal-overlay">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900">Editar Texto</h3>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full min-h-[120px] p-4 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
          placeholder="Escribe tu texto aquí..."
          autoFocus
        />
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={handleCancel}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors rounded-lg hover:bg-gray-100"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  )
}

export default TextEditModal

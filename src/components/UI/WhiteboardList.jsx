import React, { useState, useEffect } from 'react'
import { Plus, Trash2, Edit3, MoreVertical } from 'lucide-react'
import useWhiteboardStore from '../../store/useWhiteboardStore'

const WhiteboardList = () => {
  const {
    whiteboards,
    currentWhiteboard,
    loadWhiteboards,
    loadWhiteboard,
    deleteWhiteboard,
    createWhiteboard,
    isLoading
  } = useWhiteboardStore()

  const [editingId, setEditingId] = useState(null)
  const [editingName, setEditingName] = useState('')
  const [showMenu, setShowMenu] = useState(null)

  useEffect(() => {
    loadWhiteboards()
  }, [loadWhiteboards])

  const handleCreateWhiteboard = async () => {
    await createWhiteboard()
  }

  const handleLoadWhiteboard = async (id) => {
    await loadWhiteboard(id)
  }

  const handleDeleteWhiteboard = async (id, e) => {
    e.stopPropagation()
    if (confirm('¿Estás seguro de que quieres eliminar este tablero?')) {
      await deleteWhiteboard(id)
    }
    setShowMenu(null)
  }

  const handleEditStart = (whiteboard, e) => {
    e.stopPropagation()
    setEditingId(whiteboard.id)
    setEditingName(whiteboard.name)
    setShowMenu(null)
  }

  const handleEditSubmit = async (id) => {
    if (editingName.trim()) {
      // Update whiteboard name
      // This would need to be implemented in the store
      setEditingId(null)
      setEditingName('')
    }
  }

  const handleEditCancel = () => {
    setEditingId(null)
    setEditingName('')
  }

  const handleEditKeyDown = (e, id) => {
    if (e.key === 'Enter') {
      handleEditSubmit(id)
    } else if (e.key === 'Escape') {
      handleEditCancel()
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now - date
    
    if (diff < 86400000) { // Less than 1 day
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } else if (diff < 604800000) { // Less than 1 week
      return date.toLocaleDateString([], { weekday: 'short' })
    } else {
      return date.toLocaleDateString()
    }
  }

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Tableros</h2>
          <button
            onClick={handleCreateWhiteboard}
            className="btn btn-primary"
            disabled={isLoading}
          >
            <Plus size={16} />
            <span>Nuevo</span>
          </button>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-4 text-center text-gray-500">
            Cargando tableros...
          </div>
        ) : whiteboards.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            <div className="mb-4">
              <div className="w-16 h-16 bg-gray-100 rounded-lg mx-auto flex items-center justify-center">
                <Plus size={24} className="text-gray-400" />
              </div>
            </div>
            <p className="text-sm">No tienes tableros aún</p>
            <p className="text-xs text-gray-400 mt-1">
              Crea tu primer tablero para comenzar
            </p>
          </div>
        ) : (
          <div className="p-2">
            {whiteboards.map((whiteboard) => (
              <div
                key={whiteboard.id}
                className={`p-3 rounded-lg cursor-pointer transition-colors relative group ${
                  currentWhiteboard?.id === whiteboard.id
                    ? 'bg-blue-50 border border-blue-200'
                    : 'hover:bg-gray-50'
                }`}
                onClick={() => handleLoadWhiteboard(whiteboard.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    {editingId === whiteboard.id ? (
                      <input
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        onBlur={() => handleEditSubmit(whiteboard.id)}
                        onKeyDown={(e) => handleEditKeyDown(e, whiteboard.id)}
                        className="w-full text-sm font-medium text-gray-900 bg-transparent border-b border-blue-500 outline-none"
                        autoFocus
                      />
                    ) : (
                      <h3 className="text-sm font-medium text-gray-900 truncate">
                        {whiteboard.name}
                      </h3>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDate(whiteboard.updated_at)}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => handleEditStart(whiteboard, e)}
                      className="p-1 hover:bg-gray-200 rounded"
                      title="Renombrar"
                    >
                      <Edit3 size={12} />
                    </button>
                    <button
                      onClick={(e) => handleDeleteWhiteboard(whiteboard.id, e)}
                      className="p-1 hover:bg-red-100 rounded text-red-600"
                      title="Eliminar"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default WhiteboardList

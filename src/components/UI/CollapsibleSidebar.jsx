import React, { useState, useEffect } from 'react'
import { Plus, Trash2, X, ChevronRight } from 'lucide-react'
import useWhiteboardStore from '../../store/useWhiteboardStore'
import DeleteConfirmModal from './DeleteConfirmModal'
import CardCreator from './CardCreator'

const CollapsibleSidebar = ({ isOpen, onClose }) => {
  const {
    whiteboards,
    currentWhiteboard,
    loadWhiteboards,
    loadWhiteboard,
    deleteWhiteboard,
    createWhiteboard,
    isLoading
  } = useWhiteboardStore()

  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [activeTab, setActiveTab] = useState('whiteboards')

  useEffect(() => {
    if (isOpen) {
      loadWhiteboards()
    }
  }, [isOpen, loadWhiteboards])

  const handleCreateWhiteboard = async () => {
    await createWhiteboard()
  }

  const handleDeleteWhiteboard = async (whiteboard, e) => {
    e.stopPropagation()
    setDeleteConfirm(whiteboard)
  }

  const confirmDelete = async () => {
    if (deleteConfirm) {
      await deleteWhiteboard(deleteConfirm.id)
      setDeleteConfirm(null)
    }
  }

  if (!isOpen) return null

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-30 z-40"
        onClick={onClose}
      />

      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-80 bg-white shadow-xl z-50 flex flex-col">
        {/* Header */}
        <div className="h-14 border-b border-gray-200 flex items-center justify-between px-4">
          <h2 className="text-lg font-bold text-gray-900">Menú</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('whiteboards')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'whiteboards'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Tableros
          </button>
          <button
            onClick={() => setActiveTab('tools')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'tools'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Herramientas
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'whiteboards' ? (
            <div>
              {/* Create Button */}
              <div className="p-4 border-b border-gray-200">
                <button
                  onClick={handleCreateWhiteboard}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  disabled={isLoading}
                >
                  <Plus size={18} />
                  Nuevo Tablero
                </button>
              </div>

              {/* Whiteboards List */}
              {isLoading ? (
                <div className="p-8 text-center">
                  <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                  <p className="text-sm text-gray-500">Cargando...</p>
                </div>
              ) : whiteboards.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <p className="text-sm">No tienes tableros</p>
                  <p className="text-xs mt-1">Crea uno para comenzar</p>
                </div>
              ) : (
                <div className="p-2">
                  {whiteboards.map((whiteboard) => (
                    <div
                      key={whiteboard.id}
                      onClick={() => {
                        loadWhiteboard(whiteboard.id)
                        onClose()
                      }}
                      className={`group p-3 mb-2 rounded-lg cursor-pointer transition-all ${
                        currentWhiteboard?.id === whiteboard.id
                          ? 'bg-blue-50 border-2 border-blue-500'
                          : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 truncate mb-1">
                            {whiteboard.name}
                          </h4>
                          <p className="text-xs text-gray-500">
                            {new Date(whiteboard.updated_at).toLocaleDateString('es-ES', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                        <button
                          onClick={(e) => handleDeleteWhiteboard(whiteboard, e)}
                          className="opacity-0 group-hover:opacity-100 p-2 hover:bg-red-100 rounded text-red-600 transition-all"
                          title="Eliminar"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div>
              {/* Card Creator Tool */}
              <CardCreator />
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={confirmDelete}
        whiteboardName={deleteConfirm?.name || ''}
      />
    </>
  )
}

export default CollapsibleSidebar

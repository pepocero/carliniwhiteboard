import React, { useState } from 'react'
import Header from '../components/UI/Header'
import TopToolbar from '../components/UI/TopToolbar'
import CollapsibleSidebar from '../components/UI/CollapsibleSidebar'
import WhiteboardCanvas from '../components/Canvas/WhiteboardCanvas'
import TextEditModal from '../components/UI/TextEditModal'
import StickyNoteEditModal from '../components/UI/StickyNoteEditModal'
import EraserCursor from '../components/Canvas/EraserCursor'
import useWhiteboardStore from '../store/useWhiteboardStore'

const WhiteboardApp = () => {
  const { currentWhiteboard } = useWhiteboardStore()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <Header />
      <TopToolbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      
      <div className="flex-1 relative overflow-hidden">
        <CollapsibleSidebar 
          isOpen={sidebarOpen} 
          onClose={() => setSidebarOpen(false)} 
        />
        
        <div className="h-full w-full">
            {currentWhiteboard ? (
              <WhiteboardCanvas />
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="w-24 h-24 bg-gray-100 rounded-full mx-auto flex items-center justify-center mb-4">
                    <svg
                      className="w-12 h-12 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    Bienvenido a Carlini Whiteboard
                  </h2>
                  <p className="text-gray-600 mb-6">
                    Crea un nuevo tablero o abre uno existente para comenzar
                  </p>
                  <button
                    onClick={() => useWhiteboardStore.getState().createWhiteboard()}
                    className="btn btn-primary"
                  >
                    Crear Nuevo Tablero
                  </button>
                </div>
              </div>
            )}
        </div>
      </div>
      
      {/* Edit Modals */}
      <TextEditModal />
      <StickyNoteEditModal />
      
      {/* Eraser Cursor */}
      <EraserCursor />
    </div>
  )
}

export default WhiteboardApp

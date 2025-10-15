import React, { useState } from 'react'
import { Plus, FolderOpen, Share2, User, Settings, LogOut, LogIn } from 'lucide-react'
import useWhiteboardStore from '../../store/useWhiteboardStore'
import { useAuth } from '../../contexts/AuthContext'
import LoginModal from '../Auth/LoginModal'
import RegisterModal from '../Auth/RegisterModal'

const Header = () => {
  const {
    currentWhiteboard,
    createWhiteboard,
    loadWhiteboards,
    whiteboards,
    isLoading,
    isSaving,
    lastSaved
  } = useWhiteboardStore()

  const { user, logout, isAuthenticated } = useAuth()
  const [showWhiteboards, setShowWhiteboards] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showRegisterModal, setShowRegisterModal] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)

  const handleCreateWhiteboard = async () => {
    if (!isAuthenticated) {
      setShowLoginModal(true)
      return
    }
    await createWhiteboard()
  }

  const handleLoadWhiteboards = async () => {
    if (!isAuthenticated) {
      setShowLoginModal(true)
      return
    }
    await loadWhiteboards()
    setShowWhiteboards(true)
  }

  const handleLogout = () => {
    logout()
    setShowUserMenu(false)
  }

  const formatLastSaved = (timestamp) => {
    if (!timestamp) return ''
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now - date
    
    if (diff < 60000) return 'Guardado hace un momento'
    if (diff < 3600000) return `Guardado hace ${Math.floor(diff / 60000)} min`
    return `Guardado a las ${date.toLocaleTimeString()}`
  }

  return (
    <header className="h-20 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      {/* Left Section */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <img 
            src="/logo2.PNG" 
            alt="Carlini Whiteboard" 
            className="w-8 h-8 object-contain"
          />
          <h1 className="text-xl font-bold text-gray-900">Carlini Whiteboard</h1>
        </div>
      </div>

      {/* Center Section - Title */}
      <div className="flex-1 flex justify-center">
        <div className="text-center text-lg font-semibold text-gray-900">
          {currentWhiteboard?.name || 'Sin tablero seleccionado'}
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-3">
        {/* Status */}
        <div className="flex items-center gap-2 text-sm text-gray-500">
          {isSaving && (
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span>Guardando...</span>
            </div>
          )}
          {!isSaving && lastSaved && (
            <span>{formatLastSaved(lastSaved)}</span>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleCreateWhiteboard}
            className="btn btn-primary"
            disabled={isLoading}
          >
            <Plus size={16} />
            <span>Nuevo</span>
          </button>

          <button
            onClick={handleLoadWhiteboards}
            className="btn btn-secondary"
            disabled={isLoading}
          >
            <FolderOpen size={16} />
            <span>Abrir</span>
          </button>

          <button
            className="btn btn-secondary"
            disabled={!currentWhiteboard}
          >
            <Share2 size={16} />
            <span>Compartir</span>
          </button>

          {isAuthenticated ? (
            <div className="relative">
              <button 
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="btn btn-ghost flex items-center gap-2"
              >
                <User size={16} />
                <span className="hidden md:inline">{user?.name}</span>
              </button>
              
              {showUserMenu && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                  <div className="p-3 border-b border-gray-200">
                    <div className="font-medium text-gray-900">{user?.name}</div>
                    <div className="text-sm text-gray-500">{user?.email}</div>
                  </div>
                  <div className="p-2">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
                    >
                      <LogOut size={16} />
                      Cerrar Sesión
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button 
              onClick={() => setShowLoginModal(true)}
              className="btn btn-primary flex items-center gap-2"
            >
              <LogIn size={16} />
              <span>Iniciar Sesión</span>
            </button>
          )}

          <button className="btn btn-ghost">
            <Settings size={16} />
          </button>
        </div>
      </div>

      {/* Whiteboards Dropdown */}
      {showWhiteboards && (
        <div className="absolute top-20 right-6 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">Mis Tableros</h3>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {whiteboards.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No tienes tableros guardados
              </div>
            ) : (
              whiteboards.map((whiteboard) => (
                <div
                  key={whiteboard.id}
                  className="p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                  onClick={() => {
                    // Load whiteboard
                    setShowWhiteboards(false)
                  }}
                >
                  <div className="font-medium text-gray-900">{whiteboard.name}</div>
                  <div className="text-sm text-gray-500">
                    {new Date(whiteboard.updated_at).toLocaleDateString()}
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="p-3 border-t border-gray-200">
            <button
              onClick={() => setShowWhiteboards(false)}
              className="w-full btn btn-secondary"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* Auth Modals */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSwitchToRegister={() => {
          setShowLoginModal(false)
          setShowRegisterModal(true)
        }}
      />

      <RegisterModal
        isOpen={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
        onSwitchToLogin={() => {
          setShowRegisterModal(false)
          setShowLoginModal(true)
        }}
      />
    </header>
  )
}

export default Header

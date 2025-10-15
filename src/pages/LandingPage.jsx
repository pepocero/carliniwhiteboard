import React, { useState } from 'react'
import { Layout, Palette, Share2, Zap, ArrowRight, Users, Lock, Cloud } from 'lucide-react'
import LoginModal from '../components/Auth/LoginModal'
import RegisterModal from '../components/Auth/RegisterModal'

const LandingPage = () => {
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showRegisterModal, setShowRegisterModal] = useState(false)

  const features = [
    {
      icon: Palette,
      title: 'Herramientas Intuitivas',
      description: 'Dibuja, escribe, crea notas adhesivas y formas con facilidad'
    },
    {
      icon: Layout,
      title: 'Canvas Infinito',
      description: 'Espacio ilimitado que se expande automáticamente según lo necesites'
    },
    {
      icon: Zap,
      title: 'Auto-Guardado',
      description: 'Tus cambios se guardan automáticamente, nunca pierdas tu trabajo'
    },
    {
      icon: Users,
      title: 'Multitenant',
      description: 'Cada usuario tiene sus propios tableros privados y seguros'
    },
    {
      icon: Lock,
      title: 'Seguro',
      description: 'Autenticación JWT y encriptación de contraseñas con bcrypt'
    },
    {
      icon: Cloud,
      title: 'Serverless',
      description: 'Powered by Cloudflare Workers y D1 para máxima velocidad'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img 
              src="/logo2.PNG" 
              alt="Carlini Whiteboard" 
              className="w-10 h-10 object-contain"
            />
            <h1 className="text-2xl font-bold text-gray-900">Carlini Whiteboard</h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowLoginModal(true)}
              className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium transition-colors"
            >
              Iniciar Sesión
            </button>
            <button
              onClick={() => setShowRegisterModal(true)}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
            >
              Registrarse
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20 md:py-32">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Tu espacio creativo
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              sin límites
            </span>
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Crea, colabora y organiza tus ideas en un whiteboard infinito. 
            Potenciado por Cloudflare para máxima velocidad y seguridad.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => setShowRegisterModal(true)}
              className="px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold text-lg flex items-center justify-center gap-2 transition-all hover:scale-105 shadow-lg"
            >
              Comenzar Gratis
              <ArrowRight size={20} />
            </button>
            <button
              onClick={() => setShowLoginModal(true)}
              className="px-8 py-4 bg-white text-gray-700 rounded-lg hover:bg-gray-50 font-semibold text-lg border-2 border-gray-200 transition-all hover:scale-105"
            >
              Acceder
            </button>
          </div>
        </div>

        {/* Preview Image */}
        <div className="max-w-5xl mx-auto mt-16">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-4">
            <img 
              src="/whiteboard.png" 
              alt="Vista previa del whiteboard"
              className="w-full h-auto rounded-xl"
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-gray-900 mb-4">
              Todo lo que necesitas para crear
            </h3>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Herramientas potentes y fáciles de usar para dar vida a tus ideas
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <div
                key={index}
                className="p-6 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all"
              >
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="text-blue-600" size={24} />
                </div>
                <h4 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h4>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="max-w-4xl mx-auto bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12 text-center text-white">
          <h3 className="text-4xl font-bold mb-4">
            ¿Listo para empezar?
          </h3>
          <p className="text-xl mb-8 text-blue-100">
            Crea tu cuenta gratis y comienza a trabajar en segundos
          </p>
          <button
            onClick={() => setShowRegisterModal(true)}
            className="px-8 py-4 bg-white text-blue-600 rounded-lg hover:bg-blue-50 font-semibold text-lg transition-all hover:scale-105 inline-flex items-center gap-2"
          >
            Crear Cuenta Gratis
            <ArrowRight size={20} />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8">
        <div className="container mx-auto px-6 text-center">
          <p>&copy; 2024 Carlini Whiteboard. Powered by Cloudflare.</p>
        </div>
      </footer>

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
    </div>
  )
}

export default LandingPage

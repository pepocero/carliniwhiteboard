import React, { useState } from 'react'
import { 
  MousePointer, 
  Pen, 
  Eraser, 
  Type, 
  Square, 
  Circle, 
  Minus, 
  StickyNote,
  Undo,
  Redo,
  Save,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Menu,
  Palette
} from 'lucide-react'
import useWhiteboardStore from '../../store/useWhiteboardStore'

const TopToolbar = ({ onToggleSidebar }) => {
  const {
    currentTool,
    currentColor,
    strokeWidth,
    setCurrentTool,
    setCurrentColor,
    setStrokeWidth,
    save,
    scale,
    setScale,
    setPosition,
    selectedElement,
    updateElement
  } = useWhiteboardStore()

  const [showColorPicker, setShowColorPicker] = useState(false)

  const tools = [
    { id: 'select', icon: MousePointer, label: 'Seleccionar' },
    { id: 'pen', icon: Pen, label: 'Lápiz' },
    { id: 'eraser', icon: Eraser, label: 'Borrador' },
    { id: 'text', icon: Type, label: 'Texto' },
    { id: 'rect', icon: Square, label: 'Rectángulo' },
    { id: 'circle', icon: Circle, label: 'Círculo' },
    { id: 'line', icon: Minus, label: 'Línea' },
    { id: 'sticky', icon: StickyNote, label: 'Nota Adhesiva' }
  ]

  const colors = [
    '#000000', '#ffffff', '#ef4444', '#f59e0b', '#10b981', 
    '#3b82f6', '#8b5cf6', '#ec4899', '#6b7280', '#f97316'
  ]

  const handleZoomIn = () => {
    setScale(Math.min(scale * 1.2, 5))
  }

  const handleZoomOut = () => {
    setScale(Math.max(scale * 0.8, 0.1))
  }

  const handleResetZoom = () => {
    setScale(1)
    setPosition({ x: 0, y: 0 })
  }

  return (
    <div className="h-14 bg-white border-b border-gray-200 flex items-center px-4 gap-4">
      {/* Hamburger Menu */}
      <button
        onClick={onToggleSidebar}
        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        title="Tableros"
      >
        <Menu size={20} />
      </button>

      {/* Divider */}
      <div className="w-px h-8 bg-gray-200"></div>

      {/* Tools */}
      <div className="flex items-center gap-1">
        {tools.map((tool) => {
          const Icon = tool.icon
          return (
            <button
              key={tool.id}
              onClick={() => setCurrentTool(tool.id)}
              className={`p-2 rounded-lg transition-colors ${
                currentTool === tool.id 
                  ? 'bg-blue-100 text-blue-600' 
                  : 'hover:bg-gray-100 text-gray-700'
              }`}
              title={tool.label}
            >
              <Icon size={18} />
            </button>
          )
        })}
      </div>

      {/* Divider */}
      <div className="w-px h-8 bg-gray-200"></div>

      {/* Colors */}
      <div className="flex items-center gap-2 relative">
        <button
          onClick={() => setShowColorPicker(!showColorPicker)}
          className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors"
          title="Color"
        >
          <Palette size={18} />
          <div 
            className="w-6 h-6 rounded border-2 border-gray-300"
            style={{ backgroundColor: currentColor }}
          />
        </button>

        {showColorPicker && (
          <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-3 z-50">
            <div className="grid grid-cols-5 gap-2 mb-2">
              {colors.map((color) => (
                <button
                  key={color}
                  onClick={() => {
                    setCurrentColor(color)
                    if (selectedElement && selectedElement.type === 'text') {
                      updateElement(selectedElement.id, { color })
                    }
                  }}
                  className={`w-8 h-8 rounded-lg border-2 transition-all ${
                    currentColor === color ? 'border-gray-900 scale-110' : 'border-gray-300'
                  }`}
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
            <input
              type="color"
              value={currentColor}
              onChange={(e) => setCurrentColor(e.target.value)}
              className="w-full h-8 rounded cursor-pointer"
            />
          </div>
        )}
      </div>

      {/* Stroke Width */}
      <div className="flex items-center gap-2">
        <input
          type="range"
          min="1"
          max="10"
          value={strokeWidth}
          onChange={(e) => setStrokeWidth(Number(e.target.value))}
          className="w-24 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          title={`Grosor: ${strokeWidth}px`}
        />
        <span className="text-sm text-gray-600 w-8">{strokeWidth}</span>
      </div>

      {/* Divider */}
      <div className="w-px h-8 bg-gray-200"></div>

      {/* Actions */}
      <div className="flex items-center gap-1">
        <button
          onClick={save}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          title="Guardar"
        >
          <Save size={18} />
        </button>
      </div>

      {/* Divider */}
      <div className="w-px h-8 bg-gray-200"></div>

      {/* Zoom Controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={handleZoomOut}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          title="Alejar"
        >
          <ZoomOut size={18} />
        </button>
        <span className="text-sm text-gray-600 w-16 text-center">
          {Math.round(scale * 100)}%
        </span>
        <button
          onClick={handleZoomIn}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          title="Acercar"
        >
          <ZoomIn size={18} />
        </button>
        <button
          onClick={handleResetZoom}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          title="Resetear"
        >
          <RotateCcw size={18} />
        </button>
      </div>
    </div>
  )
}

export default TopToolbar

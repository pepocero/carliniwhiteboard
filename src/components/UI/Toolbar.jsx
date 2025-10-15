import React from 'react'
import { 
  MousePointer, 
  Pen, 
  Eraser, 
  Type, 
  Square, 
  Circle, 
  Minus, 
  ArrowRight, 
  StickyNote,
  Undo,
  Redo,
  Trash2,
  Save,
  Download,
  Upload,
  ZoomIn,
  ZoomOut,
  RotateCcw
} from 'lucide-react'
import useWhiteboardStore from '../../store/useWhiteboardStore'
import CardCreator from './CardCreator'

const Toolbar = () => {
  const {
    currentTool,
    currentColor,
    strokeWidth,
    setCurrentTool,
    setCurrentColor,
    setStrokeWidth,
    undo,
    redo,
    clear,
    save,
    loadWhiteboard,
    createWhiteboard,
    scale,
    setScale,
    setPosition
  } = useWhiteboardStore()

  const tools = [
    { id: 'select', icon: MousePointer, label: 'Seleccionar' },
    { id: 'pen', icon: Pen, label: 'Lápiz' },
    { id: 'eraser', icon: Eraser, label: 'Borrador' },
    { id: 'text', icon: Type, label: 'Texto' },
  ]

  const shapes = [
    { id: 'rect', icon: Square, label: 'Rectángulo' },
    { id: 'circle', icon: Circle, label: 'Círculo' },
    { id: 'line', icon: Minus, label: 'Línea' },
    { id: 'arrow', icon: ArrowRight, label: 'Flecha' },
  ]

  const colors = [
    '#000000', '#ff0000', '#00ff00', '#0000ff', '#ffff00',
    '#ff00ff', '#00ffff', '#ffa500', '#800080', '#008000'
  ]

  const handleZoomIn = () => {
    setScale(Math.min(scale * 1.2, 5))
  }

  const handleZoomOut = () => {
    setScale(Math.max(scale / 1.2, 0.1))
  }

  const handleResetZoom = () => {
    setScale(1)
    setPosition({ x: 0, y: 0 })
  }

  return (
    <div className="sidebar">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Herramientas</h2>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Tools Section */}
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Herramientas</h3>
          <div className="grid grid-cols-2 gap-2">
            {tools.map((tool) => {
              const Icon = tool.icon
              return (
                <button
                  key={tool.id}
                  onClick={() => setCurrentTool(tool.id)}
                  className={`toolbar-btn ${currentTool === tool.id ? 'active' : ''}`}
                  title={tool.label}
                >
                  <Icon size={18} />
                </button>
              )
            })}
          </div>
        </div>

        {/* Shapes Section */}
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Formas</h3>
          <div className="grid grid-cols-2 gap-2">
            {shapes.map((shape) => {
              const Icon = shape.icon
              return (
                <button
                  key={shape.id}
                  onClick={() => setCurrentTool(shape.id)}
                  className={`toolbar-btn ${currentTool === shape.id ? 'active' : ''}`}
                  title={shape.label}
                >
                  <Icon size={18} />
                </button>
              )
            })}
          </div>
        </div>

        {/* Sticky Notes */}
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Notas</h3>
          <div className="grid grid-cols-1 gap-2">
            <button
              onClick={() => setCurrentTool('sticky')}
              className={`toolbar-btn ${currentTool === 'sticky' ? 'active' : ''}`}
              title="Nota Adhesiva"
            >
              <StickyNote size={18} />
            </button>
          </div>
        </div>

        {/* Colors Section */}
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Colores</h3>
          <div className="grid grid-cols-5 gap-2 mb-3">
            {colors.map((color) => (
              <button
                key={color}
                onClick={() => setCurrentColor(color)}
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
            className="w-full h-10 rounded-lg border border-gray-300 cursor-pointer"
          />
        </div>

        {/* Stroke Width */}
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Grosor</h3>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min="1"
              max="20"
              value={strokeWidth}
              onChange={(e) => setStrokeWidth(parseInt(e.target.value))}
              className="flex-1"
            />
            <span className="text-sm text-gray-600 min-w-[30px]">{strokeWidth}px</span>
          </div>
        </div>

        {/* Actions */}
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Acciones</h3>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={undo}
              className="toolbar-btn"
              title="Deshacer"
            >
              <Undo size={18} />
            </button>
            <button
              onClick={redo}
              className="toolbar-btn"
              title="Rehacer"
            >
              <Redo size={18} />
            </button>
            <button
              onClick={clear}
              className="toolbar-btn"
              title="Limpiar Todo"
            >
              <Trash2 size={18} />
            </button>
            <button
              onClick={save}
              className="toolbar-btn"
              title="Guardar"
            >
              <Save size={18} />
            </button>
          </div>
        </div>

        {/* Zoom Controls */}
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Zoom</h3>
          <div className="flex items-center gap-2 mb-2">
            <button
              onClick={handleZoomOut}
              className="toolbar-btn"
              title="Alejar"
            >
              <ZoomOut size={18} />
            </button>
            <span className="flex-1 text-center text-sm text-gray-600">
              {Math.round(scale * 100)}%
            </span>
            <button
              onClick={handleZoomIn}
              className="toolbar-btn"
              title="Acercar"
            >
              <ZoomIn size={18} />
            </button>
          </div>
          <button
            onClick={handleResetZoom}
            className="w-full toolbar-btn"
            title="Resetear Zoom"
          >
            <RotateCcw size={18} />
            <span className="ml-2">Resetear</span>
          </button>
        </div>

        {/* Card Creator */}
        <CardCreator />
      </div>
    </div>
  )
}

export default Toolbar

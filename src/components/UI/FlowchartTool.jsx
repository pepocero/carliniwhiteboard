import React, { useState } from 'react'
import { GitBranch, Diamond, Circle, Square, Hexagon, ArrowRight } from 'lucide-react'
import useWhiteboardStore from '../../store/useWhiteboardStore'

const FlowchartTool = ({ onClose }) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const { setCurrentTool, currentColor } = useWhiteboardStore()

  const flowchartShapes = [
    {
      id: 'flowchart-process',
      name: 'Proceso',
      icon: Square,
      tool: 'flowchart-process'
    },
    {
      id: 'flowchart-decision',
      name: 'Decisión',
      icon: Diamond,
      tool: 'flowchart-decision'
    },
    {
      id: 'flowchart-start',
      name: 'Inicio/Fin',
      icon: Circle,
      tool: 'flowchart-start'
    },
    {
      id: 'flowchart-data',
      name: 'Datos',
      icon: Hexagon,
      tool: 'flowchart-data'
    }
  ]

  const selectShape = (shape) => {
    setCurrentTool(shape.tool)
    setIsExpanded(false)
    if (onClose) onClose()
  }

  if (!isExpanded) {
    return (
      <div className="p-4 border-b border-gray-200">
        <button
          onClick={() => setIsExpanded(true)}
          className="w-full flex items-center justify-center gap-2 p-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
        >
          <GitBranch size={16} />
          <span className="text-sm font-medium text-purple-700">Diagramas de Flujo</span>
        </button>
      </div>
    )
  }

  return (
    <div className="p-4 border-b border-gray-200">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-700">Diagramas de Flujo</h3>
        <button
          onClick={() => setIsExpanded(false)}
          className="text-gray-400 hover:text-gray-600"
        >
          ×
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {flowchartShapes.map((shape) => {
          const Icon = shape.icon
          return (
            <button
              key={shape.id}
              onClick={() => selectShape(shape)}
              className="flex flex-col items-center gap-2 p-3 bg-gray-50 hover:bg-purple-50 rounded-lg transition-colors group"
              title={shape.name}
            >
              <Icon size={24} className="text-purple-600" />
              <span className="text-xs text-gray-600 group-hover:text-purple-600">
                {shape.name}
              </span>
            </button>
          )
        })}
      </div>

      <p className="text-xs text-gray-500 mt-3 text-center">
        Formas especiales para diagramas de flujo
      </p>
    </div>
  )
}

export default FlowchartTool

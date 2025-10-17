import React from 'react'
import { Circle } from 'react-konva'
import useWhiteboardStore from '../../../store/useWhiteboardStore'

const AnchorPoints = ({ element, onAnchorDragStart, onAnchorDragMove, onAnchorDragEnd }) => {
  // Subscribe to elements to get real-time updates when the element moves
  const elements = useWhiteboardStore(state => state.elements)
  
  // Get the latest version of the element
  const currentElement = elements.find(el => el.id === element.id) || element
  const getAnchorPositions = () => {
    switch (currentElement.type) {
      case 'rect':
      case 'diamond':
      case 'parallelogram':
      case 'hexagon': {
        const width = currentElement.width || 100
        const height = currentElement.height || 100
        return [
          { id: 'top', x: width / 2, y: 0 },
          { id: 'right', x: width, y: height / 2 },
          { id: 'bottom', x: width / 2, y: height },
          { id: 'left', x: 0, y: height / 2 }
        ]
      }
      case 'circle': {
        const radius = currentElement.radius || 50
        return [
          { id: 'top', x: 0, y: -radius },
          { id: 'right', x: radius, y: 0 },
          { id: 'bottom', x: 0, y: radius },
          { id: 'left', x: -radius, y: 0 }
        ]
      }
      case 'ellipse': {
        const radiusX = currentElement.radiusX || 50
        const radiusY = currentElement.radiusY || 25
        return [
          { id: 'top', x: 0, y: -radiusY },
          { id: 'right', x: radiusX, y: 0 },
          { id: 'bottom', x: 0, y: radiusY },
          { id: 'left', x: -radiusX, y: 0 }
        ]
      }
      default:
        return []
    }
  }

  const anchors = getAnchorPositions()

  return (
    <>
      {anchors.map((anchor) => (
        <Circle
          key={anchor.id}
          x={(currentElement.x || 0) + anchor.x}
          y={(currentElement.y || 0) + anchor.y}
          radius={8}
          fill="#4F46E5"
          stroke="#FFFFFF"
          strokeWidth={2}
          draggable={true}
          dragBoundFunc={(pos) => {
            // Keep anchor in place while dragging (only visual feedback)
            return {
              x: (currentElement.x || 0) + anchor.x,
              y: (currentElement.y || 0) + anchor.y
            }
          }}
          onDragStart={(e) => {
            e.cancelBubble = true
            onAnchorDragStart && onAnchorDragStart(element.id, anchor.id, e)
          }}
          onDragMove={(e) => {
            e.cancelBubble = true
            onAnchorDragMove && onAnchorDragMove(element.id, anchor.id, e)
          }}
          onDragEnd={(e) => {
            e.cancelBubble = true
            onAnchorDragEnd && onAnchorDragEnd(element.id, anchor.id, e)
          }}
          onMouseEnter={(e) => {
            const container = e.target.getStage().container()
            container.style.cursor = 'crosshair'
          }}
          onMouseLeave={(e) => {
            const container = e.target.getStage().container()
            container.style.cursor = 'default'
          }}
        />
      ))}
    </>
  )
}

export default AnchorPoints


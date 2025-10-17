import React, { useRef, useEffect, useState } from 'react'
import { Arrow, Circle, Transformer } from 'react-konva'
import useWhiteboardStore from '../../../store/useWhiteboardStore'

const ConnectorElement = ({ element }) => {
  const arrowRef = useRef()
  const transformerRef = useRef()
  const [, forceUpdate] = useState({})
  
  // Subscribe to all elements to get real-time updates
  const elements = useWhiteboardStore(state => state.elements)
  const selectedElement = useWhiteboardStore(state => state.selectedElement)
  const setSelectedElement = useWhiteboardStore(state => state.setSelectedElement)
  const updateElement = useWhiteboardStore(state => state.updateElement)

  const isSelected = selectedElement?.id === element.id

  // Get the connected elements
  const fromElement = elements.find(el => el.id === element.from)
  const toElement = elements.find(el => el.id === element.to)
  
  // Force re-render when connected elements change position
  // This ensures the connector updates in real-time while dragging connected shapes
  useEffect(() => {
    if (fromElement || toElement) {
      forceUpdate({})
    }
  }, [fromElement?.x, fromElement?.y, fromElement?.width, fromElement?.height, 
      toElement?.x, toElement?.y, toElement?.width, toElement?.height])

  // Calculate connection points based on connected elements
  const getConnectionPoints = () => {
    const fromElement = elements.find(el => el.id === element.from)
    const toElement = elements.find(el => el.id === element.to)

    if (!fromElement || !toElement) {
      // If no connection, use fixed points
      return {
        points: [
          element.startX || 0,
          element.startY || 0,
          element.endX || 100,
          element.endY || 100
        ]
      }
    }

    // Get anchor points
    const fromPoint = getAnchorPoint(fromElement, element.fromAnchor || 'right')
    const toPoint = getAnchorPoint(toElement, element.toAnchor || 'left')

    return {
      points: [fromPoint.x, fromPoint.y, toPoint.x, toPoint.y]
    }
  }

  // Get anchor point position on an element
  const getAnchorPoint = (el, anchor) => {
    const bounds = getElementBounds(el)
    
    switch (anchor) {
      case 'top':
        return { x: bounds.x + bounds.width / 2, y: bounds.y }
      case 'bottom':
        return { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height }
      case 'left':
        return { x: bounds.x, y: bounds.y + bounds.height / 2 }
      case 'right':
        return { x: bounds.x + bounds.width, y: bounds.y + bounds.height / 2 }
      default:
        return { x: bounds.x + bounds.width, y: bounds.y + bounds.height / 2 }
    }
  }

  // Get element bounds
  const getElementBounds = (el) => {
    switch (el.type) {
      case 'rect':
      case 'diamond':
      case 'parallelogram':
      case 'hexagon':
        return {
          x: el.x,
          y: el.y,
          width: el.width || 100,
          height: el.height || 100
        }
      case 'circle':
        return {
          x: el.x - (el.radius || 50),
          y: el.y - (el.radius || 50),
          width: (el.radius || 50) * 2,
          height: (el.radius || 50) * 2
        }
      case 'ellipse':
        return {
          x: el.x - (el.radiusX || 50),
          y: el.y - (el.radiusY || 25),
          width: (el.radiusX || 50) * 2,
          height: (el.radiusY || 25) * 2
        }
      case 'sticky':
        return {
          x: el.x,
          y: el.y,
          width: el.width || 200,
          height: el.height || 150
        }
      default:
        return { x: el.x || 0, y: el.y || 0, width: 100, height: 100 }
    }
  }

  useEffect(() => {
    if (isSelected && transformerRef.current && arrowRef.current) {
      transformerRef.current.nodes([arrowRef.current])
      transformerRef.current.getLayer().batchDraw()
    }
  }, [isSelected])

  const handleSelect = (e) => {
    e.cancelBubble = true
    setSelectedElement(element)
  }

  const handleDragEnd = (e) => {
    const node = e.target
    const newX = (element.startX || 0) + node.x()
    const newY = (element.startY || 0) + node.y()
    const deltaX = node.x()
    const deltaY = node.y()

    updateElement(element.id, {
      startX: newX,
      startY: newY,
      endX: (element.endX || 100) + deltaX,
      endY: (element.endY || 100) + deltaY
    })

    node.x(0)
    node.y(0)
  }

  const { points } = getConnectionPoints()

  // Don't render if points are invalid
  if (!points || points.length !== 4 || points.some(p => p === undefined || isNaN(p))) {
    console.warn('Invalid connector points:', element.id, points)
    return null
  }

  return (
    <>
      <Arrow
        ref={arrowRef}
        name={element.id}
        points={points}
        stroke={element.stroke || '#000000'}
        strokeWidth={element.strokeWidth || 2}
        fill={element.stroke || '#000000'}
        pointerLength={10}
        pointerWidth={10}
        draggable={!element.from && !element.to} // Only draggable if not connected
        onClick={handleSelect}
        onTap={handleSelect}
        onDragEnd={handleDragEnd}
        lineCap="round"
        lineJoin="round"
      />
      {isSelected && !element.from && !element.to && (
        <Transformer
          ref={transformerRef}
          boundBoxFunc={(oldBox, newBox) => {
            if (newBox.width < 5 || newBox.height < 5) {
              return oldBox
            }
            return newBox
          }}
        />
      )}
    </>
  )
}

export default ConnectorElement

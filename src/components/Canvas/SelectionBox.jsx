import React from 'react'
import { Rect } from 'react-konva'

const SelectionBox = ({ elements }) => {
  if (!elements || elements.length === 0) return null

  // Calculate bounding box of all selected elements
  const bounds = elements.reduce((acc, element) => {
    const elementBounds = getElementBounds(element)
    
    return {
      minX: Math.min(acc.minX, elementBounds.x),
      minY: Math.min(acc.minY, elementBounds.y),
      maxX: Math.max(acc.maxX, elementBounds.x + elementBounds.width),
      maxY: Math.max(acc.maxY, elementBounds.y + elementBounds.height)
    }
  }, { 
    minX: Infinity, 
    minY: Infinity, 
    maxX: -Infinity, 
    maxY: -Infinity 
  })

  const width = bounds.maxX - bounds.minX
  const height = bounds.maxY - bounds.minY

  return (
    <Rect
      x={bounds.minX - 2}
      y={bounds.minY - 2}
      width={width + 4}
      height={height + 4}
      stroke="#007bff"
      strokeWidth={2}
      dash={[5, 5]}
      fill="rgba(0, 123, 255, 0.1)"
    />
  )
}

// Helper function to get element bounds
function getElementBounds(element) {
  switch (element.type) {
    case 'rect':
      return {
        x: element.x,
        y: element.y,
        width: element.width,
        height: element.height
      }
    case 'circle':
      return {
        x: element.x - element.radius,
        y: element.y - element.radius,
        width: element.radius * 2,
        height: element.radius * 2
      }
    case 'line':
      return {
        x: Math.min(element.x1, element.x2),
        y: Math.min(element.y1, element.y2),
        width: Math.abs(element.x2 - element.x1),
        height: Math.abs(element.y2 - element.y1)
      }
    case 'text':
      // Approximate text bounds
      return {
        x: element.x,
        y: element.y - element.fontSize,
        width: (element.text?.length || 0) * element.fontSize * 0.6,
        height: element.fontSize
      }
    case 'sticky':
      return {
        x: element.x,
        y: element.y,
        width: element.width,
        height: element.height
      }
    case 'group':
      return {
        x: element.x,
        y: element.y,
        width: element.width,
        height: element.height
      }
    default:
      return { x: 0, y: 0, width: 0, height: 0 }
  }
}

export default SelectionBox

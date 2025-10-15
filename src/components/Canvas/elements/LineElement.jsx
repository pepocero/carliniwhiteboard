import React, { useRef, useEffect } from 'react'
import { Line, Transformer } from 'react-konva'
import useWhiteboardStore from '../../../store/useWhiteboardStore'

const LineElement = ({ element }) => {
  const shapeRef = useRef()
  const transformerRef = useRef()
  const { selectedElement, setSelectedElement, updateElement } = useWhiteboardStore()

  const isSelected = selectedElement?.id === element.id

  useEffect(() => {
    if (isSelected && transformerRef.current && shapeRef.current) {
      transformerRef.current.nodes([shapeRef.current])
      transformerRef.current.getLayer().batchDraw()
    }
  }, [isSelected])

  const handleSelect = (e) => {
    e.cancelBubble = true
    setSelectedElement(element)
  }

  const handleDragEnd = (e) => {
    const node = e.target
    const points = node.points()
    
    updateElement(element.id, {
      x1: points[0],
      y1: points[1],
      x2: points[2],
      y2: points[3]
    })
    
    // Reset position to prevent accumulation
    node.x(0)
    node.y(0)
  }

  const handleTransformEnd = (e) => {
    const node = shapeRef.current
    const points = node.points()
    
    updateElement(element.id, {
      x1: points[0],
      y1: points[1],
      x2: points[2],
      y2: points[3]
    })
  }

  // Calculate line bounds for transformer
  const getLineBounds = () => {
    const x1 = element.x1 || 0
    const y1 = element.y1 || 0
    const x2 = element.x2 || 0
    const y2 = element.y2 || 0
    
    return {
      x: Math.min(x1, x2),
      y: Math.min(y1, y2),
      width: Math.abs(x2 - x1),
      height: Math.abs(y2 - y1)
    }
  }

  const bounds = getLineBounds()

  return (
    <>
      <Line
        ref={shapeRef}
        name={element.id}
        points={[element.x1 || 0, element.y1 || 0, element.x2 || 0, element.y2 || 0]}
        stroke={element.stroke || '#000000'}
        strokeWidth={element.strokeWidth || 2}
        lineCap="round"
        lineJoin="round"
        draggable={true}
        onClick={handleSelect}
        onTap={handleSelect}
        onDragEnd={handleDragEnd}
        onTransformEnd={handleTransformEnd}
      />
      {isSelected && (
        <Transformer
          ref={transformerRef}
          boundBoxFunc={(oldBox, newBox) => {
            // Limit resize
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

export default LineElement

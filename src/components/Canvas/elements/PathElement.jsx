import React, { useRef, useEffect } from 'react'
import { Line, Transformer } from 'react-konva'
import useWhiteboardStore from '../../../store/useWhiteboardStore'

const PathElement = ({ element }) => {
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
    // For path elements, we need to update all points
    const deltaX = node.x()
    const deltaY = node.y()
    
    const newPoints = []
    for (let i = 0; i < element.points.length; i += 2) {
      newPoints.push(element.points[i] + deltaX)
      newPoints.push(element.points[i + 1] + deltaY)
    }
    
    updateElement(element.id, {
      points: newPoints
    })
    
    // Reset position to prevent accumulation
    node.x(0)
    node.y(0)
  }

  const handleTransformEnd = (e) => {
    const node = shapeRef.current
    const scaleX = node.scaleX()
    const scaleY = node.scaleY()

    // Reset scale to 1
    node.scaleX(1)
    node.scaleY(1)

    // Scale all points
    const newPoints = []
    for (let i = 0; i < element.points.length; i += 2) {
      newPoints.push(element.points[i] * scaleX)
      newPoints.push(element.points[i + 1] * scaleY)
    }

    updateElement(element.id, {
      points: newPoints
    })
  }

  return (
    <>
      <Line
        ref={shapeRef}
        name={element.id}
        points={element.points}
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
            if (newBox.width < 10 || newBox.height < 10) {
              return oldBox
            }
            return newBox
          }}
        />
      )}
    </>
  )
}

export default PathElement

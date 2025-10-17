import React, { useRef, useEffect } from 'react'
import { Circle, Transformer } from 'react-konva'
import useWhiteboardStore from '../../../store/useWhiteboardStore'

const CircleElement = ({ element }) => {
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
    updateElement(element.id, {
      x: node.x(),
      y: node.y()
    })
    
    // Reset position to prevent accumulation
    node.x(0)
    node.y(0)
  }

  const handleTransformEnd = (e) => {
    const node = shapeRef.current
    const scaleX = node.scaleX()
    const scaleY = node.scaleY()

    // Use the average of scaleX and scaleY for uniform scaling
    const scale = (scaleX + scaleY) / 2

    updateElement(element.id, {
      radius: Math.max(5, node.radius() * scale)
    })
    
    // Reset scale to 1
    node.scaleX(1)
    node.scaleY(1)
  }

  return (
    <>
      <Circle
        ref={shapeRef}
        name={element.id}
        x={element.x}
        y={element.y}
        radius={element.radius}
        fill={element.fill || 'transparent'}
        stroke={element.stroke || '#000000'}
        strokeWidth={element.strokeWidth || 2}
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

export default CircleElement

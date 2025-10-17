import React, { useRef, useEffect } from 'react'
import { Line, Transformer } from 'react-konva'
import useWhiteboardStore from '../../../store/useWhiteboardStore'

const DiamondElement = ({ element }) => {
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

  const handleDragStart = () => {
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

    updateElement(element.id, {
      width: Math.max(5, (element.width || 100) * scaleX),
      height: Math.max(5, (element.height || 100) * scaleY)
    })
    
    // Reset only scale, NOT position (position doesn't change on transform)
    node.scaleX(1)
    node.scaleY(1)
  }

  // Create diamond shape points (RELATIVE to x,y)
  const width = element.width || 100
  const height = element.height || 100
  
  const points = [
    width / 2, 0, // Top
    width, height / 2, // Right
    width / 2, height, // Bottom
    0, height / 2 // Left
  ]

  return (
    <>
      <Line
        ref={shapeRef}
        name={element.id}
        x={element.x || 0}
        y={element.y || 0}
        points={points}
        stroke={element.stroke || '#000000'}
        strokeWidth={element.strokeWidth || 2}
        fill={element.fill || 'transparent'}
        closed={true}
        draggable={true}
        onClick={handleSelect}
        onTap={handleSelect}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onTransformEnd={handleTransformEnd}
      />
      {isSelected && (
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

export default DiamondElement

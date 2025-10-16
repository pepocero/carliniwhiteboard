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
    const newX = element.x + node.x()
    const newY = element.y + node.y()
    
    updateElement(element.id, {
      x: newX,
      y: newY
    })
    
    node.x(0)
    node.y(0)
  }

  const handleTransformEnd = (e) => {
    const node = shapeRef.current
    const scaleX = node.scaleX()
    const scaleY = node.scaleY()

    node.scaleX(1)
    node.scaleY(1)

    const newX = element.x + node.x()
    const newY = element.y + node.y()

    updateElement(element.id, {
      x: newX,
      y: newY,
      width: Math.max(5, element.width * scaleX),
      height: Math.max(5, element.height * scaleY)
    })
    
    node.x(0)
    node.y(0)
  }

  // Create diamond shape points
  const points = [
    element.width / 2, 0, // Top
    element.width, element.height / 2, // Right
    element.width / 2, element.height, // Bottom
    0, element.height / 2 // Left
  ]

  return (
    <>
      <Line
        ref={shapeRef}
        name={element.id}
        x={element.x}
        y={element.y}
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

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
    const pos = node.position()
    
    // Get the actual position from the dragged node
    // Since points are absolute, we need to calculate the offset
    const deltaX = pos.x
    const deltaY = pos.y
    
    updateElement(element.id, {
      x: (element.x || 0) + deltaX,
      y: (element.y || 0) + deltaY
    })
    
    // Reset node position to 0,0 so it doesn't accumulate
    node.position({ x: 0, y: 0 })
  }

  const handleTransformEnd = (e) => {
    const node = shapeRef.current
    const scaleX = node.scaleX()
    const scaleY = node.scaleY()
    const pos = node.position()

    updateElement(element.id, {
      x: (element.x || 0) + pos.x,
      y: (element.y || 0) + pos.y,
      width: Math.max(5, (element.width || 100) * scaleX),
      height: Math.max(5, (element.height || 100) * scaleY)
    })
    
    // Reset scale and position
    node.scaleX(1)
    node.scaleY(1)
    node.position({ x: 0, y: 0 })
  }

  // Create diamond shape points with absolute position
  const x = element.x || 0
  const y = element.y || 0
  const width = element.width || 100
  const height = element.height || 100
  
  const points = [
    x + width / 2, y, // Top
    x + width, y + height / 2, // Right
    x + width / 2, y + height, // Bottom
    x, y + height / 2 // Left
  ]

  return (
    <>
      <Line
        ref={shapeRef}
        name={element.id}
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

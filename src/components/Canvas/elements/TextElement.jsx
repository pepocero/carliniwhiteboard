import React, { useRef, useEffect } from 'react'
import { Text, Transformer } from 'react-konva'
import useWhiteboardStore from '../../../store/useWhiteboardStore'

const TextElement = ({ element }) => {
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

  const handleDoubleClick = (e) => {
    e.cancelBubble = true
    // Set the element as editing in the store
    const { setSelectedElement } = useWhiteboardStore.getState()
    setSelectedElement({
      ...element,
      isEditing: true
    })
  }

  const handleDragStart = (e) => {
    // Allow dragging when not in editing mode
    if (!isSelected) {
      setSelectedElement(element)
    }
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

    // Reset scale to 1
    node.scaleX(1)
    node.scaleY(1)

    updateElement(element.id, {
      x: node.x(),
      y: node.y(),
      fontSize: Math.max(8, element.fontSize * scaleY)
    })
  }


  return (
    <>
      <Text
        ref={shapeRef}
        name={element.id}
        x={element.x}
        y={element.y}
        text={element.text || 'Texto'}
        fontSize={element.fontSize || 16}
        fontFamily={element.fontFamily || 'Arial'}
        fill={element.color || '#000000'}
        draggable={true}
        onClick={handleSelect}
        onTap={handleSelect}
        onDblClick={handleDoubleClick}
        onDbltap={handleDoubleClick}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onTransformEnd={handleTransformEnd}
      />
      {isSelected && (
        <Transformer
          ref={transformerRef}
          boundBoxFunc={(oldBox, newBox) => {
            // Limit resize
            if (newBox.width < 50 || newBox.height < 20) {
              return oldBox
            }
            return newBox
          }}
        />
      )}
    </>
  )
}

export default TextElement

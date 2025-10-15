import React, { useRef, useEffect } from 'react'
import { Group, Transformer } from 'react-konva'
import useWhiteboardStore from '../../../store/useWhiteboardStore'
import RectangleElement from './RectangleElement'
import CircleElement from './CircleElement'
import LineElement from './LineElement'
import TextElement from './TextElement'
import StickyNoteElement from './StickyNoteElement'

const GroupElement = ({ element }) => {
  const groupRef = useRef()
  const transformerRef = useRef()
  const { selectedElement, setSelectedElement, updateElement } = useWhiteboardStore()

  const isSelected = selectedElement?.id === element.id

  useEffect(() => {
    if (isSelected && transformerRef.current && groupRef.current) {
      transformerRef.current.nodes([groupRef.current])
      transformerRef.current.getLayer().batchDraw()
    }
  }, [isSelected])

  const handleSelect = (e) => {
    e.cancelBubble = true
    setSelectedElement(element)
  }

  const handleDragEnd = (e) => {
    const deltaX = e.target.x() - element.x
    const deltaY = e.target.y() - element.y

    // Update group position and all children
    const updatedChildren = element.children.map(child => ({
      ...child,
      x: child.x + deltaX,
      y: child.y + deltaY
    }))

    updateElement(element.id, {
      x: e.target.x(),
      y: e.target.y(),
      children: updatedChildren
    })
  }

  const handleTransformEnd = (e) => {
    const node = groupRef.current
    const scaleX = node.scaleX()
    const scaleY = node.scaleY()

    // Reset scale to 1
    node.scaleX(1)
    node.scaleY(1)

    // Update group bounds and scale children
    const updatedChildren = element.children.map(child => ({
      ...child,
      x: child.x * scaleX,
      y: child.y * scaleY,
      width: child.width ? child.width * scaleX : child.width,
      height: child.height ? child.height * scaleY : child.height,
      radius: child.radius ? child.radius * Math.min(scaleX, scaleY) : child.radius,
      fontSize: child.fontSize ? child.fontSize * scaleY : child.fontSize
    }))

    updateElement(element.id, {
      x: node.x(),
      y: node.y(),
      width: element.width * scaleX,
      height: element.height * scaleY,
      children: updatedChildren
    })
  }

  const renderChild = (child) => {
    switch (child.type) {
      case 'rect':
        return <RectangleElement key={child.id} element={child} />
      case 'circle':
        return <CircleElement key={child.id} element={child} />
      case 'line':
        return <LineElement key={child.id} element={child} />
      case 'text':
        return <TextElement key={child.id} element={child} />
      case 'sticky':
        return <StickyNoteElement key={child.id} element={child} />
      default:
        return null
    }
  }

  return (
    <>
      <Group
        ref={groupRef}
        x={element.x}
        y={element.y}
        draggable={!isSelected}
        onClick={handleSelect}
        onTap={handleSelect}
        onDragEnd={handleDragEnd}
        onTransformEnd={handleTransformEnd}
      >
        {element.children?.map(renderChild)}
      </Group>
      {isSelected && (
        <Transformer
          ref={transformerRef}
          boundBoxFunc={(oldBox, newBox) => {
            // Limit resize
            if (newBox.width < 50 || newBox.height < 50) {
              return oldBox
            }
            return newBox
          }}
        />
      )}
    </>
  )
}

export default GroupElement

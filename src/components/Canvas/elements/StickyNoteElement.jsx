import React, { useRef, useEffect, useState } from 'react'
import { Group, Rect, Text, Transformer } from 'react-konva'
import useWhiteboardStore from '../../../store/useWhiteboardStore'

const StickyNoteElement = ({ element }) => {
  const groupRef = useRef()
  const transformerRef = useRef()
  const [isEditing, setIsEditing] = useState(false)
  const [text, setText] = useState(element.text || '')
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

  const handleDoubleClick = (e) => {
    setIsEditing(true)
    setText(element.text || '')
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
    const node = groupRef.current
    const scaleX = node.scaleX()
    const scaleY = node.scaleY()

    // Reset scale to 1
    node.scaleX(1)
    node.scaleY(1)

    updateElement(element.id, {
      x: node.x(),
      y: node.y(),
      width: Math.max(100, element.width * scaleX),
      height: Math.max(80, element.height * scaleY)
    })
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleTextSubmit()
    } else if (e.key === 'Escape') {
      setIsEditing(false)
      setText(element.text || '')
    }
  }

  const handleTextSubmit = () => {
    updateElement(element.id, {
      text: text
    })
    setIsEditing(false)
  }

  const handleTextChange = (e) => {
    setText(e.target.value)
  }

  // Wrap text to fit within the sticky note
  const wrapText = (text, maxWidth) => {
    const words = text.split(' ')
    const lines = []
    let currentLine = ''

    words.forEach(word => {
      const testLine = currentLine + word + ' '
      const metrics = document.createElement('canvas').getContext('2d')
      metrics.font = '14px Arial'
      const width = metrics.measureText(testLine).width

      if (width > maxWidth && currentLine !== '') {
        lines.push(currentLine)
        currentLine = word + ' '
      } else {
        currentLine = testLine
      }
    })

    if (currentLine) {
      lines.push(currentLine)
    }

    return lines
  }

  const textLines = wrapText(element.text || '', element.width - 20)

  if (isEditing) {
    return (
      <div
        style={{
          position: 'absolute',
          left: element.x,
          top: element.y,
          zIndex: 1000,
          width: element.width,
          height: element.height
        }}
      >
        <div
          style={{
            width: '100%',
            height: '100%',
            backgroundColor: element.color || '#ffeb3b',
            border: '2px solid #007bff',
            padding: '10px',
            boxSizing: 'border-box'
          }}
        >
          <textarea
            value={text}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            onBlur={handleTextSubmit}
            style={{
              width: '100%',
              height: '100%',
              fontSize: '14px',
              fontFamily: 'Arial',
              backgroundColor: 'transparent',
              border: 'none',
              outline: 'none',
              resize: 'none',
              color: '#333'
            }}
            autoFocus
            placeholder="Escribe tu nota aquí..."
          />
        </div>
      </div>
    )
  }

  return (
    <>
      <Group
        ref={groupRef}
        name={element.id}
        x={element.x}
        y={element.y}
        draggable={true}
        onClick={handleSelect}
        onTap={handleSelect}
        onDblClick={handleDoubleClick}
        onDbltap={handleDoubleClick}
        onDragEnd={handleDragEnd}
        onTransformEnd={handleTransformEnd}
      >
        <Rect
          x={0}
          y={0}
          width={element.width}
          height={element.height}
          fill={element.color || '#ffeb3b'}
          stroke="#333"
          strokeWidth={1}
          shadowColor="rgba(0,0,0,0.2)"
          shadowBlur={4}
          shadowOffset={{ x: 2, y: 2 }}
        />
        <Text
          x={10}
          y={10}
          text={textLines.join('\n')}
          fontSize={14}
          fontFamily="Arial"
          fill={element.textColor || '#333'}
          width={element.width - 20}
          height={element.height - 20}
          align="left"
          verticalAlign="top"
          wrap="word"
        />
      </Group>
      {isSelected && (
        <Transformer
          ref={transformerRef}
          boundBoxFunc={(oldBox, newBox) => {
            // Limit resize
            if (newBox.width < 100 || newBox.height < 80) {
              return oldBox
            }
            return newBox
          }}
        />
      )}
    </>
  )
}

export default StickyNoteElement

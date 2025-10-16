import React, { useRef, useEffect, useState, useCallback } from 'react'
import { Stage, Layer } from 'react-konva'
import useWhiteboardStore from '../../store/useWhiteboardStore'
import RectangleElement from './elements/RectangleElement'
import CircleElement from './elements/CircleElement'
import LineElement from './elements/LineElement'
import TextElement from './elements/TextElement'
import StickyNoteElement from './elements/StickyNoteElement'
import GroupElement from './elements/GroupElement'
import PathElement from './elements/PathElement'
import DiamondElement from './elements/DiamondElement'
import ParallelogramElement from './elements/ParallelogramElement'
import SelectionBox from './SelectionBox'
import ToolHandler from './ToolHandler'
import TempShape from './TempShape'

const WhiteboardCanvas = () => {
  const stageRef = useRef()
  const [drawingState, setDrawingState] = useState(null)
  const [lastDist, setLastDist] = useState(0)
  const {
    elements,
    selectedElement,
    selectedElements,
    currentTool,
    scale,
    position,
    setScale,
    setPosition,
    canvasBackgroundColor
  } = useWhiteboardStore()

  // Handle stage events
  const handleStageMouseDown = (e) => {
    const { currentTool, currentColor, strokeWidth, addElement } = useWhiteboardStore.getState()
    
    // Deselect all if clicking on empty area
    if (e.target === e.target.getStage()) {
      useWhiteboardStore.getState().clearSelection()
    } else if (currentTool === 'eraser') {
      // Handle eraser tool - remove clicked element
      const clickedElement = findElementByKonvaNode(e.target)
      if (clickedElement) {
        const { removeElement } = useWhiteboardStore.getState()
        removeElement(clickedElement.id)
      }
    }
    
    if (['pen', 'rect', 'circle', 'line'].includes(currentTool)) {
      const stage = e.target.getStage()
      const pointer = stage.getPointerPosition()
      const scale = stage.scaleX()
      const pos = {
        x: (pointer.x - stage.x()) / scale,
        y: (pointer.y - stage.y()) / scale
      }

      // Store drawing state
      const newDrawingState = {
        isDrawing: true,
        startPos: pos,
        currentPos: pos,
        tool: currentTool,
        color: currentColor,
        strokeWidth: strokeWidth
      }

      // Start drawing
      if (currentTool === 'pen') {
        newDrawingState.points = [pos.x, pos.y]
      }

      setDrawingState(newDrawingState)
    } else if (currentTool === 'text') {
      // Handle text tool - only create if clicking on empty area
      if (e.target === e.target.getStage()) {
        const stage = e.target.getStage()
        const pointer = stage.getPointerPosition()
        const scale = stage.scaleX()
        const pos = {
          x: (pointer.x - stage.x()) / scale,
          y: (pointer.y - stage.y()) / scale
        }

        const textElement = {
          type: 'text',
          x: pos.x,
          y: pos.y,
          text: 'Nuevo texto',
          fontSize: 16,
          fontFamily: 'Arial',
          color: currentColor
        }

        addElement(textElement)
        
        // Switch back to select tool after creating text
        const { setCurrentTool } = useWhiteboardStore.getState()
        setCurrentTool('select')
      }
    } else if (currentTool === 'sticky') {
      // Handle sticky note tool
      const stage = e.target.getStage()
      const pointer = stage.getPointerPosition()
      const scale = stage.scaleX()
      const pos = {
        x: (pointer.x - stage.x()) / scale,
        y: (pointer.y - stage.y()) / scale
      }

      const stickyElement = {
        type: 'sticky',
        x: pos.x,
        y: pos.y,
        width: 200,
        height: 150,
        color: '#ffeb3b',
        text: 'Nueva nota'
      }

      addElement(stickyElement)
      
      // Switch back to select tool after creating sticky note
      const { setCurrentTool } = useWhiteboardStore.getState()
      setCurrentTool('select')
    } else if (currentTool.startsWith('flowchart-')) {
      // Handle flowchart tools
      if (e.target === e.target.getStage()) {
        const stage = e.target.getStage()
        const pointer = stage.getPointerPosition()
        const scale = stage.scaleX()
        const pos = {
          x: (pointer.x - stage.x()) / scale,
          y: (pointer.y - stage.y()) / scale
        }

        let flowchartElement = null

        switch (currentTool) {
          case 'flowchart-process':
            flowchartElement = {
              type: 'rect',
              x: pos.x,
              y: pos.y,
              width: 120,
              height: 60,
              stroke: currentColor,
              strokeWidth: 2,
              fill: 'transparent',
              cornerRadius: 5
            }
            break
          case 'flowchart-decision':
            flowchartElement = {
              type: 'diamond',
              x: pos.x,
              y: pos.y,
              width: 100,
              height: 100,
              stroke: currentColor,
              strokeWidth: 2,
              fill: 'transparent'
            }
            break
          case 'flowchart-start':
            flowchartElement = {
              type: 'rect',
              x: pos.x,
              y: pos.y,
              width: 120,
              height: 60,
              stroke: currentColor,
              strokeWidth: 2,
              fill: 'transparent',
              cornerRadius: 30
            }
            break
          case 'flowchart-data':
            flowchartElement = {
              type: 'parallelogram',
              x: pos.x,
              y: pos.y,
              width: 120,
              height: 60,
              stroke: currentColor,
              strokeWidth: 2,
              fill: 'transparent'
            }
            break
        }

        if (flowchartElement) {
          addElement(flowchartElement)
          
          // Switch back to select tool after creating flowchart element
          const { setCurrentTool } = useWhiteboardStore.getState()
          setCurrentTool('select')
        }
      }
    }
  }

  const handleStageWheel = (e) => {
    e.evt.preventDefault()
    
    const stage = e.target.getStage()
    const oldScale = stage.scaleX()
    const pointer = stage.getPointerPosition()
    
    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    }
    
    const newScale = e.evt.deltaY > 0 ? oldScale * 0.9 : oldScale * 1.1
    const clampedScale = Math.max(0.1, Math.min(5, newScale))
    
    setScale(clampedScale)
    
    const newPos = {
      x: pointer.x - mousePointTo.x * clampedScale,
      y: pointer.y - mousePointTo.y * clampedScale,
    }
    
    setPosition(newPos)
  }

  // Handle pinch-to-zoom for mobile
  const handleTouchMove = (e) => {
    const touch1 = e.evt.touches[0]
    const touch2 = e.evt.touches[1]

    if (touch1 && touch2) {
      e.evt.preventDefault()
      
      const stage = stageRef.current
      if (!stage) return
      
      // Calculate distance between touches
      const dist = Math.sqrt(
        Math.pow(touch2.clientX - touch1.clientX, 2) +
        Math.pow(touch2.clientY - touch1.clientY, 2)
      )

      if (lastDist === 0) {
        setLastDist(dist)
        return
      }

      const oldScale = stage.scaleX()
      const newScale = oldScale * (dist / lastDist)
      const clampedScale = Math.max(0.1, Math.min(5, newScale))
      
      setScale(clampedScale)
      setLastDist(dist)
    }
  }

  const handleTouchEnd = () => {
    setLastDist(0)
  }

  const handleStageMouseMove = (e) => {
    if (drawingState && drawingState.isDrawing) {
      const stage = e.target.getStage()
      const pointer = stage.getPointerPosition()
      const scale = stage.scaleX()
      const pos = {
        x: (pointer.x - stage.x()) / scale,
        y: (pointer.y - stage.y()) / scale
      }

      const updatedDrawingState = {
        ...drawingState,
        currentPos: pos
      }

      // Update points for pen tool
      if (drawingState.tool === 'pen') {
        updatedDrawingState.points = [...(drawingState.points || []), pos.x, pos.y]
      }

      setDrawingState(updatedDrawingState)
    }
  }

  const handleStageMouseUp = (e) => {
    if (drawingState && drawingState.isDrawing) {
      const { startPos, currentPos, tool, color, strokeWidth, points } = drawingState
      const { addElement } = useWhiteboardStore.getState()

      // Create the final shape
      let finalShape = null

      switch (tool) {
        case 'pen':
          if (points && points.length > 2) {
            finalShape = {
              type: 'path',
              points: points,
              stroke: color,
              strokeWidth: strokeWidth
            }
          }
          break

        case 'rect':
          const width = currentPos.x - startPos.x
          const height = currentPos.y - startPos.y
          if (Math.abs(width) > 5 && Math.abs(height) > 5) {
            finalShape = {
              type: 'rect',
              x: Math.min(startPos.x, currentPos.x),
              y: Math.min(startPos.y, currentPos.y),
              width: Math.abs(width),
              height: Math.abs(height),
              stroke: color,
              strokeWidth: strokeWidth,
              fill: 'transparent'
            }
          }
          break

        case 'circle':
          const radius = Math.sqrt(
            Math.pow(currentPos.x - startPos.x, 2) +
            Math.pow(currentPos.y - startPos.y, 2)
          )
          if (radius > 5) {
            finalShape = {
              type: 'circle',
              x: startPos.x,
              y: startPos.y,
              radius: radius,
              stroke: color,
              strokeWidth: strokeWidth,
              fill: 'transparent'
            }
          }
          break

        case 'line':
          const distance = Math.sqrt(
            Math.pow(currentPos.x - startPos.x, 2) +
            Math.pow(currentPos.y - startPos.y, 2)
          )
          if (distance > 5) {
            finalShape = {
              type: 'line',
              x1: startPos.x,
              y1: startPos.y,
              x2: currentPos.x,
              y2: currentPos.y,
              stroke: color,
              strokeWidth: strokeWidth
            }
          }
          break
      }

      if (finalShape) {
        addElement(finalShape)
      }

      // Clear drawing state
      setDrawingState(null)
    }
  }

  const handleStageDragEnd = (e) => {
    const stage = e.target
    setPosition({
      x: stage.x(),
      y: stage.y()
    })
  }

  // Update stage transform when scale or position changes
  useEffect(() => {
    if (stageRef.current) {
      const stage = stageRef.current
      stage.scale({ x: scale, y: scale })
      stage.position(position)
      stage.batchDraw()
    }
  }, [scale, position])

  // Debounced canvas expansion function
  const debouncedExpandCanvas = useCallback(() => {
    if (elements.length === 0) return

    const stage = stageRef.current
    if (!stage) return

    const stageWidth = stage.width()
    const stageHeight = stage.height()
    const scale = stage.scaleX()
    const pos = stage.position()

    // Calculate bounds of all elements
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity

    elements.forEach(element => {
      let bounds = getElementBounds(element)
      minX = Math.min(minX, bounds.x)
      minY = Math.min(minY, bounds.y)
      maxX = Math.max(maxX, bounds.x + bounds.width)
      maxY = Math.max(maxY, bounds.y + bounds.height)
    })

    // Add padding
    const padding = 200
    minX -= padding
    minY -= padding
    maxX += padding
    maxY += padding

    // Check if we need to expand canvas
    const currentMinX = -pos.x / scale
    const currentMinY = -pos.y / scale
    const currentMaxX = currentMinX + stageWidth / scale
    const currentMaxY = currentMinY + stageHeight / scale

    let newWidth = stageWidth
    let newHeight = stageHeight
    let needsExpansion = false

    // Only expand if elements are significantly outside current bounds
    const expansionThreshold = 50 // Only expand if elements are 50px outside bounds
    
    if (maxX > currentMaxX + expansionThreshold) {
      newWidth = Math.max(newWidth, (maxX - currentMinX) * scale)
      needsExpansion = true
    }

    if (minX < currentMinX - expansionThreshold) {
      newWidth = Math.max(newWidth, (currentMaxX - minX) * scale)
      needsExpansion = true
    }

    if (maxY > currentMaxY + expansionThreshold) {
      newHeight = Math.max(newHeight, (maxY - currentMinY) * scale)
      needsExpansion = true
    }

    if (minY < currentMinY - expansionThreshold) {
      newHeight = Math.max(newHeight, (currentMaxY - minY) * scale)
      needsExpansion = true
    }

    // Update stage size only if significant expansion is needed
    if (needsExpansion && (newWidth !== stageWidth || newHeight !== stageHeight)) {
      stage.size({ width: newWidth, height: newHeight })
    }
  }, [elements])

  // Expand canvas with debounce to prevent excessive updates during dragging
  useEffect(() => {
    const timeoutId = setTimeout(debouncedExpandCanvas, 100) // 100ms debounce
    return () => clearTimeout(timeoutId)
  }, [debouncedExpandCanvas])

  // Helper function to find element by Konva node
  const findElementByKonvaNode = (konvaNode) => {
    // Get the element ID from the node's name
    const elementId = konvaNode.name()
    
    if (elementId) {
      // Handle sticky note text (has _text suffix)
      if (elementId.endsWith('_text')) {
        const baseId = elementId.replace('_text', '')
        return elements.find(el => el.id === baseId)
      }
      
      // Direct match
      return elements.find(el => el.id === elementId)
    }
    
    return null
  }

  // Helper function to get element bounds
  const getElementBounds = (element) => {
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
      case 'path':
        if (element.points && element.points.length > 0) {
          let minX = element.points[0], minY = element.points[1]
          let maxX = element.points[0], maxY = element.points[1]
          for (let i = 0; i < element.points.length; i += 2) {
            minX = Math.min(minX, element.points[i])
            minY = Math.min(minY, element.points[i + 1])
            maxX = Math.max(maxX, element.points[i])
            maxY = Math.max(maxY, element.points[i + 1])
          }
          return {
            x: minX,
            y: minY,
            width: maxX - minX,
            height: maxY - minY
          }
        }
        return { x: 0, y: 0, width: 0, height: 0 }
      case 'text':
        // Approximate text bounds
        return {
          x: element.x,
          y: element.y - (element.fontSize || 16),
          width: (element.text?.length || 0) * (element.fontSize || 16) * 0.6,
          height: element.fontSize || 16
        }
      case 'sticky':
        return {
          x: element.x,
          y: element.y,
          width: element.width,
          height: element.height
        }
      case 'diamond':
      case 'parallelogram':
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

  // Generate dot pattern for background
  const getDotPattern = () => {
    const dotSize = 2
    const dotSpacing = 20
    const canvas = document.createElement('canvas')
    canvas.width = dotSpacing
    canvas.height = dotSpacing
    const ctx = canvas.getContext('2d')
    
    ctx.fillStyle = canvasBackgroundColor === '#ffffff' ? '#e5e7eb' : 
                    canvasBackgroundColor === '#000000' ? '#374151' : '#d1d5db'
    ctx.fillRect(dotSpacing / 2 - dotSize / 2, dotSpacing / 2 - dotSize / 2, dotSize, dotSize)
    
    return canvas.toDataURL()
  }

  const backgroundStyle = {
    backgroundColor: canvasBackgroundColor,
    backgroundImage: `url(${getDotPattern()})`,
    backgroundSize: '20px 20px',
    touchAction: 'none'
  }

  return (
    <div className="canvas-container" style={backgroundStyle}>
      <Stage
        ref={stageRef}
        width={window.innerWidth}
        height={window.innerHeight - (window.innerWidth < 768 ? 120 : 134)} // Adjust for mobile header height
        onMouseDown={handleStageMouseDown}
        onMouseMove={handleStageMouseMove}
        onMouseUp={handleStageMouseUp}
        onTouchStart={handleStageMouseDown}
        onTouchMove={(e) => {
          handleTouchMove(e)
          handleStageMouseMove(e)
        }}
        onTouchEnd={(e) => {
          handleTouchEnd()
          handleStageMouseUp(e)
        }}
        onWheel={handleStageWheel}
        onDragEnd={handleStageDragEnd}
        draggable={currentTool === 'select'}
        style={{ cursor: currentTool === 'select' ? 'grab' : 'default' }}
      >
        <Layer>
          {/* Render all elements */}
          {elements.map((element) => {
            switch (element.type) {
              case 'rect':
                return <RectangleElement key={element.id} element={element} />
              case 'circle':
                return <CircleElement key={element.id} element={element} />
              case 'line':
                return <LineElement key={element.id} element={element} />
              case 'path':
                return <PathElement key={element.id} element={element} />
              case 'text':
                return <TextElement key={element.id} element={element} />
              case 'sticky':
                return <StickyNoteElement key={element.id} element={element} />
              case 'diamond':
                return <DiamondElement key={element.id} element={element} />
              case 'parallelogram':
                return <ParallelogramElement key={element.id} element={element} />
              case 'group':
                return <GroupElement key={element.id} element={element} />
              default:
                return null
            }
          })}
          
          {/* Selection box for multi-select */}
          {selectedElements.length > 1 && (
            <SelectionBox elements={selectedElements} />
          )}
          
          {/* Temporary shape while drawing */}
          {drawingState && drawingState.isDrawing && (
            <TempShape drawingState={drawingState} />
          )}
          
          {/* Tool handler for drawing tools */}
          <ToolHandler />
        </Layer>
      </Stage>
    </div>
  )
}

export default WhiteboardCanvas

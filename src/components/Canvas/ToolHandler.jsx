import React, { useRef, useEffect } from 'react'
import { Line, Rect, Circle } from 'react-konva'
import useWhiteboardStore from '../../store/useWhiteboardStore'

const ToolHandler = () => {
  const { currentTool, currentColor, strokeWidth, addElement } = useWhiteboardStore()
  const isDrawing = useRef(false)
  const startPos = useRef({ x: 0, y: 0 })
  const currentPos = useRef({ x: 0, y: 0 })
  const tempShape = useRef(null)

  // This component doesn't render anything directly
  // It just handles the drawing logic through the store
  return null
}

export default ToolHandler
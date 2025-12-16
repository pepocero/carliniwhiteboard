import React, { useState, useEffect } from 'react'
import useWhiteboardStore from '../../store/useWhiteboardStore'

const EraserCursor = () => {
  const { currentTool, eraserSize, interactionMode } = useWhiteboardStore()
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (currentTool === 'eraser' && interactionMode === 'draw') {
      setIsVisible(true)
      
      const handleMouseMove = (e) => {
        setMousePos({ x: e.clientX, y: e.clientY })
      }
      
      const handleMouseLeave = () => {
        setIsVisible(false)
      }
      
      const handleMouseEnter = () => {
        if (currentTool === 'eraser' && interactionMode === 'draw') {
          setIsVisible(true)
        }
      }
      
      window.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseleave', handleMouseLeave)
      document.addEventListener('mouseenter', handleMouseEnter)
      
      return () => {
        window.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseleave', handleMouseLeave)
        document.removeEventListener('mouseenter', handleMouseEnter)
      }
    } else {
      setIsVisible(false)
    }
  }, [currentTool, interactionMode])

  if (!isVisible || currentTool !== 'eraser' || interactionMode !== 'draw') {
    return null
  }

  return (
    <div
      style={{
        position: 'fixed',
        left: mousePos.x,
        top: mousePos.y,
        width: eraserSize * 2,
        height: eraserSize * 2,
        borderRadius: '50%',
        border: '2px solid #ef4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        pointerEvents: 'none',
        zIndex: 9999,
        transform: 'translate(-50%, -50%)',
        transition: 'none',
        boxShadow: '0 0 0 1px rgba(239, 68, 68, 0.3)'
      }}
    />
  )
}

export default EraserCursor

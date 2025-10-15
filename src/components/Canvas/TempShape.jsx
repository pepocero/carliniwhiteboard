import React from 'react'
import { Line, Rect, Circle } from 'react-konva'

const TempShape = ({ drawingState }) => {
  if (!drawingState || !drawingState.isDrawing) {
    return null
  }

  const { startPos, currentPos, tool, color, strokeWidth, points } = drawingState

  switch (tool) {
    case 'pen':
      if (points && points.length > 2) {
        return (
          <Line
            points={points}
            stroke={color}
            strokeWidth={strokeWidth}
            lineCap="round"
            lineJoin="round"
            globalCompositeOperation="source-over"
          />
        )
      }
      return null

    case 'rect':
      const width = currentPos.x - startPos.x
      const height = currentPos.y - startPos.y
      return (
        <Rect
          x={Math.min(startPos.x, currentPos.x)}
          y={Math.min(startPos.y, currentPos.y)}
          width={Math.abs(width)}
          height={Math.abs(height)}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="transparent"
          globalCompositeOperation="source-over"
        />
      )

    case 'circle':
      const radius = Math.sqrt(
        Math.pow(currentPos.x - startPos.x, 2) +
        Math.pow(currentPos.y - startPos.y, 2)
      )
      return (
        <Circle
          x={startPos.x}
          y={startPos.y}
          radius={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="transparent"
          globalCompositeOperation="source-over"
        />
      )

    case 'line':
      return (
        <Line
          points={[startPos.x, startPos.y, currentPos.x, currentPos.y]}
          stroke={color}
          strokeWidth={strokeWidth}
          lineCap="round"
          globalCompositeOperation="source-over"
        />
      )

    default:
      return null
  }
}

export default TempShape

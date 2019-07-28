import React, { useState } from "react"
import { Graph, canvas } from "react-canvas-time-series"

// fake data
const X_MIN = 0
const X_MAX = 50
const Y_MIN = 0
const Y_MAX = 1000

// dimensions
const WIDTH = 900
const HEIGHT = 300
const PADDING = 10

const X_AXIS_HEIGHT = 20
const Y_AXIS_WIDTH = 50
const X_AXIS_WIDTH = WIDTH - 2 * PADDING - Y_AXIS_WIDTH
const Y_AXIS_HEIGHT = HEIGHT - 2 * PADDING - X_AXIS_HEIGHT

const X_AXIS = {
  top: PADDING + Y_AXIS_HEIGHT,
  left: PADDING,
  width: X_AXIS_WIDTH,
  height: X_AXIS_HEIGHT,
}

const Y_AXIS = {
  top: PADDING,
  left: WIDTH - PADDING - Y_AXIS_WIDTH,
  width: Y_AXIS_WIDTH,
  height: Y_AXIS_HEIGHT,
}

const GRAPH = {
  top: PADDING,
  left: PADDING,
  width: X_AXIS_WIDTH,
  height: Y_AXIS_HEIGHT,
}

function Crosshair(props) {
  const [mouse, setMouse] = useState({
    x: undefined,
    y: undefined,
  })

  function onMouseMove(e, mouse) {
    setMouse(mouse)
  }

  function onMouseOut() {
    setMouse({
      x: undefined,
      y: undefined,
    })
  }

  return (
    <Graph
      width={WIDTH}
      height={HEIGHT}
      backgroundColor="beige"
      animate={false}
      axes={[
        {
          at: "bottom",
          top: X_AXIS.top,
          left: X_AXIS.left,
          width: X_AXIS.width,
          height: X_AXIS.height,
          lineColor: "blue",
          xMin: X_MIN,
          xMax: X_MAX,
          tickInterval: 10,
          renderTick: x => x,
        },
        {
          at: "right",
          top: Y_AXIS.top,
          left: Y_AXIS.left,
          width: Y_AXIS.width,
          height: Y_AXIS.height,
          lineColor: "blue",
          yMin: Y_MIN,
          yMax: Y_MAX,
          tickInterval: 100,
          renderTick: x => x,
        },
      ]}
      crosshair={{
        top: GRAPH.top,
        left: GRAPH.left,
        height: GRAPH.height,
        width: GRAPH.width,
        canvasX: mouse.x,
        canvasY: mouse.y,
        yLineColor: "red",
        yLineWidth: 0.5,
        xLineColor: "green",
        xLineWidth: 4,
      }}
      onMouseMove={onMouseMove}
      onMouseOut={onMouseOut}
    />
  )
}

export default Crosshair
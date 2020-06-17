import React from "react"
import Graph from "../components/Graph"

// fake data
const X_MIN = 0
const X_MAX = 50
const Y_MIN = 0
const Y_MAX = 1000

const X_TICK_INTERVAL = 10
const Y_TICK_INTERVAL = 100

const LINES = [
  [...new Array(X_MAX)].map((_, i) => ({
    x: i,
    y: Math.random() * Y_MAX + Y_MIN,
  })),

  [...new Array(X_MAX)].map((_, i) => ({
    x: i,
    y: Math.random() * Y_MAX + Y_MIN,
  })),
]

const COLORS = ["green", "red"]

// dimensions
const WIDTH = 900
const HEIGHT = 300

function Lines() {
  return (
    <Graph
      width={WIDTH}
      height={HEIGHT}
      animate={false}
      backgroundColor="beige"
      xMin={X_MIN}
      xMax={X_MAX}
      yMin={Y_MIN}
      yMax={Y_MAX}
      xAxisAt="bottom"
      xTickInterval={X_TICK_INTERVAL}
      yAxisAt="left"
      yTickInterval={Y_TICK_INTERVAL}
      graphs={[
        ...LINES.map((data, i) => ({
          type: "line",
          data,
          lineColor: COLORS[i],
          step: 1,
        })),
      ]}
    />
  )
}

export default Lines

// @flow
import type { Props } from './types'

export function draw (ctx: any, props: Props) {
  const {
    getCanvasX,
    getCanvasY,
    bar
  } = props

  const { data } = bar

  const canvasY0 = getCanvasY(0)

  // TODO render only part of bar that is inside graph
  for (let i = 0; i < data.length; i++) {
    const canvasX = getCanvasX(data[i].x)
    const canvasY = getCanvasY(data[i].y)

    // const barHeight = graph.top + graph.height - canvasY
    const barHeight = canvasY0 - canvasY

    ctx.fillStyle = props.bar.getColor(data[i])
    ctx.fillRect(
      canvasX - bar.width / 2,
      canvasY,
      bar.width,
      barHeight
    )
  }
}

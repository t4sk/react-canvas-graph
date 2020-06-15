import { CanvasContext, Layout, XAxisAt } from "./types"
import { getCanvasX } from "./math"

interface Label {
  x?: number
  width: number
  height: number
  backgroundColor: string
  color: string
  font: string
  textPadding: number
  render: (x?: number) => string
  drawLine: boolean
  lineWidth: number
  lineColor: string
}

const defaultProps = {
  width: 50,
  height: 20,
  backgroundColor: "white",
  font: "",
  color: "black",
  textPadding: 10,
  render: () => "",
  drawLine: true,
  lineWidth: 1,
  lineColor: "black",
}

function setDefaults(props: Label): Label {
  return {
    ...defaultProps,
    ...props,
  }
}

function getTop(
  label: Label,
  layout: Layout,
  props: { xAxisAt: XAxisAt; xTickLength: number }
): number {
  const { graph } = layout
  const { xAxisAt, xTickLength } = props

  if (xAxisAt === "top") {
    return graph.top - label.height - xTickLength
  }
  if (xAxisAt === "bottom") {
    return graph.top + graph.height + xTickLength
  }

  return 0
}

function getLineStart(
  layout: Layout,
  props: { xAxisAt: XAxisAt; xTickLength: number }
): number {
  const { graph } = layout
  const { xAxisAt, xTickLength } = props

  if (xAxisAt === "top") {
    return graph.top - xTickLength
  }
  if (xAxisAt === "bottom") {
    return graph.top + graph.height + xTickLength
  }

  return 0
}

function getLineEnd(layout: Layout, props: { xAxisAt: XAxisAt }): number {
  const { graph } = layout
  const { xAxisAt } = props

  if (xAxisAt === "top") {
    return graph.top + graph.height
  }
  if (xAxisAt === "bottom") {
    return graph.top
  }

  return 0
}

export function draw(
  ctx: CanvasContext,
  layout: Layout,
  label: Label,
  props: { xMin: number; xMax: number; xAxisAt: XAxisAt; xTickLength: number }
) {
  // TODO remove setDefaults?
  // label = setDefaults(label)

  const {
    x,
    width,
    height,
    backgroundColor,
    font,
    color,
    textPadding,
    render,
    drawLine,
    lineWidth,
    lineColor,
  } = label

  const { graph } = layout

  const { xMin, xMax } = props

  if (x === undefined) {
    return
  }

  const canvasX = getCanvasX(graph.width, graph.left, xMax, xMin, x)
  const left = canvasX - Math.round(width / 2)
  const top = getTop(label, layout, props)

  // label box
  ctx.fillStyle = backgroundColor
  ctx.fillRect(left, top, width, height)

  // text
  ctx.font = font
  ctx.fillStyle = color
  ctx.textAlign = "center"
  ctx.textBaseline = "middle"

  ctx.fillText(render(x), left + width / 2, top + textPadding)

  if (drawLine) {
    ctx.lineWidth = lineWidth
    ctx.strokeStyle = lineColor

    const lineStart = getLineStart(layout, props)
    const lineEnd = getLineEnd(layout, props)

    ctx.beginPath()
    ctx.moveTo(left + width / 2, lineStart)
    ctx.lineTo(left + width / 2, lineEnd)
    ctx.stroke()
  }
}

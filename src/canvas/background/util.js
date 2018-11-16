// @flow
// TODO rename file util

export function getGraphWidth (props: Props): number {
  return props.width - props.yAxisWidth
}

export function getGraphHeight (props: Props): number {
  return props.height - props.xAxisHeight
}

export function getGraphLeft (props: Props): number {
  switch (props.yAxisAt) {
    case 'left':
      return props.left + props.yAxisWidth
    case 'right':
      return props.left
    default:
      throw new Error(`invalid yAxisAt ${props.yAxisAt}`)
  }
}

export function getGraphTop (props: Props): number {
  switch (props.xAxisAt) {
    case 'top':
      return props.top + props.xAxisHeight
    case 'bottom':
      return props.top
    default:
      throw new Error(`invalid xAxisAt ${props.xAxisAt}`)
  }
}
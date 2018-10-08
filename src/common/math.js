// @flow

export function floor (x: number): number {
  return x ^ 0
}

export function round (x: number): number {
  return (x + 0.5) | 0
}

export function nearestStepBelow (x: number, step: number): number {
  return Math.floor(x / step) * step
}

type LinearArgs = {
  dx: number,
  dy: number,
  y0: number,
}

export function linear ({ dx, dy, y0 }: LinearArgs): number => number {
  const df = dy / dx
  return x => df * x + y0
}

import React, { Component } from 'react'
import { merge, rand } from '../test-util'
import TestCanvas from '../test-canvas'
import { linear, round, getNearestDataAtX } from '../math'
import * as background from '../background'
import {
  getGraphLeft,
  getGraphWidth,
  getGraphHeight
} from '../background/common'
import * as line from '../line'
import * as ui from './index'

const X_MIN = 1900
const X_MAX = 2010
const Y_MIN = 10
const Y_MAX = 110

let LINE_DATA = []

for (let i = 0; i < 10; i++) {
  LINE_DATA.push({
    x: round(rand(X_MIN, X_MAX)),
    y: round(rand(Y_MIN, Y_MAX))
  })
}

LINE_DATA.sort((a, b) => a.x - b.x)

// TODO one canvas to test all (candlestick, barchart, line chart, zoom, drag, nearest data)
function getTop(top, margin, height, graph) {
  return top  + margin
}

function getLeft(left, margin, width, graph) {
  if (left -margin - width <= graph.left) {
     return left + margin
  }
  return left - margin - width
}

function getTransition(left, margin, width, graph) {
  let transition = ''

  if (left <= graph.left + 2 * (width + margin)) {
    transition = 'left 0.1s'
  }

  return transition
}

class TestRender extends Component {
  constructor (props) {
    super(props)
    this.state = {
      zoom: {
        xMin: 1900,
        xMax: 2010,
        yMin: 10,
        yMax: 110,
        xInterval: 15,
        yInterval: 10,
      },
      drag: {
        xMin: 1900,
        xMax: 2010,
      },
      nearest: {
        mouseX: undefined,
        mouseY: undefined,
        data: undefined,
      },
      updateCanvasProps: {
        canvas: {
          width: 500,
          height: 300,
        }
      }
    }
  }

  onWheelTestZoom = (e, mouse) => {
    if (ui.isInsideGraph(mouse, this.props.graph)) {
      e.preventDefault()

      if (e.deltaY > 0) {
        // zoom out
        this.setState((state) => ({
          zoom: {
            ...state.zoom,
            xMin: state.zoom.xMin - 15,
            xMax: state.zoom.xMax + 15,
            xInterval: state.zoom.xInterval + 5,
            yMin: state.zoom.yMin - 10,
            yMax: state.zoom.yMax + 10,
            yInterval: state.zoom.yInterval + 5,
          }
        }))
      } else {
        // zoom in
        this.setState((state) => ({
          zoom: {
            ...state.zoom,
            xMin: state.zoom.xMin + 15,
            xMax: state.zoom.xMax +-15,
            xInterval: state.zoom.xInterval - 5,
            yMin: state.zoom.yMin + 10,
            yMax: state.zoom.yMax - 10,
            yInterval: state.zoom.yInterval - 5,
          }
        }))
      }
    }
  }

  onWheelTestUpdateCanvasProps = (e) => {
    e.preventDefault()
    if (e.deltaY > 0) {
      this.setState((state) => ({
        updateCanvasProps: {
          canvas: {
            width: state.updateCanvasProps.canvas.width + 10,
            height: state.updateCanvasProps.canvas.height + 10,
          }
        }
      }))
    } else {
      this.setState((state) => ({
        updateCanvasProps: {
          canvas: {
            width: state.updateCanvasProps.canvas.width - 10,
            height: state.updateCanvasProps.canvas.height - 10,
          }
        }
      }))
    }
  }

  onMouseMoveTestGetNearestData = mouse => {
    const {
      xMax,
      xMin,
      graph,
    } = this.props

    if (ui.isInsideGraph(mouse, graph)) {
      const x = linear({
        dy: xMax - xMin,
        dx: graph.width,
        y0: xMin,
      })(mouse.x - graph.left)

      const data = getNearestDataAtX(x, LINE_DATA)

      this.setState((state) => ({
        nearest: {
          mouseX: mouse.x,
          mouseY: mouse.y,
          data,
        }
      }))
    } else {
      this.setState((state) => ({
        nearest: {
          mouseX: undefined,
          mouseY: undefined,
          data: undefined,
        }
      }))
    }
  }

  onMouseOutTestGetNearestData = () => {
    this.setState((state) => ({
      nearest: {
        mouseX: undefined,
        mouseY: undefined,
        data: undefined,
      }
    }))
  }

  onMouseMoveTestDrag = mouse => {
    if (!mouse.isDragging) {
      return
    }

    if (!ui.isInsideGraph(mouse, this.props.graph)) {
      return
    }

    const graphLeft = getGraphLeft(this.props)
    const width = getGraphWidth(this.props)

    const { dragStartXMin, dragStartXMax } = mouse

    const toX = linear({
      dy: dragStartXMax - dragStartXMin,
      dx: width,
      y0: dragStartXMin - (dragStartXMax - dragStartXMin) / width * graphLeft
    })

    const diff = mouse.x - mouse.dragStartLeft

    const xMin = toX(graphLeft - diff)
    const xMax = toX(graphLeft + width - diff)

    this.setState((state) => ({
      drag: {
        xMin,
        xMax
      }
    }))
  }

  render () {
    return (
      <div>
        <h3>Scroll to Zoom</h3>
        <TestCanvas
          {...this.props}
          xMin={this.state.zoom.xMin}
          xMax={this.state.zoom.xMax}
          yMin={this.state.zoom.yMin}
          yMax={this.state.zoom.yMax}
          drawBackground={(ctx, props) => {
            background.draw(ctx, merge(props, {
              background: {
                xInterval: this.state.zoom.xInterval,
                yInterval: this.state.zoom.yInterval,
              }
            }))
          }}
          showUI={true}
          drawUI={ui.draw}
          onWheel={this.onWheelTestZoom}
        />

        <h3>Get Nearest Data at X</h3>
        <div style={{
          position: 'relative',
          width: '100%',
          height: '100%'
        }}>
          <TestCanvas
            {...this.props}
            drawBackground={background.draw}
            drawData={(ctx, props) => {
              line.draw(ctx, {
                ...props,
                data: LINE_DATA,
                line: {
                  color: 'green',
                  width: 1
                }
              })
            }}
            showUI={true}
            drawUI={(ctx, props) => {
              ui.draw(ctx, props)

              if (this.state.nearest.data) {
                const centerX = linear({
                  dy: props.graph.width,
                  dx: props.xMax - props.xMin,
                  y0: props.graph.left - props.graph.width / (props.xMax - props.xMin) * props.xMin
                })(this.state.nearest.data.x)

                const centerY = linear({
                  dy: -props.graph.height,
                  dx: props.yMax - props.yMin,
                  y0: props.graph.top + props.graph.height + props.graph.height / (props.yMax - props.yMin) * props.yMin
                })(this.state.nearest.data.y)

                const radius = 10

                ctx.beginPath();
                ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
                ctx.fillStyle = 'rgba(255, 255, 0, 0.5)';
                ctx.fill();

                ctx.beginPath();
                ctx.fillStyle = "orange"
                ctx.fillRect(centerX - 5, centerY - 5, 10, 10)

                ctx.beginPath();
                ctx.lineWidth = 2
                ctx.strokeStyle = "white"
                ctx.rect(centerX - 5, centerY - 5, 10, 10)
                ctx.stroke()
              }
            }}
            onMouseMove={this.onMouseMoveTestGetNearestData}
            onMouseOut={this.onMouseOutTestGetNearestData}
          />
          {this.state.nearest.data && (
            <div
              style={{
                position: 'absolute',
                width: 40,
                height: 20,
                top: getTop(this.state.nearest.mouseY, 10, 20, this.props.graph),
                left:getLeft(this.state.nearest.mouseX, 10, 40, this.props.graph),
                transition: getTransition(this.state.nearest.mouseX, 10, 40, this.props.graph),
                zIndex: 4,
                border: '1px solid black',
                backgroundColor: 'rgba(255, 255, 255, 0.4)',
              }}
            >
              {this.state.nearest.data.x}
            </div>
          )}
        </div>

        <h3>X Drag</h3>
        <TestCanvas
          {...this.props}
          xMin={this.state.drag.xMin}
          xMax={this.state.drag.xMax}
          drawBackground={background.draw}
          showUI={true}
          drawUI={ui.draw}
          onMouseMove={this.onMouseMoveTestDrag}
        />

        <h3>Update Canvas Props</h3>
        <TestCanvas
          {...merge(this.props, {
            canvas: this.state.updateCanvasProps.canvas,
            graph: {
              width: getGraphWidth(merge(this.props, {
                canvas: this.state.updateCanvasProps.canvas
              })),
              height: getGraphHeight(merge(this.props, {
                canvas: this.state.updateCanvasProps.canvas,
              }))
            }
          })}
          drawBackground={background.draw}
          showUI={true}
          drawUI={ui.draw}
          onWheel={this.onWheelTestUpdateCanvasProps}
        />

        <h3>X Label Bottom</h3>
        <TestCanvas
          {...merge(this.props, {
            background: {
              xAxisAt: 'bottom'
            },
            ui: {
              xLabelAt: 'bottom'
            }
          })}
          drawBackground={background.draw}
          showUI={true}
          drawUI={ui.draw}
        />

        <h3>X Label Top</h3>
        <TestCanvas
          {...merge(this.props, {
            background: {
              xAxisAt: 'top'
            },
            graph: {
              top: 60
            },
            ui: {
              xLabelAt: 'top'
            }
          })}
          drawBackground={background.draw}
          showUI={true}
          drawUI={ui.draw}
        />

        <h3>X Label Fixed</h3>
        <TestCanvas
          {...this.props}
          drawData={(ctx, props) => {
            ui.drawXLineAt(ctx, {
              ...props,
              lineColor: 'orange',
              left: 275
            })

            ui.drawXLabelAt(ctx, {
              ...props,
              left: 275,
              text: 'Here',
              height: props.ui.xLabelHeight,
              width: props.ui.xLabelWidth,
              labelAt: props.ui.xLabelAt,
              backgroundColor: 'orange',
              font: props.ui.xLabelFont,
              color: 'white'
            })
          }}
          drawBackground={background.draw}
          showUI={true}
          drawUI={ui.draw}
        />

        <h3>Y Label Left</h3>
        <TestCanvas
          {...merge(this.props, {
            background: {
              yAxisAt: 'left'
            },
            ui: {
              yLabelAt: 'left'
            }
          })}
          drawBackground={background.draw}
          showUI={true}
          drawUI={ui.draw}
        />

        <h3>Y Label Right</h3>
        <TestCanvas
          {...merge(this.props, {
            background: {
              yAxisAt: 'right'
            },
            graph: {
              left: 20
            },
            ui: {
              yLabelAt: 'right'
            }
          })}
          drawBackground={background.draw}
          showUI={true}
          drawUI={ui.draw}
        />

        <h3>Y Label Fixed</h3>
        <TestCanvas
          {...this.props}
          drawData={(ctx, props) => {
            ui.drawYLineAt(ctx, {
              ...props,
              lineColor: 'orange',
              top: 150
            })
            ui.drawYLabelAt(ctx, {
              ...props,
              top: 150,
              height: props.ui.yLabelHeight,
              width: props.ui.yLabelWidth,
              labelAt: props.ui.yLabelAt,
              text: 'Here',
              backgroundColor: 'orange',
              font: props.ui.yLabelFont,
              color: 'white'
            })
          }}
          drawBackground={background.draw}
          showUI={true}
          drawUI={ui.draw}
        />
      </div>
    )
  }
}

TestRender.defaultProps = {
  canvas: {
    width: 500,
    height: 300
  },
  margin: {
    top: 10,
    bottom: 20,
    left: 20,
    right: 30
  },
  graph: {
    // y label left, x label bottom
    left: 70, // margin.left + x.axis.width
    top: 10, // margin.top
    width: 400, // canvas.width - (margin.left + margin.right + x.axis.width)
    height: 220 // canvas.height - (margin.top + margin.bottom + y.axis.height)
  },
  background: {
    backgroundColor: 'lightgrey',

    showYLabel: true,
    showYLine: true,
    yLineWidth: 1,
    yLineColor: 'red',
    yAxisAt: 'left',
    yAxisWidth: 50,
    yLabelFont: '12px Arial',
    yLabelColor: 'black',
    renderYLabel: y => y,
    yInterval: 10,

    showXLabel: true,
    showXLine: true,
    xLineWidth: 1,
    xLineColor: 'blue',
    xAxisAt: 'bottom',
    xAxisHeight: 50,
    xLabelFont: '12px Arial',
    xLabelColor: 'black',
    renderXLabel: x => x,
    xInterval: 15
  },
  ui: {
    xLineColor: 'blue',
    xLabelAt: 'bottom',
    xLabelWidth: 70,
    xLabelHeight: 20,
    xLabelBackgroundColor: 'green',
    xLabelFont: '12px Arial',
    xLabelColor: 'black',
    renderXLabel: x => Math.round(x),

    yLineColor: 'green',
    yLabelAt: 'left',
    yLabelWidth: 50,
    yLabelHeight: 20,
    yLabelBackgroundColor: 'black',
    yLabelFont: '12px Arial',
    yLabelColor: 'white',
    renderYLabel: y => y.toFixed(2)
  },
  yMin: Y_MIN,
  yMax: Y_MAX,
  xMin: X_MIN,
  xMax: X_MAX
}

export default TestRender

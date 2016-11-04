import {setupImmo} from '../immo'
import LineEngine from '../line-engine'
import LineSpace from '../line-space'

import {ITERATE, GRAVITY, DEFAULT_START_POSITION, DEFAULT_START_VELOCITY} from './constants.js'
import Rider from './Rider.js'
import {ClassicGrid} from './grids'

// @setupImmo
export default class LineRiderEngine extends LineEngine {
  __props__ () {
    return {
      iterations: ITERATE,
      stepOptions: {
        gravity: GRAVITY
      },
      rider: this.makeRider()
    }
  }
  __state__ () {
    return {
      start: {
        position: DEFAULT_START_POSITION,
        velocity: DEFAULT_START_VELOCITY
      }
    }
  }
  __computed__ () {
    return {
      lineSpace: new LineSpace(({p1: {x: x1, y: y1}, p2: {x: x2, y: y2}}) => [x1, y1, x2, y2])
    }
  }

  /* public */
  // getLastFrameIndex ()
  // getLine (id)
  // getMaxLineID ()
  // addLine (line)
  // removeLine (line)
  constructor () {
    super()
    return this.setStart().setConstraints(this.rider.constraints)
  }

  setStart (position = DEFAULT_START_POSITION, velocity = DEFAULT_START_VELOCITY) {
    return this.updateState({
      start: {
        position,
        velocity
      }
    }).setInitialStates(this.rider.makeStateArray(position, velocity))
  }

  getRider (frameIndex) {
    return this.rider.getBody(this.getStateMapAtFrame(frameIndex))
  }

  toJSON () {
    // until List.toJS() gets implemented
    this.linesList.__getBuffer()
    return {
      start: this.start,
      lines: this.linesList.buffer.map(line => line.toJSON())
    }
  }

  /* private */
  _addLine (line) {
    super._addLine(line)
    this.lineSpace.addLine(line)
  }
  _removeLine (line) {
    super._removeLine(line)
    this.lineSpace.removeLine(line)
  }

  makeRider () {
    return new Rider()
  }

  makeGrid (...args) {
    return new ClassicGrid(...args)
  }

  selectLinesInBox (x0, y0, x1, y1) {
    this.updateComputed()
    return this.lineSpace.selectLinesInBox(x0, y0, x1, y1)
  }
  selectLinesInRadius (c, r) {
    this.updateComputed()
    return this.lineSpace.selectLinesInRadius(c, r)
  }
  selectClosestLineInRadius (c, r) {
    this.updateComputed()
    return this.lineSpace.selectClosestLineInRadius(c, r)
  }
  getBoundingBox () {
    this.updateComputed()
    return this.lineSpace.getBoundingBox()
  }
}
setupImmo(LineRiderEngine)

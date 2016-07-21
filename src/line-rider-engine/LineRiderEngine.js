import {setupImmo} from '../Immo.js'
import LineEngine from '../line-engine'

import {ITERATE, GRAVITY, DEFAULT_START_POSITION, DEFAULT_START_VELOCITY} from './constants.js'
import Rider from './rider.js'
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
  makeRider () {
    return new Rider()
  }

  makeGrid (...args) {
    return new ClassicGrid(...args)
  }

  /* not implemented rn */
  // selectLinesInBox ([x0, y0, x1, y1])
  // selectLinesInRadius ({x, y}, r)
  // selectClosestLineInRadius ({x, y}, r)
  // getBoundingBox ()
}
setupImmo(LineRiderEngine)

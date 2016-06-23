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
  // getLineByID (id)
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

  /* private */
  makeRider () {
    return new Rider()
  }

  makeGrid (...args) {
    return new ClassicGrid(...args)
  }

  /* not implemented rn */
  // getLinesInBox ([x0, y0, x1, y1])
  // getLinesInRadius ({x, y}, r)
  // getMaxLineID ()
  // getLineData ()
  // getBoundingBox ()
}
setupImmo(LineRiderEngine)

import {setupImmo} from '../Immo.js'
import LineEngine from '../line-engine'

import {ITERATE, GRAVITY, DEFAULT_START_POSITION, DEFAULT_START_VELOCITY} from './constants.js'
import Rider from './rider.js'
import LineRiderGrid from './rider.js'

// @setupImmo
export default class LineRiderEngine extends LineEngine {
  __props__ () {
    return {
      iterations: ITERATE,
      gravity: GRAVITY,
      rider: this.makeRider()
    }
  }
  constructor () {
    super()
    return this.setStart().setConstraints(this.rider.getConstraints())
  }

  getStart () {
    return {
      position: this.rider.getStartPosition(this.state),
      velocity: this.rider.getStartVelocity(this.state)
    }
  }
  setStart (position = DEFAULT_START_POSITION, velocity = DEFAULT_START_VELOCITY) {
    return this.setInitState(this.rider.makeState(position, velocity))
  }

  getRider (frameIndex) {
    return this.rider.getBody(this.getStateAtFrame(frameIndex))
  }

  makeRider () {
    return new Rider()
  }

  makeGrid () {
    return new LineRiderGrid()
  }

  preIterate (state) {
    return this.rider.getPointsUpdate(state, this.gravity)
  }

  postIterate (state) {
    return this.rider.getMountScarfUpdate(state)
  }
}
setupImmo(LineRiderEngine)

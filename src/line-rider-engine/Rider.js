import {StateUpdate} from '../line-engine'

import classicRiderBody from './rider.json'

class GravityAirUpdate extends StateUpdate {}
class ScarfUpdate extends StateUpdate {}
class MountUpdate extends StateUpdate {}

export default class Rider {
  constructor (riderBody = classicRiderBody) {
    this.body = riderBody
  }
  makeState (position, velocity) {}
  getStartPosition () {}
  getStartVelocity () {}
  getConstraints () {}
  getPointsUpdate (state, gravity) {
    return new GravityAirUpdate()
  }
  getMountScarfUpdate (state) {
    return [new MountUpdate(), new ScarfUpdate()]
  }
  getBody (state) {
    return {}
  }
}

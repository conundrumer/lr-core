import V2 from '../../v2'

import SolidLine from './SolidLine.js'
import LineTypes from './LineTypes.js'

const ACC = 0.1

export default class AccLine extends SolidLine {
  constructor (data) {
    super(data)
    this.c.acc = this.acc
  }
  get type () {
    return LineTypes.ACC
  }
  get acc () {
    return V2(this.norm).rotCW().mul(ACC * (this.flipped ? -1 : 1))
  }
  doCollide (p, pos, prevPos) {
    prevPos.add(this.c.acc)
    return p.updateState({pos, prevPos})
  }
}

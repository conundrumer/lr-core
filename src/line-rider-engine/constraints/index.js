import V2 from '../../V2.js'

export class Stick {
  get iterating () {
    return true
  }
  constructor ({id, p1, p2, restLength}, initialStateMap) {
    restLength = restLength != null ? restLength : V2.len(initialStateMap.get(p1).pos, initialStateMap.get(p2).pos)
    Object.assign(this, {id, p1, p2, restLength})
  }

  resolve (stateMap) {
    let p1 = stateMap.get(this.p1)
    let p2 = stateMap.get(this.p2)
    let length = V2.len(p1.pos, p2.pos)

    // prevent division by zero
    // this will allow interesting behavior but w/e
    let diff = length === 0 ? 0 : (length - this.restLength) / length * 0.5

    let delta = V2(p1.pos).sub(p2.pos).mul(diff)

    return [
      p1.updateState({ pos: V2(p1.pos).sub(delta) }),
      p2.updateState({ pos: V2(p2.pos).add(delta) })
    ]
  }
}
export class RepelStick extends Stick {}

export class BindStick extends Stick {
  constructor ({id, p1, p2, restLength, binding, endurance}, initialStateMap) {
    super({id, p1, p2, restLength}, initialStateMap)
    Object.assign(this, {binding, endurance})
  }
}

export class BindJoint {
  get iterating () {
    return false
  }

  constructor ({id, p1, p2, q1, q2, binding}) {
    Object.assign(this, {id, p1, p2, q1, q2, binding})
  }

  resolve () { return [] }
}
export class DirectedChain {
  get iterating () {
    return false
  }

  constructor ({id, ps}) {
    Object.assign(this, {id, ps})
  }

  resolve () { return [] }
}

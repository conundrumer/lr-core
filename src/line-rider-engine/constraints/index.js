import V2 from '../../V2.js'

function stickResolve (p1, p2, diff) {
  let delta = V2(p1.pos).sub(p2.pos).mul(diff)

  return [
    p1.setPosition(V2(p1.pos).sub(delta)),
    p2.setPosition(delta.add(p2.pos))
  ]
}

export class Stick {
  get iterating () {
    return true
  }
  constructor ({id, p1, p2, length, lengthFactor = 1}, initialStateMap) {
    length = length != null ? length : V2.dist(initialStateMap.get(p1).pos, initialStateMap.get(p2).pos)
    length *= lengthFactor
    Object.assign(this, {id, p1, p2, length})
  }

  getDiff (length) {
    return length === 0 ? 0 : (length - this.length) / length * 0.5
  }

  resolve (stateMap) {
    let p1 = stateMap.get(this.p1)
    let p2 = stateMap.get(this.p2)
    let length = V2.dist(p1.pos, p2.pos)
    return stickResolve(p1, p2, this.getDiff(length))
  }
}
export class RepelStick extends Stick {
  resolve (stateMap) {
    let p1 = stateMap.get(this.p1)
    let p2 = stateMap.get(this.p2)
    let length = V2.dist(p1.pos, p2.pos)
    if (length >= this.length) {
      return []
    }
    return stickResolve(p1, p2, this.getDiff(length))
  }
}

export class BindStick extends Stick {
  constructor ({id, p1, p2, length, binding, endurance}, initialStateMap) {
    super({id, p1, p2, length}, initialStateMap)
    endurance = endurance * this.length * 0.5
    Object.assign(this, {binding, endurance})
  }
  resolve (stateMap) {
    let binding = stateMap.get(this.binding)
    if (!binding.isBinded()) {
      return []
    }
    let p1 = stateMap.get(this.p1)
    let p2 = stateMap.get(this.p2)
    let length = V2.dist(p1.pos, p2.pos)
    let diff = this.getDiff(length)
    // console.log('diff', diff)
    if (diff > this.endurance) {
      // console.log('true')
      return [binding.setBind(false)]
    }
    return stickResolve(p1, p2, diff)
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

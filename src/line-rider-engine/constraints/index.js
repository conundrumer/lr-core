import V2 from '../../v2'

function stickResolve (p1, p2, diff) {
  let delta = V2(p1.pos).sub(p2.pos).mul(diff)

  return [
    p1.setPosition(V2(p1.pos).sub(delta)),
    p2.setPosition(delta.add(p2.pos))
  ]
}

function getDiff (restLength, length) {
  return length === 0 ? 0 : (length - restLength) / length
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
    return getDiff(this.length, length) * 0.5
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
    if (diff > this.endurance) {
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

  resolve (stateMap) {
    let p1 = stateMap.get(this.p1)
    let p2 = stateMap.get(this.p2)
    let q1 = stateMap.get(this.q1)
    let q2 = stateMap.get(this.q2)
    let binding = stateMap.get(this.binding)
    // allow kramuals
    if (V2.cross(V2(p2.pos).sub(p1.pos), V2(q2.pos).sub(q1.pos)) >= 0) {
      return []
    } else if (binding.isBinded()) {
      return [binding.setBind(false)]
    }
    return []
  }
}
export class DirectedChain {
  get iterating () {
    return false
  }

  constructor ({id, ps}, initialStateMap) {
    let [, ...points] = ps
    let lengths = points.map((id, i) =>
      V2.dist(initialStateMap.get(id).pos, initialStateMap.get(ps[i]).pos)
    )
    Object.assign(this, {id, ps, lengths})
  }

  resolve (stateMap) {
    let points = this.ps.map(id => stateMap.get(id))

    for (let i = 1; i < points.length; i++) {
      let p0 = points[i - 1]
      let p1 = points[i]
      let restLength = this.lengths[i - 1]
      let length = V2.dist(p0.pos, p1.pos)
      let nextPosition = V2(p0.pos).sub(p1.pos).mul(getDiff(restLength, length)).add(p1.pos)

      points[i] = p1.setPosition(nextPosition)
    }

    [, ...points] = points

    return points
  }
}

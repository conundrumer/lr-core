export class Stick {
  get iterating () {
    return true
  }
  constructor ({id, p1, p2}) {
    Object.assign(this, {id, p1, p2})
  }

  resolve (stateMap) { return [] }
}
export class RepelStick extends Stick {}

export class BindStick extends Stick {
  constructor ({id, p1, p2, binding, endurance}) {
    super({id, p1, p2})
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

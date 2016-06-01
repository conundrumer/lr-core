import Immo, {setupImmo} from '../../Immo.js'
import V2 from '../../V2.js'

let ZERO_VEC = {x: 0, y: 0}
// @setupImmo
export class Point extends Immo {
  __props__ () {
    return {
      id: null,
      friction: 0,
      airFriction: 0,
      collidable: false,
      steppable: true
    }
  }
  __state__ () {
    return {
      pos: {x: 0, y: 0},
      prevPos: {x: 0, y: 0},
      vel: {x: 0, y: 0}
    }
  }
  constructor ({id, x, y, friction = 0, airFriction = 0}, {position = ZERO_VEC, velocity = ZERO_VEC} = {}) {
    super({
      props: { id, friction, airFriction },
      state: {
        pos: V2({x, y}).add(position),
        vel: V2(velocity),
        prevPos: V2({x, y}).add(position).sub(velocity)
      }
    })
  }
  step ({gravity}) {
    let vel = V2(this.pos).sub(this.prevPos).mul(1 - this.airFriction).add(gravity)
    return this.updateState({
      pos: V2(this.pos).add(vel),
      prevPos: this.pos,
      vel: vel
    })
  }
}
setupImmo(Point)

export class CollisionPoint extends Point {
  __props__ () {
    return {
      collidable: true
    }
  }
}
setupImmo(CollisionPoint)

export class FlutterPoint extends Point {
  step (gravity) {
    let next = super.step(gravity)
    return next
  }
}

export class Binding extends Immo {
  __props__ () {
    return {
      id: null,
      collidable: false,
      steppable: false
    }
  }
  __state__ () {
    return {
      binded: true
    }
  }
  constructor ({id}) {
    super({props: {id}})
  }
}
setupImmo(Binding)
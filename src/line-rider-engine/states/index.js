import Immo, {setupImmo} from '../../immo'
import V2 from '../../v2'

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
  getNextPos (vel) {
    return V2(this.pos).add(vel)
  }
  step ({gravity}) {
    let vel = V2(this.pos).sub(this.prevPos).mul(1 - this.airFriction).add(gravity)
    return this.updateState({
      pos: this.getNextPos(vel),
      prevPos: this.pos,
      vel: vel
    })
  }
  setPosition (pos) {
    return this.updateState({pos})
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

// based on the canonical glsl rand
// returns a psuedorandom number between 0 and 1
const V = { x: 12.9898, y: 78.233 }
const K = 43758.5453
function rand (seed) {
  return (Math.sin(V2.dot(seed, V)) * K) % 1
}
const INTENSITY = 2
const SPEED_THRESHOLD = 40 // as this gets smaller, the scarf intensifies faster while speed increases
export class FlutterPoint extends Point {
  static getFlutter (vel, seed) {
    let speed = Math.pow(V2.lenSq(vel), 0.25)
    let randMag = rand(vel)
    let randAng = rand(seed)
    randMag *= INTENSITY * speed * -Math.expm1(-speed / SPEED_THRESHOLD)
    randAng *= 2 * Math.PI
    return {
      x: randMag * Math.cos(randAng),
      y: randMag * Math.sin(randAng)
    }
  }
  getNextPos (vel) {
    return V2(this.pos).add(vel).add(FlutterPoint.getFlutter(vel, this.pos))
  }
}

export class Binding extends Immo {
  __props__ () {
    return {
      id: null,
      collidable: false,
      steppable: true
    }
  }
  __state__ () {
    return {
      framesSinceUnbind: -1
    }
  }
  constructor ({id}) {
    super({props: {id}})
  }
  isBinded () {
    return this.framesSinceUnbind === -1
  }
  setBind (bind) {
    if (bind && !this.isBinded()) {
      return this.updateState({framesSinceUnbind: -1})
    } else if (!bind && this.isBinded()) {
      return this.updateState({framesSinceUnbind: 0})
    }
  }
  step () {
    if (this.isBinded()) {
      return this
    }
    return this.updateState({ framesSinceUnbind: this.framesSinceUnbind + 1 })
  }
}
setupImmo(Binding)

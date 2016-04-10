/**
 * @typedef Vec2
 *
 * @property {number} x - X component
 * @property {number} y - Y component
 */

export function len (v) {
  return Math.sqrt(v.x * v.x + v.y * v.y)
}
export function lenSq (v) {
  return v.x * v.x + v.y * v.y
}
export function angle (v) {
  return Math.atan2(v.y, v.x)
}
export function angleTo (v, u) {
  return angle(u) - angle(v)
}
export function dist (v, u) {
  const dx = u.x - v.x
  const dy = u.y - v.y
  return Math.sqrt(dx * dx + dy * dy)
}
export function distSq (v, u) {
  const dx = u.x - v.x
  const dy = u.y - v.y
  return dx * dx + dy * dy
}
export function dot (v, u) {
  return v.x * u.x + v.y * u.y
}
export function cross (v, u) {
  return v.x * u.y - v.y * u.x
}
export function equals (v, u) {
  return v.x === u.x && v.y === u.y
}
const V2Functions = {len, lenSq, angle, angleTo, dist, distSq, dot, cross, equals}

const V2Methods = {
  /* mutating methods */
  add (v) {
    this.x += v.x
    this.y += v.y
    return this
  },
  sub (v) {
    this.x -= v.x
    this.y -= v.y
    return this
  },
  mul (s) {
    this.x *= s
    this.y *= s
    return this
  },
  div (s) {
    this.x /= s
    this.y /= s
    return this
  },
  norm () {
    this.div(this.len())
    return this
  },
  // X axis →
  // Y axis ↓
  // rotates clockwise
  rot (rads) {
    const cos = Math.cos(rads)
    const sin = Math.sin(rads)
    const x = this.x
    const y = this.y
    this.x = x * cos - y * sin
    this.y = x * sin + y * cos
    return this
  },
  rotCW () {
    const x = this.x
    const y = this.y
    this.x = -y
    this.y = x
    return this
  },
  rotCCW () {
    const x = this.x
    const y = this.y
    this.x = y
    this.y = -x
    return this
  }
}

for (let key in V2Functions) {
  let fn = V2Functions[key]
  V2Methods[key] = function (v) {
    return fn(this, v)
  }
}

function V2 (v) {
  return Object.assign(Object.create(V2Methods), v)
}

Object.assign(V2, V2Functions)

export default V2

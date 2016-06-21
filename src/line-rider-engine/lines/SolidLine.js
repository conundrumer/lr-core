import V2 from '../../V2.js'

import Line from './Line.js'
import LineTypes from './LineTypes.js'

const MAX_FORCE_LENGTH = 10
const MIN_EXTENSION_RATIO = 0.25

export default class SolidLine extends Line {
  constructor (data) {
    super(data)
    this.flipped = data.flipped || false
    this.leftExtended = data.leftExtended || false
    this.rightExtended = data.rightExtended || false
    this.c = this.getComputed()
  }

  collidesWith (p) {
    let offset = this.offset(p)
    return this.shouldCollide(p, this.perpComp(offset), this.linePos(offset))
  }

  collide (p) {
    let offset = this.offset(p)
    let perpComp = this.perpComp(offset)
    let linePos = this.linePos(offset)

    if (this.shouldCollide(p, perpComp, linePos)) {
      let pos = V2(this.c.norm).mul(perpComp).sub(p.pos).mul(-1)

      // move the previous point closer to reduce inertia and simulate friction
      // retain multiplication order because multiplication is not associative
      // http://www.ecma-international.org/ecma-262/5.1/#sec-11.5.1
      let v = V2(this.c.norm).rotCCW().mul(p.friction).mul(perpComp)
      if (p.prevPos.x >= pos.x) {
        v.x *= -1
      }
      if (p.prevPos.y < pos.y) {
        v.y *= -1
      }
      v.add(p.prevPos)

      return this.doCollide(p, pos, v)
    }
    return null
  }

  get type () {
    return LineTypes.SOLID
  }
  get collidable () {
    return true
  }

  get extension () {
    return Math.min(MIN_EXTENSION_RATIO, MAX_FORCE_LENGTH / this.length)
  }
  get leftBound () {
    return this.leftExtended ? -this.extension : 0
  }
  get rightBound () {
    return this.rightExtended ? 1 + this.extension : 1
  }

  getComputed () {
    let { vec, norm, invLengthSq, length, extension, leftBound, rightBound } = this
    return { vec, norm, invLengthSq, length, extension, leftBound, rightBound }
  }

  offset (p) {
    return V2(p.pos).sub(this.p1)
  }

  // perpendicular component
  perpComp (offset) {
    return this.c.norm.dot(offset)
  }

  // normalized parallel component
  // or closest relative position on the line to the point
  // this is the slowest function
  // so maybe come up with a faster boundary checking algo
  linePos (offset) {
    return this.c.vec.dot(offset) * this.c.invLengthSq
  }

  shouldCollide (p, perpComp, linePos) {
    let pntDirection = this.c.norm.dot(p.vel)

    let pointMovingIntoLine = pntDirection > 0
    let pointInForceBounds = perpComp > 0 && perpComp < MAX_FORCE_LENGTH &&
      linePos >= this.c.leftBound && linePos <= this.c.rightBound

    return pointMovingIntoLine && pointInForceBounds
  }

  doCollide (p, pos, prevPos) {
    return p.updateState({pos, prevPos})
  }
}

import V2 from '../../V2.js'

const MAX_FORCE_LENGTH = 10
const MIN_EXTENSION_RATIO = 0.25

class Line {
  constructor ({id, x1, y1, x2, y2}) {
    this.id = id
    this.p1 = V2({x: x1, y: y1})
    this.p2 = V2({x: x2, y: y2})
    this.flipped = false
    this.leftExtended = false
    this.rightExtended = false
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

      return p.updateState({pos, prevPos: v})
    }
    return null
  }

  getComputed () {
    let vec = V2(this.p2).sub(this.p1)
    let lengthSq = vec.lenSq()
    let invLengthSq = 1 / lengthSq
    let length = Math.sqrt(lengthSq)
    let invLength = 1 / length
    let norm = V2(vec).rotCW().mul(invLength * (this.flipped ? -1 : 1))
    let extension = Math.min(MIN_EXTENSION_RATIO, MAX_FORCE_LENGTH / length)
    let leftBound = this.leftExtended ? -extension : 0
    let rightBound = this.rightExtended ? 1 + extension : 1
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

}

export function createLineFromJson (data) {
  return new Line(data)
}

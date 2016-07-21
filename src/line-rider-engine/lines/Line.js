import V2 from '../../V2.js'

export default class Line {
  constructor ({id, x1, y1, x2, y2}) {
    this.id = id
    this.p1 = V2({x: x1, y: y1})
    this.p2 = V2({x: x2, y: y2})
  }

  get collidable () {
    return false
  }

  get vec () {
    return V2(this.p2).sub(this.p1)
  }
  get lengthSq () {
    return this.vec.lenSq()
  }
  get invLengthSq () {
    return 1 / this.lengthSq
  }
  get length () {
    return Math.sqrt(this.lengthSq)
  }
  get invLength () {
    return 1 / this.length
  }
  get norm () {
    return V2(this.vec).rotCW().mul(this.invLength * (this.flipped ? -1 : 1))
  }

  toJSON () {
    return {
      id: this.id,
      type: this.type,
      x1: this.p1.x,
      y1: this.p1.y,
      x2: this.p2.x,
      y2: this.p2.y
    }
  }
}

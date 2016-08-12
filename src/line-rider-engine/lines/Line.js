import V2 from '../../v2'

export default class Line {
  constructor ({id, x1, y1, x2, y2}) {
    this.id = id
    this.p1 = V2({x: x1, y: y1})
    this.p2 = V2({x: x2, y: y2})
  }

  get collidable () {
    return false
  }

  get x1 () {
    return this.p1.x
  }
  get y1 () {
    return this.p1.y
  }
  get x2 () {
    return this.p2.x
  }
  get y2 () {
    return this.p2.y
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

  equals (line) {
    return this.id === line.id &&
      this.type === line.type &&
      this.p1.equals(line.p1) &&
      this.p2.equals(line.p2)
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

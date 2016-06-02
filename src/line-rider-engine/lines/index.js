import V2 from '../../V2.js'

class SimpleLine {
  constructor ({id, x1, y1, x2, y2}) {
    Object.assign(this, {
      id,
      p1: V2({x: x1, y: y1}),
      p2: V2({x: x2, y: y2})
    })
  }

  collidesWith ({pos: {y}}) {
    return y > this.p1.y
  }

  collide (entity) {
    if (this.collidesWith(entity)) {
      let pos = V2(entity.pos)
      pos.y = this.p1.y
      return entity.updateState({ pos })
    }
    return null
  }
}

export function createLineFromJson (data) {
  return new SimpleLine(data)
}

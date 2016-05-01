function notImplemented (method) {
  throw new TypeError(`${method.name} is not implemented`)
}

export class Grid {
  add (line) { notImplemented(this.add) }
  remove (line) { notImplemented(this.remove) }
  getCellsNearEntity (entity) { notImplemented(this.getCellsNearEntity) }
  getLinesNearEntity (entity) { notImplemented(this.getLinesNearEntity) }
}

export class Line {
  collide (entity) { notImplemented(this.collide) }
  collidesWith (entity) { notImplemented(this.collidesWith) }
}

export class Constraint {
  resolve (state) { notImplemented(this.resolve) }
}

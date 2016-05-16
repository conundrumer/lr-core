import {interfaceClass} from '../abstract-interface.js'

export class Grid {
  add (line) {}
  remove (line) {}
  getCellsNearEntity (entity) {}
  getLinesNearEntity (entity) {}
}
interfaceClass(Grid)

export class Line {
  collide (entity) {}
  collidesWith (entity) {}
}
interfaceClass(Line)

export class Constraint {
  resolve (state) {}
}
interfaceClass(Constraint)

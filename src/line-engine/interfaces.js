import {interfaceClass} from '../abstract-interface.js'

class Grid {
  add (line) {}
  remove (line) {}
  getCellsNearEntity (entity) {}
  getLinesNearEntity (entity) {}
}
interfaceClass(Grid)

class Line {
  collide (entity) {}
  collidesWith (entity) {}
}
interfaceClass(Line)

class Constraint {
  resolve (state) {}
}
interfaceClass(Constraint)

export {Grid, Line, Constraint}

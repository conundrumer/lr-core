import {Interface, ArrayOf, Optional} from '../abstract-interface.js'

class State extends Interface {
  get id () {
    return null
  }
  get collidable () {
    return Boolean
  }
  get steppable () {
    return Boolean
  }
  step (stepOptions = Object) {
    return State
  }
}

export class Constraint extends Interface {
  get iterating () {
    return Boolean
  }
  resolve (state = State) {
    return ArrayOf(State)
  }
}

class Cell extends Interface {}

export class Grid extends Interface {
  add (line = Line) {
    return undefined
  }
  remove (line = Line) {
    return undefined
  }
  getCellsNearEntity (entity = State) {
    return ArrayOf(Cell)
  }
  getLinesNearEntity (entity = State) {
    return ArrayOf(Line)
  }
}

export class Line extends Interface {
  collide (entity = State) {
    return Optional(State)
  }
  collidesWith (entity = State) {
    return Boolean
  }
}

export class LineEngine extends Interface {
  makeGrid () {
    return Grid
  }

  getLastFrameIndex () {
    return Number
  }

  getLastFrame () {
    return Object // Frame
  }

  // step -> (resolve <-> collide) -> endResolve
  getStateMapAtFrame (index = Number) {
    return Map
  }

  getUpdatesAtFrame (index = Number) {
    return ArrayOf(Object) // Update
  }

  getLineByID (id = Number) {
    return Line
  }

  addLine (line = Line) {
    return LineEngine
  }

  removeLine (line = Line) {
    return LineEngine
  }

  setInitialStates (stateArray = ArrayOf(State)) {
    return LineEngine
  }

  setConstraints (constraints = ArrayOf(Constraint)) {
    return LineEngine
  }
}

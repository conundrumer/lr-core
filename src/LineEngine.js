import Immy from 'immy'

import Immo from './Immo.js'
import Frame from './Frame.js'

function notImplemented (method) {
  throw new TypeError(`${method.name} is not implemented`)
}

export class StateUpdate {
  /**
   * [constructor description]
   * @param  {Array} updated [description]
   * @param  {[type]} id      [description]
   */
  constructor (updated, id) {
    this.updated = updated
    if (id != null) {
      this.id = id
    }
  }

  get type () {
    return this.constructor.name
  }
}

class ConstraintUpdate extends StateUpdate {}

class CollisionUpdate extends StateUpdate {
  constructor (updated, id) {
    super([updated], id)
  }
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

function makeConstructorArgs ({constants, iterations} = {}) {
  return [{constants, iterations}, {
    linesList: new Immy.List(),
    initState: new Map(),
    constraints: []
  }, {
    linesMap: new Map(),
    frames: [new Frame()],
    collidables: [],
    grid: null
  }]
}
export default class LineEngine extends Immo(...makeConstructorArgs()) {
  makeGrid () { notImplemented(this.makeGrid) }
  preIterate (state) {}
  postIterate (state) {}

  constructor (props) {
    super(...makeConstructorArgs(props))
    this.grid = this.makeGrid()
  }

  getLastFrameIndex () {
    this._updateIfOutdated()
    return this._getLastFrameIndex()
  }

  getLastFrame () {
    this._updateIfOutdated()
    return this._getLastFrame()
  }

  getStateAtFrame (index) {
    this._updateIfOutdated()
    this._computeFrame(index)
    return this.frames[index].state
  }

  getUpdatesAtFrame (index) {
    this._updateIfOutdated()
    this._computeFrame(index)
    return this.frames[index].updates
  }

  getLineByID (id) {
    this._updateIfOutdated()
    return this.linesMap.get(id)
  }

  addLine (line) {
    this._updateIfOutdated()
    let nextLinesList = this._modifyLinesList(line, (lines, line) => {
      this._addLine(line)
      let index = lines.findInsertionIndexWithBinarySearch((existing) => existing.id - line.id)
      return lines.withValueAdded(index, line)
    })
    return this.update({linesList: nextLinesList})
  }

  removeLine (line) {
    this._updateIfOutdated()
    let nextLinesList = this._modifyLinesList(line, (lines, line) => {
      this._removeLine(line)
      let index = lines.findIndexWithBinarySearch((existing) => existing.id - line.id)
      return lines.withValueRemoved(index, line)
    })
    return this.update({linesList: nextLinesList})
  }

  setInitState (state, debug) {
    this._updateIfOutdated()
    this._setFramesLength(1)
    let initState = new Map(state.map((substate) => [substate.id, substate]))
    this.collidables = state.filter(({collidable}) => collidable).map(({id}) => id)
    this.frames[0] = new Frame(initState)
    return this.update({initState})
  }

  setConstraints (constraints) {
    this._updateIfOutdated()
    this._setFramesLength(1)
    return this.update({constraints: constraints.slice()})
  }

  _updateIfOutdated () {
    super.updateIfOutdated({
      linesList: (current) => {
        let diff = current.linesList.compareTo(this.linesList)
        diff.forEachPrimitive((primOp) => {
          let line = primOp.value
          if (primOp instanceof Immy.ListPatches.Add) {
            this._addLine(line)
          } else {
            this._removeLine(line)
          }
        })
      },
      initState: () => {
        this.setInitState(Array.from(this.initState.values()), true)
      },
      constraints: () => {
        this.setConstraints(this.constraints)
      }
    })
  }

  _addLine (line) {
    this.linesMap.set(line.id, line)
    let cells = this.grid.add(line)
    for (let cell of cells) {
      let index = this._getLastFrame().getIndexOfCollisionInCell(cell, line)
      if (index != null) {
        this._setFramesLength(index)
      }
    }
  }

  _removeLine (line) {
    this.linesMap.delete(line.id)
    this.grid.remove(line)
    let index = this._getLastFrame().getIndexOfCollisionWithLine(line)
    if (index != null) {
      this._setFramesLength(index)
    }
  }

  _modifyLinesList (line, modify) {
    if (line instanceof Array) {
      return line.reduce((lines, line) => modify(lines, line), this.linesList)
    } else {
      return modify(this.linesList, line)
    }
  }

  _setFramesLength (length) {
    this.frames.length = length
  }

  _getLastFrameIndex () {
    return this.frames.length - 1
  }

  _getLastFrame () {
    return this.frames[this._getLastFrameIndex()]
  }
  _computeFrame (index) {
    while (this.frames.length <= index) {
      let nextFrame = this._getNextFrame(this._getLastFrame(), this._getLastFrameIndex() + 1)
      this.frames.push(nextFrame)
    }
  }

  _getNextFrame (frame, index) {
    frame = frame.clone()
    frame.updateState(this.preIterate(frame.state))
    for (let i = 0; i < this.iterations; i++) {
      for (let constraint of this.constraints) {
        frame.updateState(new ConstraintUpdate(constraint.resolve(frame.state), constraint.id))
      }
      for (let id of this.collidables) {
        let entity = frame.state.get(id)
        frame.addToGrid(this.grid, entity, index)

        let lines = this.grid.getLinesNearEntity(entity)
        for (let line of lines) {
          let nextEntity = line.collide(entity)
          if (nextEntity) {
            frame.updateState(new CollisionUpdate(nextEntity, line.id))
            entity = nextEntity

            frame.addToGrid(this.grid, entity, index)
            frame.addToCollisions(line, index)
          }
        }
      }
    }
    frame.updateState(this.postIterate(frame.state))
    return frame
  }
}

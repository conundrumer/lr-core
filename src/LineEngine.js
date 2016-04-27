import Immo from './Immo.js'
import Immy from 'immy'

function notImplemented (method) {
  throw new TypeError(`${method.name} is not implemented`)
}

class Frame {
  constructor (state = new Map(), updates = [], grid = new Immy.Map(), collisions = new Immy.Map()) {
    Object.assign(this, {state, updates, grid, collisions})
  }
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
      let gridCell = this._getLastFrame().grid.get(cell)
      gridCell && (() => {
        for (let i = 0; i < gridCell.size(); i++) {
          let {index, entities} = gridCell.get(i)
          for (let entity of entities) {
            if (line.collidesWith(entity)) {
              this._setFramesLength(index)
              return
            }
          }
        }
      })()
    }
  }

  _removeLine (line) {
    this.linesMap.delete(line.id)
    this.grid.remove(line)
    let lineCollisions = this._getLastFrame().collisions.get(line.id)
    if (lineCollisions) {
      let firstIndexOfCollision = lineCollisions.get(0)
      this._setFramesLength(firstIndexOfCollision)
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
    let state = new Map(frame.state)
    let stateUpdates = []
    let {grid, collisions} = frame
    let applyStateUpdate = (stateUpdate) => {
      if (!stateUpdate) return
      stateUpdates.push(stateUpdate)
      for (let nextEntity of stateUpdate.updated) {
        state.set(nextEntity.id, nextEntity)
      }
    }
    let addToFrameGrid = (entity) => {
      let cells = this.grid.getCellsNearEntity(entity)
      for (let cell of cells) {
        let gridCell = grid.get(cell)
        if (!gridCell) {
          gridCell = new Immy.List([{index, entities: [entity]}])
        } else {
          let {index: lastIndex, entities} = gridCell.get(gridCell.size() - 1)
          if (index !== lastIndex) {
            entities = [entity]
            gridCell = gridCell.push({index, entities})
          } else {
            entities.push(entity)
          }
        }
        grid = grid.withKeySetToValue(cell, gridCell)
      }
    }
    let addToFrameCollisions = (line) => {
      let lineCollisions = collisions.get(line.id)
      if (!lineCollisions) {
        lineCollisions = new Immy.List([index])
      } else if (lineCollisions.get(lineCollisions.size() - 1) !== index) {
        lineCollisions = lineCollisions.push(index)
      } else {
        return
      }
      collisions = collisions.withKeySetToValue(line.id, lineCollisions)
    }

    applyStateUpdate(this.preIterate(state))
    for (let i = 0; i < this.iterations; i++) {
      for (let constraint of this.constraints) {
        applyStateUpdate(new ConstraintUpdate(constraint.resolve(state), constraint.id))
      }
      for (let id of this.collidables) {
        let entity = state.get(id)
        addToFrameGrid(entity)

        let lines = this.grid.getLinesNearEntity(entity)
        for (let line of lines) {
          let nextEntity = line.collide(entity)
          if (nextEntity) {
            applyStateUpdate(new CollisionUpdate(nextEntity, line.id))
            entity = nextEntity

            addToFrameGrid(entity)
            addToFrameCollisions(line)
          }
        }
      }
    }
    applyStateUpdate(this.postIterate(state))
    return new Frame(state, stateUpdates, grid, collisions)
  }
}

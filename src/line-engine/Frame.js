import Immy from 'immy'

class CellFrame {
  constructor (index, entity) {
    this.index = index
    this.entities = [entity]
  }
  add (entity) {
    this.entities.push(entity)
  }
  hasCollisionWith (line) {
    return this.entities.some((entity) => line.collidesWith(entity))
  }
}

function makeCellFrames (index, entity) {
  return new Immy.List([new CellFrame(index, entity)])
}

function addEntityToCellFrames (cellFrames, index, entity) {
  let cellFrame = cellFrames.get(cellFrames.size() - 1)
  if (index === cellFrame.index) {
    cellFrame.add(entity)
    return cellFrames
  } else {
    return cellFrames.push(new CellFrame(index, entity))
  }
}

export default class Frame {
  constructor (state = new Map(), grid = new Immy.Map(), collisions = new Immy.Map(), updates = []) {
    this.state = state
    this.grid = grid
    this.collisions = collisions
    this.updates = updates
  }

  clone () {
    return new Frame(new Map(this.state), this.grid, this.collisions)
  }

  getIndexOfCollisionInCell (cell, line) {
    if (!this.grid.has(cell)) return
    let cellFrames = this.grid.get(cell)
    for (let i = 0; i < cellFrames.size(); i++) {
      let cellFrame = cellFrames.get(i)
      if (cellFrame.hasCollisionWith(line)) {
        return cellFrame.index
      }
    }
  }

  getIndexOfCollisionWithLine (line) {
    let lineCollisions = this.collisions.get(line.id)
    if (lineCollisions) {
      return lineCollisions.get(0)
    }
  }

  updateState (stateUpdate) {
    if (!stateUpdate) return
    if (stateUpdate instanceof Array) {
      return stateUpdate.forEach((update) => this.updateState(update))
    }
    this.updates.push(stateUpdate)
    for (let nextEntity of stateUpdate.updated) {
      this.state.set(nextEntity.id, nextEntity)
    }
  }

  addToGrid (lineGrid, entity, index) {
    let cells = lineGrid.getCellsNearEntity(entity)
    for (let cell of cells) {
      let cellFrames = this.grid.get(cell)
      if (!cellFrames) {
        cellFrames = makeCellFrames(index, entity)
      } else {
        cellFrames = addEntityToCellFrames(cellFrames, index, entity)
      }
      this.grid = this.grid.withKeySetToValue(cell, cellFrames)
    }
  }

  addToCollisions (line, index) {
    let lineCollisions = this.collisions.get(line.id)
    if (!lineCollisions) {
      lineCollisions = new Immy.List([index])
    } else if (lineCollisions.get(lineCollisions.size() - 1) !== index) {
      lineCollisions = lineCollisions.push(index)
    } else {
      return
    }
    this.collisions = this.collisions.withKeySetToValue(line.id, lineCollisions)
  }
}

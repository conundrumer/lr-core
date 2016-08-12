import mori from 'mori'
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
  constructor (stateMap = new Map(), grid = mori.hashMap(), collisions = mori.hashMap(), updates = []) {
    this.stateMap = stateMap
    this.grid = grid
    this.collisions = collisions
    this.updates = updates
  }

  clone () {
    return new Frame(new Map(this.stateMap), this.grid, this.collisions)
  }

  getIndexOfCollisionInCell (cell, line) {
    let cellFrames = mori.get(this.grid, cell)
    if (!cellFrames) return
    for (let i = 0; i < cellFrames.size(); i++) {
      let cellFrame = cellFrames.get(i)
      if (cellFrame.hasCollisionWith(line)) {
        return cellFrame.index
      }
    }
  }

  getIndexOfCollisionWithLine (line) {
    let lineCollisions = mori.get(this.collisions, line.id)
    if (lineCollisions) {
      return lineCollisions.get(0)
    }
  }

  updateStateMap (stateUpdate) {
    if (!stateUpdate) return
    if (stateUpdate instanceof Array) {
      return stateUpdate.forEach((update) => this.updateStateMap(update))
    }
    this.updates.push(stateUpdate)
    for (let nextEntity of stateUpdate.updated) {
      this.stateMap.set(nextEntity.id, nextEntity)
    }
  }

  addToGrid (lineGrid, entity, index) {
    let cells = lineGrid.getCellsNearEntity(entity)
    for (let cell of cells) {
      let cellFrames = mori.get(this.grid, cell)
      if (!cellFrames) {
        cellFrames = makeCellFrames(index, entity)
      } else {
        cellFrames = addEntityToCellFrames(cellFrames, index, entity)
      }
      this.grid = mori.assoc(this.grid, cell, cellFrames)
    }
  }

  addToCollisions (line, index) {
    let lineCollisions = mori.get(this.collisions, line.id)
    if (!lineCollisions) {
      lineCollisions = new Immy.List([index])
    } else if (lineCollisions.get(lineCollisions.size() - 1) !== index) {
      lineCollisions = lineCollisions.push(index)
    } else {
      return
    }
    this.collisions = mori.assoc(this.collisions, line.id, lineCollisions)
  }
}


class Frame {
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
    let gridCell = this.grid.get(cell)
    for (let i = 0; i < gridCell.size(); i++) {
      let {index, entities} = gridCell.get(i)
      for (let entity of entities) {
        if (line.collidesWith(entity)) {
          return index
        }
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
    this.updates.push(stateUpdate)
    for (let nextEntity of stateUpdate.updated) {
      this.state.set(nextEntity.id, nextEntity)
    }
  }

  addToGrid (lineGrid, entity, index) {
    let cells = lineGrid.getCellsNearEntity(entity)
    for (let cell of cells) {
      let gridCell = this.grid.get(cell)
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
      this.grid = this.grid.withKeySetToValue(cell, gridCell)
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

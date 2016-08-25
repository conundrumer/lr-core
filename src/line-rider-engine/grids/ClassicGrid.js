import {classicCells as getCellsFromLine} from './getCellsFromLine.js'
import {hashIntPair} from '../../utils/hashNumberPair.js'
import {SubclassableMap} from '../../subclassable'
import OrderedObjectArray from '../../ordered-object-array'

const GRID_SIZE = 14

class LineCellsMap extends SubclassableMap {
  add (line, cells) {
    this.set(line.id, cells)
  }
  remove (line) {
    let cells = this.get(line.id)
    if (!cells) return []
    this.delete(line.id)
    return cells
  }
}

class CellLinesMap extends SubclassableMap {
  add (line, cells) {
    for (let cell of cells) {
      let cellLines = this.get(cell)
      if (!cellLines) {
        cellLines = new OrderedObjectArray('id', true)
        this.set(cell, cellLines)
      }
      cellLines.add(line)
    }
  }
  remove (line, cells) {
    for (let cell of cells) {
      let cellLines = this.get(cell)
      cellLines.remove(line)
      if (cellLines.length === 0) {
        this.delete(cell)
      }
    }
  }
}

// handles collidable lines in 6.2 physics
export default class ClassicGrid {

  constructor (getCellFn = getCellsFromLine) {
    this.getCellsFromLine = getCellFn
    this.lineCellsMap = new LineCellsMap()
    this.cellLinesMap = new CellLinesMap()
  }

  add (line) {
    if (!line.collidable) return []
    let cells = this.getCellsFromLine(line, GRID_SIZE)
    this.lineCellsMap.add(line, cells)
    this.cellLinesMap.add(line, cells)
    return cells
  }
  remove (line) {
    let cells = this.lineCellsMap.remove(line)
    this.cellLinesMap.remove(line, cells)
  }

  // 3x3 grid around entity
  getCellsNearEntity (entity) {
    let gx = Math.floor(entity.pos.x / GRID_SIZE)
    let gy = Math.floor(entity.pos.y / GRID_SIZE)
    let cells = []
    for (let i = -1; i <= 1; i++) {
      for (let j = -1; j <= 1; j++) {
        cells.push(hashIntPair(i + gx, j + gy))
      }
    }
    return cells
  }

  // the lines in the 3x3 grid around entity, with duplicates
  getLinesNearEntity (entity) {
    let lines = []
    let cells = this.getCellsNearEntity(entity)
    for (let cell of cells) {
      let cellLines = this.cellLinesMap.get(cell)
      if (!cellLines) continue
      for (let line of cellLines) {
        lines.push(line)
      }
    }
    return lines
  }
}

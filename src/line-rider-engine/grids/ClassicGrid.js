import sortedIndex from 'lodash/sortedIndex.js'

import {ddaCells as getCellsFromLine} from './getCellsFromLine.js'
import {hashIntPair} from '../../hashNumberPair.js'

const GRID_SIZE = 14

class OrderedLinesArray extends Array {
  constructor () {
    super()
    this._set = new Set()
  }
  getIndexOf (line) {
    return sortedIndex(this, line, l => -l.id)
  }
  has (line) {
    return this._set.has(line.id)
  }
  add (line) {
    if (!this.has(line)) {
      this._set.add(line.id)
      let index = this.getIndexOf(line)
      this.splice(index, 0, line)
    }
  }
  remove (line) {
    if (this.has(line)) {
      this._set.delete(line.id)
      let index = this.getIndexOf(line)
      this.splice(index, 1)
    }
  }
}

class LineCellsMap extends Map {
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

class CellLinesMap extends Map {
  add (line, cells) {
    for (let cell of cells) {
      let cellLines = this.get(cell)
      if (!cellLines) {
        cellLines = new OrderedLinesArray()
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

  constructor () {
    this.lineCellsMap = new LineCellsMap()
    this.cellLinesMap = new CellLinesMap()
  }

  add (line) {
    if (!line.collidable) return []
    let cells = getCellsFromLine(line, GRID_SIZE)
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

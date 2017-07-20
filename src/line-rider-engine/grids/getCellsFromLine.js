import {hashIntPair} from '../../utils/hashNumberPair.js'
import dda from '../../utils/dda.js'

export function ddaCells ({p1, p2}, gridSize) {
  return dda(p1.x / gridSize, p1.y / gridSize, p2.x / gridSize, p2.y / gridSize)
    .map(({x, y}) => hashIntPair(x, y))
}

// 6.2
export function classicCells (line, gridSize) {
  let cellsPos = ClassicCells.getCellsPos(line, gridSize)
  return cellsPos.map(({x, y}) => hashIntPair(x, y))
}

// 6.1
export function legacyCells (line, gridSize) {
  return LegacyCells.getCellsPos(line, gridSize).map(({x, y}) => hashIntPair(x, y))
}

class ClassicCells {
  static getCellsPos (line, gridSize) {
    var cellsPos = []

    let cellPosStart = getCellPosAndOffset(line.p1.x, line.p1.y, gridSize)
    let cellPosEnd = getCellPosAndOffset(line.p2.x, line.p2.y, gridSize)

    cellsPos.push(cellPosStart)
    if (line.c.vec.x === 0 && line.c.vec.y === 0 || cellPosStart.x === cellPosEnd.x && cellPosStart.y === cellPosEnd.y) {
      return cellsPos // done
    }

    let box = getBox(cellPosStart.x, cellPosStart.y, cellPosEnd.x, cellPosEnd.y)

    let getNextPos

    if (line.c.vec.x === 0) {
      getNextPos = (l, x, y, dx, dy) => { return { x: x, y: y + dy } }
    } else if (line.c.vec.y === 0) {
      getNextPos = (l, x, y, dx, dy) => { return { x: x + dx, y: y } }
    } else {
      getNextPos = this.getNextPos
    }

    let cellPos = cellPosStart
    let pos = { x: line.p1.x, y: line.p1.y }

    while (cellPos != null) {
      let d = this.getDelta(line, cellPos, gridSize)

      let nextPos = getNextPos(line, pos.x, pos.y, d.x, d.y)
      let nextCellPos = getCellPosAndOffset(nextPos.x, nextPos.y, gridSize)
      if (nextCellPos.x === cellPos.x && nextCellPos.y === cellPos.y) {
        // 6.1 grid screws up on rare occasions
        // this would crash the flash version, so it's undefined and we'll just bail
        break
      }

      if (inBounds(nextCellPos, box)) {
        cellsPos.push(nextCellPos)
        cellPos = nextCellPos
        pos = nextPos
      } else {
        cellPos = null
      }
    }

    return cellsPos
  }

  static getNextPos (line, x, y, dx, dy) {
    let slope = line.c.vec.y / line.c.vec.x
    let yNext = y + slope * dx
    if (Math.abs(yNext - y) < Math.abs(dy)) {
      return {
        x: x + dx,
        y: yNext
      }
    }
    if (Math.abs(yNext - y) === Math.abs(dy)) {
      return {
        x: x + dx,
        y: y + dy
      }
    }
    return {
      x: x + line.c.vec.x * dy / line.c.vec.y,
      y: y + dy
    }
  }

  static getDelta (line, cellPos, gridSize) {
    let dx, dy
    if (cellPos.x < 0) {
      dx = (gridSize + cellPos.gx) * (line.c.vec.x > 0 ? 1 : -1)
    } else {
      dx = -cellPos.gx + (line.c.vec.x > 0 ? gridSize : -1)
    }
    if (cellPos.y < 0) {
      dy = (gridSize + cellPos.gy) * (line.c.vec.y > 0 ? 1 : -1)
    } else {
      dy = -cellPos.gy + (line.c.vec.y > 0 ? gridSize : -1)
    }
    return { x: dx, y: dy }
  }
}

class LegacyCells extends ClassicCells {
  static getDelta (line, cellPos, gridSize) {
    return {
      x: -cellPos.gx + (line.c.vec.x > 0 ? gridSize : -1),
      y: -cellPos.gy + (line.c.vec.y > 0 ? gridSize : -1)
    }
  }

  static getNextPos (line, x, y, dx, dy) {
    let slope = line.c.vec.y / line.c.vec.x
    let yIsThisBelowActualY0 = line.p1.y - slope * line.p1.x
    let yDoesThisEvenWork = Math.round(slope * (x + dx) + yIsThisBelowActualY0)
    if (Math.abs(yDoesThisEvenWork - y) < Math.abs(dy)) {
      return {
        x: x + dx,
        y: yDoesThisEvenWork
      }
    }
    if (Math.abs(yDoesThisEvenWork - y) === Math.abs(dy)) {
      return {
        x: x + dx,
        y: y + dy
      }
    }
    return {
      x: Math.round((y + dy - yIsThisBelowActualY0) / slope),
      y: y + dy
    }
  }

}

function getCellPosAndOffset (px, py, gridSize) {
  let {x, y} = getCellPos(px, py, gridSize)
  return {
    x: x,
    y: y,
    gx: px - gridSize * x,
    gy: py - gridSize * y
  }
}

function getCellPos (x, y, gridSize) {
  return {
    x: getCellCor(x, gridSize),
    y: getCellCor(y, gridSize)
  }
}

function getCellCor (x, gridSize) {
  return Math.floor(x / gridSize)
}

function getBox (x1, y1, x2, y2) {
  let left = Math.min(x1, x2)
  let right = Math.max(x1, x2)
  let top = Math.min(y1, y2)
  let bottom = Math.max(y1, y2)

  return {
    left: left,
    right: right,
    top: top,
    bottom: bottom,
    corners: [
      [left, top], [left, bottom], [right, top], [right, bottom]
    ].map(c => { return {x: c[0], y: c[1]} })
  }
}

function inBounds (p, box) {
  return p.x >= box.left && p.x <= box.right && p.y >= box.top && p.y <= box.bottom
}

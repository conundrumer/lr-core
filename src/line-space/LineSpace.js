import OrderedObjectArray from '../ordered-object-array.js'
import {lineInBox, pointLineDistanceSquared} from '../G2.js'

export default class LineSpace {
  constructor (getLineCoordinates) {
    this.getLineCoordinates = getLineCoordinates
    this.lines = new OrderedObjectArray('id')
  }

  addLine (line) {
    this.lines.add(line)
  }
  removeLine (line) {
    this.lines.remove(line)
  }

  selectLinesInBox (x0, y0, x1, y1) {
    return this.lines.filter(line =>
      lineInBox(...this.getLineCoordinates(line), x0, y0, x1, y1)
    )
  }

  selectLinesInRadius ({x, y}, r) {
    return this.lines.filter(line =>
      pointLineDistanceSquared(x, y, ...this.getLineCoordinates(line)) < (r * r)
    )
  }

  selectClosestLineInRadius ({x, y}, r) {
    let closestLine = null
    let closestLineDistanceSquared = r * r
    for (let line of this.lines) {
      let lineDistanceSquared = pointLineDistanceSquared(x, y, ...this.getLineCoordinates(line))
      if (lineDistanceSquared < closestLineDistanceSquared) {
        closestLine = line
        closestLineDistanceSquared = lineDistanceSquared
      }
    }
    return closestLine
  }

  getBoundingBox () {
    if (this.lines.length === 0) {
      return [0, 0, 0, 0]
    }
    // left top right bottom
    let bb = [
      Number.MAX_VALUE,
      Number.MAX_VALUE,
      Number.MIN_VALUE,
      Number.MIN_VALUE
    ]
    const setNextBoundingBox = (x, y) => {
      if (x < bb[0]) {
        bb[0] = x
      }
      if (y < bb[1]) {
        bb[1] = y
      }
      if (x > bb[2]) {
        bb[2] = x
      }
      if (y > bb[3]) {
        bb[3] = y
      }
    }
    for (let line of this.lines) {
      let [x0, y0, x1, y1] = this.getLineCoordinates(line)
      setNextBoundingBox(x0, y0)
      setNextBoundingBox(x1, y1)
    }
    return bb
  }
}

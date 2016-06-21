import Line from './Line.js'
import LineTypes from './LineTypes.js'

export default class SolidLine extends Line {
  constructor (data) {
    super(data)
  }

  get type () {
    return LineTypes.SCENERY
  }
}

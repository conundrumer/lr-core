import LineTypes from './LineTypes.js'
import SolidLine from './SolidLine.js'

export {default as LineTypes} from './LineTypes.js'
export function createLineFromJson (data) {
  switch (data.type) {
    case undefined:
      throw new TypeError(`Line JSON requires type: ${data.toString()}`)
    case LineTypes.SOLID:
      return new SolidLine(data)
    case LineTypes.ACC:
      throw new Error('not implemented')
      // return new Line(data)
    case LineTypes.SCENERY:
      throw new Error('not implemented')
      // return new Line(data)
    default:
      console.warn(`Line JSON has unknown type, creating as scenery line: ${data.toString()}`)
      // return new Line(data)
  }
}


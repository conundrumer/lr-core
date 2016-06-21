import LineTypes from './LineTypes.js'
import SolidLine from './SolidLine.js'
import AccLine from './AccLine.js'
import SceneryLine from './SceneryLine.js'

export {default as LineTypes} from './LineTypes.js'
export function createLineFromJson (data) {
  switch (data.type) {
    case undefined:
      throw new TypeError(`Line JSON requires type: ${data.toString()}`)
    case LineTypes.SOLID:
      return new SolidLine(data)
    case LineTypes.ACC:
      return new AccLine(data)
    case LineTypes.SCENERY:
      return new SceneryLine(data)
    default:
      console.warn(`Line JSON has unknown type, creating as scenery line: ${data.toString()}`)
      // return new Line(data)
  }
}


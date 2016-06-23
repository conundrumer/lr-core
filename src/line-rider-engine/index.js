export {default} from './LineRiderEngine.js'
export {createLineFromJson, LineTypes} from './lines'

import LineRiderEngine from './LineRiderEngine.js'
import {legacyCells} from './grids/getCellsFromLine.js'

export class CustomLineRiderEngine {
  constructor ({legacy}) {
    class CustomLineRiderEngine extends LineRiderEngine {
      makeGrid () {
        if (legacy) {
          return super.makeGrid(legacyCells)
        } else {
          return super.makeGrid()
        }
      }
    }
    return new CustomLineRiderEngine()
  }
}


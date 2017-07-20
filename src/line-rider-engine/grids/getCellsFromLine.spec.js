import test from 'tape'

import {createLineFromJson} from '../lines'
import {legacyCells} from './getCellsFromLine'

const GRID_SIZE = 14

test('getCellsFromLine', t => {
  t.test('6.1 grid infinite loop bug is handled', t => {
    let line = { x1: -0.49002481222, x2: 1.5430943695, y1: 12029.431598, y2: 12041.208530, type: 0, id: 0 }
    let cells = legacyCells(createLineFromJson(line), GRID_SIZE)
    t.pass('legacyCells returns')
    t.end()
  })
})

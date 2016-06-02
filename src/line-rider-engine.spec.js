import test from 'tape'

import LineRiderEngine, {createLineFromJson} from './line-rider-engine'

test('LineRiderEngine', (t) => {
  t.test('simulation with no lines', (t) => {
    let engine = new LineRiderEngine()

    let rider0 = engine.getRider(0).position
    let rider1 = engine.getRider(1).position

    t.ok(rider1.x > rider0.x, 'rider should have increased x')
    t.ok(rider1.y > rider0.y, 'rider should have increased y')

    t.end()
  })

  t.test('simulation with one line', (t) => {
    const Y = 5
    const LINE = {id: 0, type: 0, x1: 0, y1: 5, x2: 30, y2: 5}
    const INDEX = 11

    let engine = new LineRiderEngine()

    let engineWithLine = engine.addLine(createLineFromJson(LINE))

    let riderFalling = engine.getRider(INDEX).position
    let riderColliding = engineWithLine.getRider(INDEX).position

    t.ok(riderColliding.y < riderFalling.y, 'rider should have collided with line')
    t.ok(riderColliding.y < Y - 0.01, 'rider should not have been flattened')

    t.end()
  })
})

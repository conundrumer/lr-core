import test from 'tape'

import LineRiderEngine from './line-rider-engine'

test('LineRiderEngine', (t) => {
  t.test('simulation with no lines', (t) => {
    let engine = new LineRiderEngine()

    let rider0 = engine.getRider(0)
    let rider1 = engine.getRider(1)

    t.ok(rider1.position.x > rider0.position.x, 'rider should have increased x')
    t.ok(rider1.position.y > rider0.position.y, 'rider should have increased y')

    t.end()
  })
})

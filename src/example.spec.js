import test from 'tape'

import example, {baz} from './example.js'

test('example code', t => {
  t.plan(2)

  t.equal(example, 'bar')
  t.equal(baz, 42)
})

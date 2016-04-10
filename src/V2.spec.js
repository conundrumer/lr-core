import test from 'tape'

import V2, * as V2Fn from './V2.js'

let v1 = {x: 1, y: 2}
let v2 = {x: -2, y: 1}

let almostEq = (a, b) => Math.abs(a - b) < 1e-9

test('V2 wrapper', t => {
  let v = V2(v1)

  t.equal(v.x, v1.x)
  t.equal(v.y, v1.y)

  let u = V2(v1)
  u.x = 0
  t.notEqual(v.x, u.x)

  t.end()
})

let scalarResults = {
  len: Math.sqrt(5),
  lenSq: 5,
  angle: Math.atan2(2, 1),
  angleTo: Math.PI / 2,
  dist: Math.sqrt(10),
  distSq: 10,
  dot: 0,
  cross: 5,
  equals: false
}
for (let fn in scalarResults) {
  let expected = scalarResults[fn]
  test(fn, t => {
    t.equal(V2[fn], V2Fn[fn])

    let actual = V2[fn](v1, v2)
    t.assert(almostEq(actual, expected))
    t.equal(actual, V2(v1)[fn](v2))

    t.end()
  })
}

let vectorResults = {
  add: [v2, {x: -1, y: 3}],
  sub: [v2, {x: 3, y: 1}],
  mul: [2, {x: 2, y: 4}],
  div: [2, {x: 0.5, y: 1}],
  norm: [null, {x: 1 / Math.sqrt(5), y: 2 / Math.sqrt(5)}],
  rot: [Math.PI / 2, {x: -2, y: 1}],
  rotCW: [null, {x: -2, y: 1}],
  rotCCW: [null, {x: 2, y: -1}]
}
for (let fn in vectorResults) {
  let [arg, expected] = vectorResults[fn]

  test(fn, t => {
    let actual = V2(v1)[fn](arg)
    t.assert(almostEq(actual.x, expected.x))
    t.assert(almostEq(actual.y, expected.y))

    t.end()
  })
}

test('V2 equals', t => {
  let v = V2(v1)

  t.assert(v.equals(v1))
  t.end()
})

test('V2 chainable', t => {
  t.assert(V2(v1).mul(2).div(2).equals(v1))
  t.end()
})

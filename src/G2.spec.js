import test from 'tape'

import * as G2 from './G2.js'

// let almostEq = (a, b) => Math.abs(a - b) < 1e-9

const generateTransformations = (params, N = 7) => {
  let ps = [params]
  ps = [...ps, ...ps.map(([x0, y0, x1, y1, x2, y2, x3, y3]) => [y0, x0, y1, x1, y2, x2, y3, x3])]
  ps = [...ps, ...ps.map(([x0, y0, x1, y1, x2, y2, x3, y3]) => [x1, y1, x0, y0, x3, y3, x2, y2])]
  ps = [...ps, ...ps.map(([x0, y0, x1, y1, x2, y2, x3, y3]) => [N - x0, y0, N - x1, y1, N - x2, y2, N - x3, y3])]
  ps = [...ps, ...ps.map(([x0, y0, x1, y1, x2, y2, x3, y3]) => [x0, N - y0, x1, N - y1, x2, N - y2, x3, N - y3])]
  return ps
}

test('lineLineIntersection', t => {
  let testCases = [{
    name: '+',
    // ----- x0 y0 x1 y1 x2 y2 x3 y3
    params: [0, 1, 2, 1, 1, 0, 1, 2],
    expected: 0.5
  }, {
    name: 'x',
    params: [0, 0, 1, 1, 0, 1, 1, 0],
    expected: 0.5
  }, {
    name: 'T',
    params: [2, 2, 0, 2, 1, 2, 1, 0],
    expected: null,
    inclusive: 0.5
  }, {
    name: 'y',
    params: [0, 2, 1, 1, 0, 0, 2, 2],
    expected: null,
    inclusive: [1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0]
  }, {
    name: 'L',
    params: [0, 0, 1, 0, 0, 0, 0, 1],
    expected: null,
    inclusive: [0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1]
  }, {
    name: 'v',
    params: [0, 1, 1, 0, 1, 0, 2, 1],
    expected: null,
    inclusive: [1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0]
  }, {
    name: '||',
    params: [0, 0, 0, 1, 1, 0, 1, 1],
    expected: null
  }, {
    name: '/|',
    params: [0, 0, 1, 1, 2, 1, 2, 0],
    expected: null
  }, {
    name: 'collinear',
    params: [0, 0, 2, 0, 1, 0, 3, 0],
    expected: null,
    inclusive: true
  }]

  for (let {name, params, expected, inclusive} of testCases) {
    let ps = generateTransformations(params)
    t.test(name, t => {
      ps.forEach((params, i) => {
        let a = expected instanceof Array ? expected[i] : expected
        t.equals(G2.lineLineIntersection(...params), a, `[${params.join(', ')}]`)
      })
      if (inclusive != null) {
        ps.forEach((params, i) => {
          let a = inclusive instanceof Array ? inclusive[i] : inclusive
          params = [...params, true]
          t.equals(G2.lineLineIntersection(...params), a, `[${params.join(', ')}]`)
        })
      }
      t.end()
    })
  }

  t.end()
})

/*
  0 1 2 3 4 5 6 7
0 • • • • • • • •
1 • • • • • • • •
2 • • ┏━━━━━┓ • •
3 • • ┃ • • ┃ • •
4 • • ┃ • • ┃ • •
5 • • ┗━━━━━┛ • •
6 • • • • • • • •
7 • • • • • • • •
*/
test('lineInBox', t => {
  let testCases = [{
    name: 'completely inside',
    params: [3, 3, 4, 3, 2, 2, 5, 5],
    expected: true
  }, {
    name: 'one point inside, horizontal',
    params: [1, 3, 3, 4, 2, 2, 5, 5],
    expected: true
  }, {
    name: 'one point inside, diagonal',
    params: [0, 1, 4, 3, 2, 2, 5, 5],
    expected: true
  }, {
    name: 'one point on the edge',
    params: [0, 1, 3, 2, 2, 2, 5, 5],
    expected: false,
    inclusive: true
  }, {
    name: 'one point on the corner',
    params: [0, 1, 2, 2, 2, 2, 5, 5],
    expected: false,
    inclusive: true
  }, {
    name: 'horizontal',
    params: [0, 3, 6, 4, 2, 2, 5, 5],
    expected: true
  }, {
    name: 'big diagonal',
    params: [1, 1, 7, 6, 2, 2, 5, 5],
    expected: true
  }, {
    name: 'small diagonal',
    params: [4, 1, 6, 4, 2, 2, 5, 5],
    expected: true
  }, {
    name: 'medium diagonal',
    params: [4, 1, 6, 7, 2, 2, 5, 5],
    expected: true
  }, {
    name: 'corner diagonal',
    params: [4, 0, 6, 4, 2, 2, 5, 5],
    expected: false,
    inclusive: true
  }, {
    name: 'outside diagonal',
    params: [0, 3, 4, 0, 2, 2, 5, 5],
    expected: false
  }, {
    name: 'outside',
    params: [3, 0, 3, 1, 2, 2, 5, 5],
    expected: false
  }]

  for (let {name, params, expected, inclusive} of testCases) {
    let ps = generateTransformations(params)
    t.test(name, t => {
      for (let params of ps) {
        t.equals(G2.lineInBox(...params), expected, `[${params.join(', ')}]`)
      }
      if (inclusive != null) {
        for (let params of ps) {
          params = [...params, true]
          t.equals(G2.lineInBox(...params), inclusive, `[${params.join(', ')}]`)
        }
      }
      t.end()
    })
  }

  t.end()
})

/*
  0 1 2 3 4 5 6 7
0 • • • • • • X •
1 • • • • • • • •
2 • • • • • • • •
3 • • • • • • • •
4 • • • * • • • •
5 • • • • • • • •
6 • • • • • • • •
7 • • • • • • • O
8 X • • • • • • •
*/
test('pointLineDistance', t => {
  let testCases = [{
    name: 'collinear',
    params: [0, 0, 1, 0, 3, 0],
    expected: 1
  }, {
    name: 'perpendicular endpoint',
    params: [1, 1, 3, 0, 1, 0],
    expected: 1
  }, {
    name: 'perpendicular midpoint',
    params: [2, 1, 1, 0, 3, 0],
    expected: 1
  }, {
    name: 'on point',
    params: [1, 0, 1, 0, 3, 0],
    expected: 0
  }, {
    name: 'on other point',
    params: [3, 0, 1, 0, 3, 0],
    expected: 0
  }, {
    name: 'on line',
    params: [2, 0, 1, 0, 3, 0],
    expected: 0
  }, {
    name: 'diagonal',
    params: [7, 7, 6, 0, 0, 8],
    expected: 5
  }, {
    name: 'diagonal flipped',
    params: [7, 7, 0, 8, 6, 0],
    expected: 5
  }]

  for (let {name, params, expected} of testCases) {
    t.equals(G2.pointLineDistance(...params), expected, `[${params.join(', ')}] ${name}`)
  }

  t.end()
})

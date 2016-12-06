import test from 'tape'

import LineSpace from './line-space'

/*
  0 1 2 3 4
0 X • • • •
1 • • • • •
2 • • • • •
3 • • • • 1
4 • • • 2 •
*/
test('LineSpace', t => {
  const LINE_1 = {id: 1, x1: 0, y1: 0, x2: 4, y2: 3}
  const LINE_2 = {id: 2, x1: 0, y1: 0, x2: 3, y2: 4}
  let space = new LineSpace(({x1, y1, x2, y2}) => [x1, y1, x2, y2])

  const tester = ({method, params = [], expected}) => {
    let result = space[method](...params)
    if (expected instanceof Array) {
      // convert SubclassableArray to Array
      result = Array.from(result)
    }
    t.deepEquals(result, expected, `${method}: ${JSON.stringify(params)}`)
  }

  t.comment('0 lines')
  ;[{
    method: 'selectLinesInBox',
    params: [0, 0, 1, 1],
    expected: []
  }, {
    method: 'selectLinesInRadius',
    params: [{x: 0, y: 0}, 1],
    expected: []
  }, {
    method: 'selectClosestLineInRadius',
    params: [{x: 0, y: 0}, 1],
    expected: null
  }, {
    method: 'getBoundingBox',
    expected: [0, 0, 0, 0]
  }].forEach(tester)

  t.comment('1 line')
  space.addLine(LINE_1)
  ;[{
    method: 'selectLinesInBox',
    params: [0, 0, 1, 1],
    expected: [LINE_1]
  }, {
    method: 'selectLinesInBox',
    params: [3, 0, 4, 1],
    expected: []
  }, {
    method: 'selectLinesInRadius',
    params: [{x: 0, y: 0}, 1],
    expected: [LINE_1]
  }, {
    method: 'selectLinesInRadius',
    params: [{x: 4, y: 0}, 1],
    expected: []
  }, {
    method: 'selectClosestLineInRadius',
    params: [{x: 0, y: 0}, 1],
    expected: LINE_1
  }, {
    method: 'selectClosestLineInRadius',
    params: [{x: 4, y: 0}, 1],
    expected: null
  }, {
    method: 'getBoundingBox',
    expected: [0, 0, 4, 3]
  }].forEach(tester)

  t.comment('2 lines')
  space.addLine(LINE_2)
  ;[{
    method: 'selectLinesInBox',
    params: [0, 0, 1, 1],
    expected: [LINE_1, LINE_2]
  }, {
    method: 'selectLinesInBox',
    params: [3, 3, 4, 2],
    expected: [LINE_1]
  }, {
    method: 'selectLinesInBox',
    params: [3, 3, 2, 4],
    expected: [LINE_2]
  }, {
    method: 'selectLinesInRadius',
    params: [{x: 0, y: 0}, 1],
    expected: [LINE_1, LINE_2]
  }, {
    method: 'selectLinesInRadius',
    params: [{x: 4, y: 3}, 1],
    expected: [LINE_1]
  }, {
    method: 'selectLinesInRadius',
    params: [{x: 3, y: 4}, 1],
    expected: [LINE_2]
  }, {
    method: 'selectClosestLineInRadius',
    params: [{x: 1, y: 0}, 1],
    expected: LINE_1
  }, {
    method: 'selectClosestLineInRadius',
    params: [{x: 0, y: 1}, 1],
    expected: LINE_2
  }, {
    method: 'getBoundingBox',
    expected: [0, 0, 4, 4]
  }].forEach(tester)

  t.comment('1 line (one line removed)')
  space.removeLine(LINE_1)
  ;[{
    method: 'selectLinesInBox',
    params: [0, 0, 1, 1],
    expected: [LINE_2]
  }, {
    method: 'selectLinesInBox',
    params: [3, 3, 4, 2],
    expected: []
  }, {
    method: 'selectLinesInBox',
    params: [3, 3, 2, 4],
    expected: [LINE_2]
  }, {
    method: 'selectLinesInRadius',
    params: [{x: 0, y: 0}, 1],
    expected: [LINE_2]
  }, {
    method: 'selectLinesInRadius',
    params: [{x: 4, y: 3}, 1],
    expected: []
  }, {
    method: 'selectLinesInRadius',
    params: [{x: 3, y: 4}, 1],
    expected: [LINE_2]
  }, {
    method: 'selectClosestLineInRadius',
    params: [{x: 4, y: 0}, 1],
    expected: null
  }, {
    method: 'selectClosestLineInRadius',
    params: [{x: 0, y: 1}, 1],
    expected: LINE_2
  }, {
    method: 'getBoundingBox',
    expected: [0, 0, 3, 4]
  }].forEach(tester)

  // test liss
  t.end()
})

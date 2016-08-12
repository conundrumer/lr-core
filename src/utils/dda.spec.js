import test from 'tape'

import dda from './dda.js'

test('dda (digital differential analyzer)', t => {
  let testCases = [{
    name: 'origin',
    params: [0, 0, 0, 0],
    expected: [{x: 0, y: 0}]
  }, {
    name: '1 pixel',
    params: [0.1, 0.1, 0.9, 0.9],
    expected: [{x: 0, y: 0}]
  }, {
    name: 'horizontal',
    params: [0, 0, 2, 0],
    expected: [{x: 0, y: 0}, {x: 1, y: 0}, {x: 2, y: 0}]
  }, {
    name: 'vertical',
    params: [0, 0, 0, 2],
    expected: [{x: 0, y: 0}, {x: 0, y: 1}, {x: 0, y: 2}]
  }, {
    name: '45 degrees',
    params: [0, 0, 1, 1],
    expected: [{x: 0, y: 0}, {x: 0, y: 1}, {x: 1, y: 1}]
  }, {
    name: 'shallow',
    params: [0.5, 0.5, 2.5, 1.5],
    expected: [{x: 0, y: 0}, {x: 1, y: 0}, {x: 1, y: 1}, {x: 2, y: 1}]
  }, {
    name: 'shallow backwards',
    params: [2.5, 1.5, 0.5, 0.5],
    expected: [{x: 0, y: 0}, {x: 1, y: 0}, {x: 1, y: 1}, {x: 2, y: 1}]
  }, {
    name: 'steep',
    params: [0.5, 0.5, 1.5, 2.5],
    expected: [{x: 0, y: 0}, {x: 0, y: 1}, {x: 1, y: 1}, {x: 1, y: 2}]
  }, {
    name: 'steep backwards',
    params: [1.5, 2.5, 0.5, 0.5],
    expected: [{x: 0, y: 0}, {x: 0, y: 1}, {x: 1, y: 1}, {x: 1, y: 2}]
  }, {
    name: 'vertical edge case 1',
    params: [0.9, 0.1, 2.9, 2.1],
    expected: [{x: 0, y: 0}, {x: 1, y: 0}, {x: 1, y: 1}, {x: 2, y: 1}, {x: 2, y: 2}]
  }, {
    name: 'vertical edge case 2',
    params: [0.1, 0.9, 2.1, 2.9],
    expected: [{x: 0, y: 0}, {x: 0, y: 1}, {x: 1, y: 1}, {x: 1, y: 2}, {x: 2, y: 2}]
  }]

  for (let {name, params, expected} of testCases) {
    t.deepEquals(dda(...params), expected, name)
  }

  t.end()
})

import test from 'tape'

import LineEngine from './line-engine'

class SimpleState {
  constructor ({id, x, y, collidable = false}) {
    Object.assign(this, {id, x, y, collidable})
  }
  clone () {
    return new SimpleState(this)
  }
  get steppable () {
    return true
  }
  step () {
    let next = this.clone()
    next.y += 1
    return next
  }
}

class SimpleLine {
  constructor (id, x0, x1, y) {
    Object.assign(this, {id, x0, x1, y})
  }

  collidesWith ({x, y}) {
    return this.x0 <= x && x <= this.x1 && y === this.y
  }

  collide (entity) {
    if (this.collidesWith(entity)) {
      entity = entity.clone()
      entity.y -= 1
      return entity
    } else {
    }
    return null
  }
}

class SimpleConstraint {
  get iterating () {
    return true
  }
  constructor (id, p1, p2) {
    Object.assign(this, {id, p1, p2})
  }

  resolve (stateMap) {
    let p1 = stateMap.get(this.p1)
    let p2 = stateMap.get(this.p2)
    if (!p1 || !p2) return []
    p1 = p1.clone()
    p2 = p2.clone()
    let y = Math.min(p1.y, p2.y)
    p1.y = y
    p2.y = y
    return [p1, p2]
  }
}

class NoGrid {
  constructor () {
    this.lines = new Set()
  }
  add (line) {
    this.lines.add(line)
    return [0]
  }
  remove (line) {
    this.lines.delete(line)
  }
  getLinesNearEntity (entity) {
    return Array.from(this.lines)
  }
  getCellsNearEntity (entity) {
    return [0]
  }
}

class SimpleGrid {
  constructor () {
    this.grid = new Map()
  }
  toCell (x, y) {
    return `${x}_${y}`
  }
  getCellsFromLine (line) {
    let cells = []
    for (let x = line.x0; x <= line.x1; x++) {
      cells.push(this.toCell(x, line.y))
    }
    return cells
  }
  add (line) {
    let cells = this.getCellsFromLine(line)
    for (let cell of cells) {
      let gridCell = this.grid.get(cell)
      if (!gridCell) {
        gridCell = new Set()
        this.grid.set(cell, gridCell)
      }
      gridCell.add(line)
    }
    return cells
  }
  remove (line) {
    let cells = this.getCellsFromLine(line)
    for (let cell of cells) {
      let gridCell = this.grid.get(cell)
      gridCell && gridCell.delete(line)
    }
  }
  getLinesNearEntity ({x, y}) {
    let cells = this.getCellsNearEntity({x, y})
    return new Set(cells.map((cell) => this.grid.get(cell))
      .reduce((lines = [], gridCell = []) => [...lines, ...gridCell])
    )
  }
  getCellsNearEntity ({x, y}) {
    return [this.toCell(x, y)]
  }
}

class ExpandedGrid extends SimpleGrid {
  getCellsNearEntity ({x, y}) {
    return [this.toCell(x, y), this.toCell(x, y + 1)]
  }
}

/**
 * SimpleEngine:
 * - pixel engine with gravity and horizontal lines
 * - points can either move down or collide with line
 */
class SimpleEngine extends LineEngine {
  constructor () {
    super({props: {iterations: 2}})
  }

  makeGrid () {
    return new NoGrid()
  }
}

// function logUpdates (engine, i) {
//   let updates = engine.getUpdatesAtFrame(i)
//   updates = updates.map((update) => Object.assign({type: update.type}, update))
//   console.log(`updates: ${JSON.stringify(updates, null, 2)}`)
// }

test('SimpleEngine', (t) => {
  /*
   01234
  0
  1
  2 -  -
  3---
  4 ----
   */
  let lines = [
    [1, 1, 2],
    [4, 4, 2],
    [1, 4, 4],
    [0, 2, 3]
  ].map(([x0, x1, y], id) => new SimpleLine(id, x0, x1, y))

  t.test('line editing', (t) => {
    let engine = new SimpleEngine()

    t.test('adding a line', (t) => {
      engine = engine.addLine(lines[0])
      t.equal(engine.getLineByID(0), lines[0])

      t.end()
    })

    t.test('adding lines', (t) => {
      let [, ...linesToAdd] = lines
      engine = engine.addLine(linesToAdd)

      lines.forEach((line) => {
        t.equal(engine.getLineByID(line.id), line)
      })

      t.end()
    })

    t.test('removing a line', (t) => {
      engine = engine.removeLine(lines[0])

      t.equal(engine.getLineByID(0), undefined)

      t.end()
    })

    t.test('removing lines', (t) => {
      let [, ...linesToRemove] = lines
      engine = engine.removeLine(linesToRemove)

      lines.forEach((line) => {
        t.equal(engine.getLineByID(line.id), undefined)
      })

      t.end()
    })

    t.end()
  })

  t.test('immutable line editing', (t) => {
    let engine = new SimpleEngine()
    let [, ...linesToAdd] = lines
    let [, ...linesToRemove] = lines

    let engine1 = engine.addLine(lines[0])
    let engine2 = engine1.addLine(linesToAdd)
    let engine3 = engine2.removeLine(lines[0])
    let engine4 = engine3.removeLine(linesToRemove)

    let engine5 = engine2.removeLine(lines[1])

    t.test('adding a line', (t) => {
      t.equal(engine1.getLineByID(0), lines[0])
      t.end()
    })

    t.test('removing a line', (t) => {
      t.equal(engine3.getLineByID(0), undefined)
      t.end()
    })

    t.test('adding lines', (t) => {
      lines.forEach((line) => {
        t.equal(engine2.getLineByID(line.id), line)
      })
      t.end()
    })

    t.test('removing lines', (t) => {
      lines.forEach((line) => {
        t.equal(engine4.getLineByID(line.id), undefined)
      })
      t.end()
    })

    t.test('removing a line from a previous version', (t) => {
      t.equal(engine5.getLineByID(1), undefined)
      t.end()
    })

    t.end()
  })

  t.test('simulation', (t) => {
    function testStateSimulation (t, lines, {
      collidables = [],
      states: testStates,
      constraints: testConstraints = []
    }) {
      testStates = testStates.map((states) => states.map(([x, y], id) => (
        new SimpleState({id, x, y, collidable: collidables[id]})
      )))
      testConstraints = testConstraints.map(([p1, p2], id) => new SimpleConstraint(id, p1, p2))

      let engine = new SimpleEngine()
        .setConstraints(testConstraints)
        .addLine(lines)

      t.test('setting init', (t) => {
        engine = engine.setInitialStates(testStates[0])

        let stateMap = engine.getStateMapAtFrame(0)

        testStates[0].forEach((point) => {
          t.deepEqual(stateMap.get(point.id), point)
        })

        t.end()
      })

      t.test('stepping', (t) => {
        for (let i = 1; i < testStates.length; i++) {
          let stateMap = engine.getStateMapAtFrame(i)
          // logUpdates(engine, i)

          t.comment(`state ${i}`)
          testStates[i].forEach((point) => {
            t.comment(`point ${point.id}`)
            t.deepEqual(stateMap.get(point.id), point)
          })
        }

        t.end()
      })
    }

    t.test('falling entities', (t) => {
      testStateSimulation(t, [], {
        states: [[
          [1, 0], [2, 1], [3, 0]
        ], [
          [1, 1], [2, 2], [3, 1]
        ], [
          [1, 2], [2, 3], [3, 2]
        ], [
          [1, 3], [2, 4], [3, 3]
        ], [
          [1, 4], [2, 5], [3, 4]
        ]]
      })

      t.end()
    })

    t.test('colliding entities', (t) => {
      /*
       01234
      0 • •
      1  o
      2 -  -
      3---
      4 ----
       */
      testStateSimulation(t, lines, {
        collidables: [
          true, false, true
        ],
        states: [[
          [1, 0], [2, 1], [3, 0]
        ], [
          [1, 1], [2, 2], [3, 1]
        ], [
          [1, 1], [2, 3], [3, 2]
        ], [
          [1, 1], [2, 4], [3, 3]
        ], [
          [1, 1], [2, 5], [3, 3]
        ]]
      })

      t.end()
    })

    t.test('constrainted entities', (t) => {
      /*
       01234
      0   <>
      1
      2 -  -
      3---
      4 ----
       */
      testStateSimulation(t, lines, {
        collidables: [
          true, true
        ],
        states: [[
          [4, 0], [3, 0]
        ], [
          [4, 1], [3, 1]
        ], [
          [4, 1], [3, 1]
        ]],
        constraints: [
          [0, 1]
        ]
      })

      t.end()
    })
    t.end()
  })

  t.test('recomputation', (t) => {
    function testRecomputation (t, Engine) {
      /*
      0    1    2    3    4
       01   01   01   01   01
      0<>  0<>  0<>  0<>  0<>
      1    1    1 -  1 -  1
      2    2    2    2-   2-
      3    3-   3-   3-   3-
       */
      let lines = [
        [0, 0, 3],
        [1, 1, 1],
        [0, 0, 2]
      ].map(([x0, x1, y], id) => new SimpleLine(id, x0, x1, y))

      let engine = new Engine()
        .setInitialStates([
          new SimpleState({id: 0, x: 0, y: 0, collidable: true}),
          new SimpleState({id: 1, x: 1, y: 0, collidable: true})
        ])
        .setConstraints([new SimpleConstraint(0, 0, 1)]);

      let oldEngine

      [{
        fn: (engine) => engine,
        expectedY: 3
      }, {
        fn: (engine) => engine.addLine(lines[0]),
        expectedY: 2
      }, {
        fn: (engine) => {
          oldEngine = engine.addLine(lines[1])
          return oldEngine
        },
        expectedY: 0
      }, {
        fn: (engine) => engine.addLine(lines[2]),
        expectedY: 0
      }, {
        fn: (engine) => engine.removeLine(lines[1]),
        expectedY: 1
      }, {
        fn: () => oldEngine,
        expectedY: 0
      }].reduce((engine, {fn, expectedY}, i) => {
        t.comment(`version ${i}`)

        engine = fn(engine)

        let stateMap = engine.getStateMapAtFrame(3)
        t.deepEqual(stateMap.get(0), {id: 0, x: 0, y: expectedY, collidable: true})
        t.deepEqual(stateMap.get(1), {id: 1, x: 1, y: expectedY, collidable: true})

        return engine
      }, engine)
    }

    t.test('with no grid', (t) => {
      testRecomputation(t, SimpleEngine)
      t.end()
    })

    t.test('with simple grid', (t) => {
      testRecomputation(t, class extends SimpleEngine {
        makeGrid () {
          return new SimpleGrid()
        }
      })
      t.end()
    })

    t.test('with expanded grid', (t) => {
      testRecomputation(t, class extends SimpleEngine {
        makeGrid () {
          return new ExpandedGrid()
        }
      })
      t.end()
    })

    t.end()
  })

  t.test('immutable setting state and constraints', (t) => {
    let engine1 = new SimpleEngine()

    let engine2 = engine1.setConstraints([new SimpleConstraint(0, 0, 1)])
    let engine3 = engine2.setInitialStates([
      new SimpleState({id: 0, x: 0, y: 0}),
      new SimpleState({id: 1, x: 0, y: 0})
    ])

    let stateMap = engine1.getStateMapAtFrame(41)
    t.deepEqual(stateMap.get(0), undefined)
    t.deepEqual(stateMap.get(1), undefined)

    stateMap = engine2.getStateMapAtFrame(0)
    t.equal(engine2.frames.length, 1, 'resetting state should have resetted computed frames')
    t.deepEqual(stateMap.get(0), undefined)
    t.deepEqual(stateMap.get(1), undefined)
    stateMap = engine2.getStateMapAtFrame(41)

    stateMap = engine3.getStateMapAtFrame(0)
    t.equal(engine3.frames.length, 1, 'resetting constraints should have resetted computed frames')
    t.deepEqual(stateMap.get(0), {id: 0, x: 0, y: 0, collidable: false})
    t.deepEqual(stateMap.get(1), {id: 1, x: 0, y: 0, collidable: false})

    t.end()
  })

  t.end()
})

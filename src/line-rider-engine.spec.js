import test from 'tape'

import LineRiderEngine, {createLineFromJson, LineTypes, CustomLineRiderEngine} from './line-rider-engine'

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
    const LINE = {id: 0, type: LineTypes.SOLID, x1: 0, y1: 5, x2: 30, y2: 5}
    const INDEX = 11

    let engine = new LineRiderEngine()

    let engineWithLine = engine.addLine(createLineFromJson(LINE))

    let riderFalling = engine.getRider(INDEX).position
    let riderColliding = engineWithLine.getRider(INDEX).position

    t.ok(riderColliding.y < riderFalling.y, 'rider should have collided with line')
    t.ok(riderColliding.y < Y - 0.01, 'rider should not have been flattened')

    t.end()
  })

  t.test('simulation with two lines, one flipped', (t) => {
    const Y = 5
    const LINE1 = {id: 0, type: LineTypes.SOLID, x1: 0, y1: 5, x2: 30, y2: 5}
    const LINE2 = {id: 1, type: LineTypes.SOLID, x1: -7, y1: 0, x2: -7, y2: 10, flipped: true}
    const INDEX = 15

    let engine = new LineRiderEngine()
      .addLine(createLineFromJson(LINE1))
      .addLine(createLineFromJson(LINE2))

    let rider = engine.getRider(INDEX)
    let shoulder = rider.stateMap.get('SHOULDER')
    let butt = rider.stateMap.get('BUTT')
    let nose = rider.stateMap.get('NOSE')

    t.ok(
      shoulder.pos.x > 0 && nose.pos.x < 0,
      'rider should have been separated from sled'
    )
    t.ok(shoulder.pos.y < Y - 0.01, 'rider should not have been flattened')
    t.ok(
      butt.pos.y > Y - 0.01 && butt.pos.x > 0 && shoulder.pos.x > butt.pos.x,
      'rider should be sitting and leaning forward'
    )
    // printSim(engine, INDEX)

    t.end()
  })

  t.test('simulation with scenery line', (t) => {
    const LINE = {id: 0, type: LineTypes.SCENERY, x1: 0, y1: 5, x2: 30, y2: 5}
    const INDEX = 11

    let engine = new LineRiderEngine()

    let engineWithLine = engine.addLine(createLineFromJson(LINE))

    let riderFalling = engine.getRider(INDEX).position
    let riderColliding = engineWithLine.getRider(INDEX).position

    t.ok(riderColliding.y === riderFalling.y, 'rider should not have collided with line')

    t.end()
  })

  t.test('simulation with acc line', (t) => {
    const LINE = {id: 0, type: LineTypes.SOLID, x1: 0, y1: 5, x2: 30, y2: 5}
    const ACC_LINE = {id: 0, type: LineTypes.ACC, x1: 0, y1: 5, x2: 30, y2: 5}
    const INDEX = 11

    let engine = new LineRiderEngine()

    let engineWithLine = engine.addLine(createLineFromJson(LINE))
    let engineWithAccLine = engine.addLine(createLineFromJson(ACC_LINE))

    let riderMoving = engineWithLine.getRider(INDEX).position
    let riderMovingFaster = engineWithAccLine.getRider(INDEX).position

    t.ok(riderMoving.x < riderMovingFaster.x, 'rider should have accelerated')
    t.end()
  })

  t.test('simulation with reversed acc line', (t) => {
    const LINE = {id: 0, type: LineTypes.SOLID, x1: 0, y1: 5, x2: 30, y2: 5}
    const ACC_LINE = {id: 0, type: LineTypes.ACC, x1: 30, y1: 5, x2: 0, y2: 5, flipped: true}
    const INDEX = 11

    let engine = new LineRiderEngine()

    let engineWithLine = engine.addLine(createLineFromJson(LINE))
    let engineWithAccLine = engine.addLine(createLineFromJson(ACC_LINE))

    let riderMoving = engineWithLine.getRider(INDEX).position
    let riderMovingBackwards = engineWithAccLine.getRider(INDEX).position

    t.ok(riderMoving.x > riderMovingBackwards.x, 'rider should have moved backwards')
    t.end()
  })
})

test('LineRiderEngine Compatibility', (t) => {
  const runTestTrack = (trackPath, legacy, extraTest = () => {}) => (t) => {
    let track = require(trackPath)
    let engine = (legacy ? new CustomLineRiderEngine({legacy: true}) : new LineRiderEngine())
      .setStart(track.startPosition)
      .addLine(track.lines.map(createLineFromJson))
    extraTest(t, engine)

    let riderCrashed = engine
      .getRider(track.duration)
      .stateMap.get('RIDER_MOUNTED')
      .framesSinceUnbind
    t.equal(track.duration - riderCrashed, 1 + track.duration, 'rider should not have crashed')
    t.end()
  }

  t.test('test track', runTestTrack('../fixtures/testTrack.track.json', false, (t, engine) => {
    t.skip('extra tests for test track', t => {
      t.comment('Crashing at frame 63: line extensions have not been implemented')
      t.comment('Crashing at frame 86: no grid is being used')
      t.comment('Crashing at frame 433: order of lines is backwards')
      t.equal(engine.getRider(416).stateMap.get('TAIL').pos.x, 804.1054060579701, 'frame 416 tail should be consistent')
      t.equal(engine.getRider(416).stateMap.get('NOSE').pos.x, 813.3255772705486, 'frame 416 nose should be consistent')
      t.equal(engine.getRider(417).stateMap.get('TAIL').pos.x, 797.8845320873339, 'frame 417 tail should be consistent')
      t.equal(engine.getRider(417).stateMap.get('NOSE').pos.x, 810.0876743591476, 'frame 417 nose should be consistent')
      // printSim(engine, 2, 416)
      t.end()
    })
  }))

  t.test('cycloid', runTestTrack('../fixtures/cycloid.track.json', false, (t) => {
    t.skip('extra tests for cycloid', t => {
      t.comment('Crashing at frame 146: using dda instead of classic cells')
      t.end()
    })
  }))

  t.test('legacy test track', runTestTrack('../fixtures/legacyTestTrack.track.json', true, (t) => {
    t.skip('extra tests for legacy test track', t => {
      t.comment('Crashing at frame 862: not using legacy cells')
      t.end()
    })
  }))

  t.end()
})

import Table from 'easy-table'
function printSim (engine, length, start = 0) {
  let IDs = [...engine.rider.body.parts.SLED, ...engine.rider.body.parts.BODY]
  let names = ['i', 'update type', 'id', 'onsled']

  const getUpdateType = (type, id) => {
    switch (type) {
      case 'CollisionUpdate':
        let line = engine.getLine(id)
        return type.slice(0, 3) + ':' + line.constructor.name
      case 'ConstraintUpdate':
        let constraint = engine.constraints.get(id)
        return type.slice(0, 3) + ':' + constraint.constructor.name
      default:
        return type
    }
  }
  let data = Array(length).fill().map((_, i) => i + start).map((i) =>
    engine
      .getUpdatesAtFrame(i)
      // .filter(({type}) => type !== 'ConstraintUpdate')
      .map(({type, id = '', updated}) => {
        let isOnSled = ''
        let updates = Array(IDs.length * 2).fill(null)
        for (let update of updated) {
          let {id, pos: {x, y} = {}} = update
          let j = IDs.indexOf(id)
          if (j >= 0) {
            updates[2 * j] = x
            updates[2 * j + 1] = y
          }
          if (id === 'RIDER_MOUNTED') {
            isOnSled = update.isBinded()
          }
        }
        return [i, getUpdateType(type, id), id, isOnSled, ...updates]
      })
  ).reduce((a, b, i) => {
    i += start
    let rider = engine.getRider(i)
    let points = IDs.map((id) =>
      rider.stateMap.get(id).pos
    ).map(({x, y}) => [x, y])
    .reduce((a, b) => [...a, ...b])
    return [...a, ...b, [i, 'FrameEnd', '', rider.stateMap.get('RIDER_MOUNTED').isBinded(), ...points]]
  }, [])

  let t = new Table()
  t.separator = '│'

  for (let row of data) {
    row.forEach((cell, i) => {
      let name
      if (i < 4) {
        name = names[i]
      } else {
        i -= 4
        name = IDs[Math.floor(i / 2)].slice(0, 4)
        name += i % 2 === 0 ? 'x' : 'y'
        i += 4
      }
      t.cell(name, cell, i > 3 ? Table.number(2) : null)
    })
    t.newRow()
  }

  t.log()
}

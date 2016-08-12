import test from 'tape'

import LineRiderEngine, {createLineFromJson, LineTypes, CustomLineRiderEngine} from './line-rider-engine'
import {DEFAULT_START_POSITION, DEFAULT_START_VELOCITY} from './line-rider-engine/constants.js'

// import printSim from './test-utils/printSim.js'

const DEFAULT_START = {
  position: DEFAULT_START_POSITION,
  velocity: DEFAULT_START_VELOCITY
}

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

  t.test('.toJSON() and bounding box', t => {
    const lines = [
      {id: 0, type: LineTypes.SCENERY, x1: 0, y1: 5, x2: 30, y2: 5},
      {id: 1, type: LineTypes.SOLID, x1: 0, y1: 5, x2: 30, y2: 5, flipped: false, leftExtended: false, rightExtended: false},
      {id: 2, type: LineTypes.ACC, x1: 30, y1: 5, x2: 0, y2: 10, flipped: true, leftExtended: true, rightExtended: true}
    ]

    let engine = new LineRiderEngine()
      .addLine(lines.map(createLineFromJson))

    t.deepEqual(engine.toJSON(), {
      start: DEFAULT_START,
      lines: lines
    }, 'correct json')

    t.deepEqual(engine.getBoundingBox(), [0, 5, 30, 10], 'correct bounding box')

    t.end()
  })

  t.test('does not cause stack overflow for recomputation', t => {
    const line = createLineFromJson({id: 2, type: 0, x1: -113.5, x2: 39.5, y1: 12.75, y2: 8.25})
    const INDEX = 120

    let engine = new LineRiderEngine()
    void engine.getRider(INDEX)

    try {
      void engine.addLine(line)
    } catch (e) {
      t.fail(e)
    }

    t.end()
  })

  t.end()
})

test.skip('LineRiderEngine Compatibility', (t) => {
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

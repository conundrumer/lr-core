import Table from 'easy-table'
export default function printSim (engine, length, start = 0) {
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
      rider.get(id).pos
    ).map(({x, y}) => [x, y])
    .reduce((a, b) => [...a, ...b])
    return [...a, ...b, [i, 'FrameEnd', '', rider.get('RIDER_MOUNTED').isBinded(), ...points]]
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

import classicRiderBody from './rider.json'
import * as States from './states'
import * as Constraints from './constraints'
import V2 from '../V2.js'

function createConstraintFromJson (data) {
  return new Constraints[data.type](data)
}

function createStateFromJson (data, init) {
  return new States[data.type](data, init)
}

function averageVectors (vecs) {
  return vecs.reduce((avg, v) => avg.add(v), V2({x: 0, y: 0})).div(vecs.length)
}

export default class Rider {
  constructor (riderBody = classicRiderBody) {
    // TODO: validate riderBody
    this.body = riderBody
    this.constraints = riderBody.constraints.map(createConstraintFromJson)
    this.bodyPointIDs = riderBody.states.filter(({type}) => type === 'CollisionPoint').map(({id}) => id)
  }
  makeStateArray (position, velocity) {
    return this.body.states.map((stateData) =>
      createStateFromJson(stateData, {position, velocity})
    )
  }
  getBody (stateMap) {
    let points = this.bodyPointIDs.map((id) => stateMap.get(id))
    return {
      position: averageVectors(points.map(({pos}) => pos)),
      velocity: averageVectors(points.map(({vel}) => vel))
    }
  }
}

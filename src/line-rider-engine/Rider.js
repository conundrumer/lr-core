import classicRiderBody from './rider-data'
import * as States from './states'
import * as Constraints from './constraints'
import V2 from '../v2'

function createConstraintFromJson (data, initialStateMap) {
  return new Constraints[data.type](data, initialStateMap)
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
    let initialStateMap = new Map(this.makeStateArray().map((state) => [state.id, state]))
    this.constraints = riderBody.constraints.map((data) => createConstraintFromJson(data, initialStateMap))
  }
  makeStateArray (position, velocity) {
    return this.body.states.map((stateData) =>
      createStateFromJson(stateData, {position, velocity})
    )
  }
  getBody (stateMap) {
    let points = this.body.parts.BODY.map((id) => stateMap.get(id))
    return {
      position: averageVectors(points.map(({pos}) => pos)),
      velocity: averageVectors(points.map(({vel}) => vel)),
      stateMap
    }
  }
}

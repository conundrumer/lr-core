export default class StateUpdate {
  /**
   * [constructor description]
   * @param  {Array} updated [description]
   * @param  {[type]} id      [description]
   */
  constructor (updated, id) {
    this.updated = updated
    if (id != null) {
      this.id = id
    }
  }

  get type () {
    return this.constructor.name
  }
}

export class StepUpdate extends StateUpdate {}

export class ConstraintUpdate extends StateUpdate {}

export class CollisionUpdate extends StateUpdate {
  constructor (updated, id) {
    super([updated], id)
  }
}

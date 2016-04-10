/**
 * Immo: Immutable Manually Managed Object (I guess?)
 * props: immutable properties. these stay the same
 * state: immutable state. these get updated
 *
 * usage:
 * - class MyClass extends Immo(propKeys, stateKeys) {}
 *
 * make sure to fully specify props and state for given propKeys and stateKeys
 * MyClass.constructor(props, state)
 * MyClass.update(nextState)
 *
 */

function defineProps (obj, keys, getPropsKey) {
  for (let key of keys) {
    Object.defineProperty(obj, key, {
      // enumerable: true,
      get: getPropsKey(key)
    })
  }
}

export default function Immo (propsKeys, stateKeys) {
  if (!(propsKeys instanceof Array)) {
    propsKeys = Object.keys(propsKeys)
  }
  if (!(stateKeys instanceof Array)) {
    stateKeys = Object.keys(stateKeys)
  }
  class ImmoClass {
    constructor (props, state) {
      Object.defineProperties(this, {
        _props: { value: props },
        _state: { value: state },
        _init: { value: this }
      })
    }
    update (nextState) {
      return Object.create(this._init, {
        _state: { value: nextState }
      })
    }
  }
  defineProps(ImmoClass.prototype, propsKeys, (key) => function () { return this._props[key] })
  defineProps(ImmoClass.prototype, stateKeys, (key) => function () { return this._state[key] })
  return ImmoClass
}

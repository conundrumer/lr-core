/**
 * Immo: Immutable Manually Managed Object (I guess?)
 * props: immutable properties. these stay the same
 * state: immutable state. these get updated
 * computed: mutable derived data
 *
 * usage:
 * - class MyClass extends Immo(propKeys, stateKeys) {}
 *
 * make sure to fully specify props and state for given propKeys and stateKeys
 * MyClass.constructor(props, state)
 * MyClass.update(nextState)
 *
 * this would be nicer to user with decorators...
 */

function defineProps (obj, keys, getPropsKey, setPropsKey) {
  if (!keys) return
  for (let key of keys) {
    Object.defineProperty(obj, key, {
      // enumerable: true,
      get: getPropsKey(key),
      set: setPropsKey && setPropsKey(key)
    })
  }
}

export default function Immo (...keys) {
  keys = keys.map((keys) => (keys instanceof Array) ? keys : Object.keys(keys))
  let [propsKeys, stateKeys, computedKeys] = keys
  class ImmoClass {
    constructor (props, state, computed) {
      this.__init__ = this
      this.__props__ = props
      this.__state__ = state
      this.__computed__ = computed
      this.__current__ = this
    }
    updateIfOutdated (updateFns) {
      let current = this.__current__
      if (this !== current) {
        this.__init__.__current__ = this
        for (let stateKey in updateFns) {
          if (current[stateKey] !== this[stateKey]) {
            updateFns[stateKey](current)
          }
        }
      }
    }
    update (updated) {
      let next = Object.create(this.__init__, {
        __state__: { value: Object.assign({}, this.__state__, updated) }
      })
      this.__init__.__current__ = next
      return next
    }
  }
  let defineImmoProps = defineProps.bind(null, ImmoClass.prototype)
  defineImmoProps(propsKeys, (key) => function () { return this.__props__[key] })
  defineImmoProps(stateKeys, (key) => function () { return this.__state__[key] })
  defineImmoProps(computedKeys,
    (key) => function () { return this.__computed__[key] },
    (key) => function (value) { this.__computed__[key] = value }
  )
  return ImmoClass
}

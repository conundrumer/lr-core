/**
 * Immo: Immutable Manually Managed Object
 *
 * props: immutable properties. these stay the same
 * state: immutable state. these get updated via updateState()
 * computed: mutable derived data. make them up to date via updateComputed()
 * update: object mapping computed props to update fns
 *
 * usage:
 * - @setupImmo
 * - class MyClass extends Immo {}
 * - // setupImmo(MyClass) if you dont have decorators
 *
 * instance = new MyClass(props, state, computed)
 * nextInstance = instance.updateState(nextState)
 *
 * you can also subclass your Immo subclass.
 * just remember to @setupImmo the subsubclass if you want to add more immo properties
 *
 */

export default class Immo {
  static __props__ () {
    return {}
  }
  static __state__ () {
    return {}
  }
  static __computed__ () {
    return {}
  }
  static get __update__ () {
    return {}
  }
  constructor ({props, state, computed} = {}) {
    let current = this
    Object.defineProperties(this, {
      __init__: {
        value: this
      },
      __current__: {
        get: () => current,
        set: (next) => { current = next }
      },
      __props__: {
        value: Object.assign(new.target.__props__.call(this), props)
      },
      __state__: {
        value: Object.assign(new.target.__state__.call(this), state)
      },
      __computed__: {
        value: Object.assign(new.target.__computed__.call(this), computed)
      }
    })
  }
  updateState (updated) {
    let next = Object.create(this.__init__, {
      __state__: {
        value: Object.assign({}, this.__state__, updated)
      }
    })
    this.__current__ = next
    return next
  }
  updateComputed () {
    if (this !== this.__current__) {
      let updateFns = this.constructor.__update__
      let current = this.__current__
      this.__current__ = this
      for (let stateKey in updateFns) {
        let targetState = this[stateKey]
        let currentState = current[stateKey]
        if (currentState !== targetState) {
          updateFns[stateKey].call(this, targetState, currentState, current)
        }
      }
    }
  }
}

export function setupImmo (Subclass) {
  makeImmoStaticProps(Subclass)
  makeImmoAccessors(Subclass)
}

function defineAccessors (obj, keys, getPropsKey, setPropsKey) {
  if (!keys) return
  for (let key of keys) {
    Object.defineProperty(obj, key, {
      get: getPropsKey(key),
      set: setPropsKey && setPropsKey(key)
    })
  }
}

function makeImmoAccessors (Subclass) {
  let defineImmoAccessors = (obj, getPropsKey, setPropsKey) =>
    defineAccessors(Subclass.prototype, Object.keys(obj), getPropsKey, setPropsKey)

  defineImmoAccessors(Subclass.__props__.call(Subclass.prototype), (key) => function () { return this.__props__[key] })
  defineImmoAccessors(Subclass.__state__.call(Subclass.prototype), (key) => function () { return this.__state__[key] })
  defineImmoAccessors(Subclass.__computed__.call(Subclass.prototype),
    (key) => function () { return this.__computed__[key] },
    (key) => function (value) { this.__computed__[key] = value }
  )
}

function makeImmoStaticProps (Subclass) {
  let Superclass = Object.getPrototypeOf(Subclass)
  Object.defineProperties(Subclass, {
    __props__: {
      value () {
        return Object.assign(Superclass.__props__.call(this), Subclass.prototype.__props__.call(this))
      }
    },
    __state__: {
      value () {
        return Object.assign(Superclass.__state__.call(this), Subclass.prototype.__state__.call(this))
      }
    },
    __computed__: {
      value () {
        return Object.assign(Superclass.__computed__.call(this), Subclass.prototype.__computed__.call(this))
      }
    },
    __update__: {
      value: Object.assign({}, Superclass.__update__, Subclass.prototype.__update__())
    }
  })
}

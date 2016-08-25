import assignPrototype from './assignPrototype.js'

class SubclassableArray {
  constructor (...args) {
    this.__array__ = new Array(...args)
  }
  toArray () {
    return this.__array__
  }
  get (i) {
    return this.__array__[i]
  }
  set (i, v) {
    this.__array__[i] = v
  }
  get length () {
    return this.__array__.length
  }
  [Symbol.iterator] () {
    return this.__array__[Symbol.iterator]()
  }
}
assignPrototype(Array, SubclassableArray, '__array__')

const ARRAY_SUBCLASSABLE = (() => {
  class C extends Array {}
  var c = new C()
  return c.concat(1) instanceof C
})()

export default ARRAY_SUBCLASSABLE
? class extends Array {
  toArray () { return this }
  get (i) { return this[i] }
  set (i, v) { this[i] = v }
}
: SubclassableArray

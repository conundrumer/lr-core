import assignPrototype from './assignPrototype.js'

class SubclassableMap {
  constructor (...args) {
    this.__map__ = new Map(...args)
  }
  get size () {
    return this.__map__.size
  }
}
assignPrototype(Map, SubclassableMap, '__map__')

const MAP_SUBCLASSABLE = (() => {
  var key = {}
  class M extends Map {}
  try {
    var map = new M()
    map.set(key, 123)
  } catch (e) {
    return false
  }

  return map instanceof M && map.has(key) && map.get(key) === 123
})()

export default MAP_SUBCLASSABLE ? Map : SubclassableMap

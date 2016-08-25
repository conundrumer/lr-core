import sortedIndexBy from 'lodash/sortedIndexBy.js'

function OrderedObjectArrayConstructor (key, descending = false) {
  this._key = key
  this._getID = descending ? obj => -obj[this._key] : obj => obj[this._key]
  this._set = new Set()
}

export default class OrderedObjectArray extends Array {
  constructor (...args) {
    super()
    OrderedObjectArrayConstructor.call(this, ...args)
  }
  getIndexOf (obj) {
    return sortedIndexBy(this.toArray(), obj, this._getID)
  }
  has (obj) {
    return this._set.has(obj[this._key])
  }
  add (obj) {
    if (!this.has(obj)) {
      this._set.add(obj[this._key])
      let index = this.getIndexOf(obj)
      this.splice(index, 0, obj)
    }
  }
  remove (obj) {
    if (this.has(obj)) {
      this._set.delete(obj[this._key])
      let index = this.getIndexOf(obj)
      this.splice(index, 1)
    }
  }

  toArray () {
    return this
  }
}

class OrderedObjectArrayNonSubclassed {
  constructor (...args) {
    OrderedObjectArrayConstructor.call(this, ...args)
    this._array = []
  }
  toArray () {
    return this._array
  }
  get length () {
    return this._array.length
  }
  splice (...args) {
    return this._array.splice(...args)
  }
  filter (...args) {
    return this._array.filter(...args)
  }
  [Symbol.iterator] () {
    return this._array[Symbol.iterator]()
  }
}

const ARRAY_SUBCLASSABLE = (() => {
  class C extends Array {}
  var c = new C()
  var len1 = c.length
  c[2] = 'foo'
  var len2 = c.length
  return len1 === 0 && len2 === 3
})()

if (ARRAY_SUBCLASSABLE) {
  Object.assign(OrderedObjectArray.prototype, OrderedObjectArrayNonSubclassed.prototype)
}

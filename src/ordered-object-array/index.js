import sortedIndexBy from 'lodash/sortedIndexBy.js'

export default class OrderedObjectArray extends Array {
  constructor (key, descending = false) {
    super()
    this._key = key
    this._getID = descending ? obj => -obj[this._key] : obj => obj[this._key]
    this._set = new Set()
  }
  getIndexOf (obj) {
    return sortedIndexBy(this, obj, this._getID)
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
}

// export default class ClassicGrid {
//   add (line) {}
//   remove (line) {}
//   getCellsNearEntity (entity) { return [] }
//   getLinesNearEntity (entity) { return [] }
// }

export default class NoGrid {
  constructor () {
    this.lines = new Set()
  }
  add (line) {
    this.lines.add(line)
    return [0]
  }
  remove (line) {
    this.lines.delete(line)
  }
  getLinesNearEntity (entity) {
    return Array.from(this.lines)
  }
  getCellsNearEntity (entity) {
    return [0]
  }
}

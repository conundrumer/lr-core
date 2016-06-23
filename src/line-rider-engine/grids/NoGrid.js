export default class NoGrid {
  constructor () {
    this.collidableLines = new Set()
  }
  add (line) {
    if (!line.collidable) return []
    this.collidableLines.add(line)
    return [0]
  }
  remove (line) {
    this.collidableLines.delete(line)
  }
  getLinesNearEntity (entity) {
    return Array.from(this.collidableLines)
  }
  getCellsNearEntity (entity) {
    return [0]
  }
}

import {hashIntPair} from '../../hashNumberPair.js'
import dda from '../../dda.js'

export function ddaCells ({p1, p2}, gridSize) {
  return dda(p1.x / gridSize, p1.y / gridSize, p2.x / gridSize, p2.y / gridSize)
    .map(({x, y}) => hashIntPair(x, y))
}

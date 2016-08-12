/**
 * line 1 endpoints: (x0, y0), (x1, y1)
 * line 2 endpoints: (x2, y2), (x3, y3)
 * inclusive: include edge cases e.g. endpoint touching an edge or on a point (default false)
 *
 * returns:
 * if: there is an intersection
 * then: a value between 0 and 1 describing the position of intersection on line 1
 *   or true if lines are collinear and inclusive is true (undefined point of intersectoin)
 * else: null
 */
export function lineLineIntersection (x0, y0, x1, y1, x2, y2, x3, y3, inclusive) {
  const x01 = x1 - x0
  const y01 = y1 - y0
  const x23 = x3 - x2
  const y23 = y3 - y2

  const _01cross23 = x01 * y23 - x23 * y01
  if (_01cross23 === 0) { // collinear
    return inclusive ? true : null
  }
  const orientation = _01cross23 > 0

  const x02 = x2 - x0
  const y02 = y2 - y0
  const _02cross01 = x02 * y01 - y02 * x01
  if ((_02cross01 === 0) ? !inclusive : (_02cross01 < 0) === orientation) {
    return null
  }

  const _02cross23 = x02 * y23 - y02 * x23
  if ((_02cross23 === 0) ? !inclusive : (_02cross23 < 0) === orientation) {
    return null
  }

  if ((_02cross01 === _01cross23) ? !inclusive : (_02cross01 > _01cross23) === orientation) {
    return null
  }
  if ((_02cross23 === _01cross23) ? !inclusive : (_02cross23 > _01cross23) === orientation) {
    return null
  }

  return _02cross23 / _01cross23
}

/**
 * line endpoints: (x0, y0), (x1, y1)
 * box corners diagonal from each other: (x2, y2), (x3, y3)
 * inclusive: include edge cases e.g. endpoint touching the box edge or corner (default false)
 *
 * returns true if the line is contained within or intersects with the box, false otherwise
 */
export function lineInBox (x0, y0, x1, y1, x2, y2, x3, y3, inclusive) {
  if (x2 < x3) {
    if (y2 < y3) {
      return lineInBoxOrdered(x0, y0, x1, y1, x2, y2, x3, y3, inclusive)
    } else {
      return lineInBoxOrdered(x0, y0, x1, y1, x2, y3, x3, y2, inclusive)
    }
  } else {
    if (y2 < y3) {
      return lineInBoxOrdered(x0, y0, x1, y1, x3, y2, x2, y3, inclusive)
    } else {
      return lineInBoxOrdered(x0, y0, x1, y1, x3, y3, x2, y2, inclusive)
    }
  }
}
/**
 * same as lineInBox except
 * (x2, y2) is the top-left corner of the box
 * (x3, y3) is the bottom-right corner of the box
 */
export function lineInBoxOrdered (x0, y0, x1, y1, x2, y2, x3, y3, inclusive) {
  let L0, R0, T0, B0, L1, R1, T1, B1
  if (inclusive) {
    L0 = x0 < x2
    R0 = x0 > x3
    T0 = y0 < y2
    B0 = y0 > y3
    L1 = x1 < x2
    R1 = x1 > x3
    T1 = y1 < y2
    B1 = y1 > y3
  } else {
    L0 = x0 <= x2
    R0 = x0 >= x3
    T0 = y0 <= y2
    B0 = y0 >= y3
    L1 = x1 <= x2
    R1 = x1 >= x3
    T1 = y1 <= y2
    B1 = y1 >= y3
  }

  // both endpoints are totally on one side of the box
  if (L0 && L1 || R0 && R1 || T0 && T1 || B0 && B1) {
    return false
  }
  // both endpoints are not on one side of the box
  // but between left/right or top/bottom sides
  // or one point inside
  if (!L0 && !R0 && (!T0 && !B0 || !L1 && !R1) || !T1 && !B1 && (!L1 && !R1 || !T0 && !B0)) {
    return true
  }

  // TL - BR
  if ((L0 || B0 || R1 || T1) && (R0 || T0 || L1 || B1)) {
    return lineLineIntersection(x0, y0, x1, y1, x2, y3, x3, y2, inclusive) !== null
  } else { // TR - BL
    return lineLineIntersection(x0, y0, x1, y1, x2, y2, x3, y3, inclusive) !== null
  }
}

/**
 * point: (x0, y0)
 * line endpoints: (x1, y1), (x2, y2)
 *
 * returns: the closest distance between the point and the line segment
 */
export function pointLineDistance (x0, y0, x1, y1, x2, y2) {
  return Math.sqrt(pointLineDistanceSquared(x0, y0, x1, y1, x2, y2))
}
export function pointLineDistanceSquared (x0, y0, x1, y1, x2, y2) {
  const x12 = x2 - x1
  const y12 = y2 - y1
  const x10 = x0 - x1
  const y10 = y0 - y1

  const dot = x10 * x12 + y10 * y12
  if (dot <= 0) {
    return x10 * x10 + y10 * y10
  }

  const lengthSq = x12 * x12 + y12 * y12
  if (dot >= lengthSq) {
    const x20 = x0 - x2
    const y20 = y0 - y2
    return x20 * x20 + y20 * y20
  }

  const cross = x10 * y12 - y10 * x12
  return cross * cross / lengthSq
}

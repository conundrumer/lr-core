// digital differential analyzer
export default function dda (x0, y0, x1, y1) {
  if (x0 > x1) {
    return dda(x1, y1, x0, y0)
  }
  const slope = (y1 - y0) / (x1 - x0)
  if (Math.abs(slope) > 1) {
    return dda(y0, x0, y1, x1).map(({x, y}) => ({x: y, y: x}))
  }
  const cx0 = Math.floor(x0)
  const cy0 = Math.floor(y0)
  const cx1 = Math.floor(x1)
  const cy1 = Math.floor(y1)

  let out = [{x: cx0, y: cy0}]
  let prevY = cy0
  for (let x = cx0 + 1; x <= cx1; x++) {
    const y = Math.floor(y1 + slope * (x - x1))
    if (y !== prevY) {
      out.push({x: x - 1, y})
      prevY = y
    }
    out.push({x, y})
  }
  if (cy1 !== prevY) {
    out.push({x: cx1, y: cy1})
  }

  return out
}

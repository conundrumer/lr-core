/**
 * lissajous curve track + viewport generator
 * k: scale (so the bounding box will be [-k, -k, k, k])
 * N: Number of lines in one curve (there are two curves)
 * n: how many steps in a curve to draw a diagonal
 * M: Number of viewports
 * an: x frequency
 * bn: y frequency
 * cn: phase
 * 0: curve 0
 * 1: curve 1
 * 2: viewport trajectory
 * 3: viewport dimensions
 */
/*
good params:
{
  k: 300,
  N: 1000,
  n: 31,
  M: 200
}
[8, 5, 0]
[5, 8, Math.PI / 7]
[3, 5, 5 * Math.PI / 11]
[5, 3, 3 * Math.PI / 13]
*/

export default function liss (
  {k, N, n, M},
  [a0, b0, c0],
  [a1, b1, c1],
  [a2, b2, c2],
  [a3, b3, c3]
) {
  let id = 0
  let lines = []
  let viewports = []

  const makeLine = (x1, y1, x2, y2) => ({type: 2, id: id++, x1, y1, x2, y2})

  for (let i = 0; i < N; i++) {
    let t0 = i / N * 2 * Math.PI
    let t1 = (i + 1) / N * 2 * Math.PI

    let x1 = k * Math.sin(a0 * t0 + c0)
    let y1 = k * Math.cos(b0 * t0 + c0)
    let x2 = k * Math.sin(a0 * t1 + c0)
    let y2 = k * Math.cos(b0 * t1 + c0)

    let x3 = k * Math.sin(a1 * t0 + c1)
    let y3 = k * Math.cos(b1 * t0 + c1)
    let x4 = k * Math.sin(a1 * t1 + c1)
    let y4 = k * Math.cos(b1 * t1 + c1)

    lines.push(makeLine(x1, y1, x2, y2))
    lines.push(makeLine(x3, y3, x4, y4))

    if (i % n === 0) {
      lines.push(makeLine(x1, y1, x3, y3))
    }
  }

  for (let i = 0; i < M; i++) {
    let t = i / M * 2 * Math.PI

    let x = k * Math.sin(a2 * t + c2)
    let y = k * Math.cos(b2 * t + c2)
    let xk = k * Math.sin(a3 * t + c3)
    let yk = k * Math.cos(b3 * t + c3)

    viewports.push([x - xk, y - yk, x + xk, y + yk])
  }
  return {lines, viewports}
}

import test from 'tape'

// import {hashUIntPair, unhashUIntPair} from './hashNumberPair.js'
import {hashIntPair, unhashIntPair} from './hashNumberPair.js'

test('hash number pair', (t) => {
  let n
  for (let i = 0; i < 10; i++) {
    for (let j = 0; j < 10; j++) {
      n = hashIntPair(i, j)
      let [i_, j_] = unhashIntPair(n)
      t.equal(i_, i)
      t.equal(j_, j)
      if (i !== 0) {
        n = hashIntPair(-i, j)
        let [i_, j_] = unhashIntPair(n)
        t.equal(i_, -i)
        t.equal(j_, j)
      }
      if (j !== 0) {
        n = hashIntPair(i, -j)
        let [i_, j_] = unhashIntPair(n)
        t.equal(i_, i)
        t.equal(j_, -j)
      }
      if (i !== 0 && j !== 0) {
        n = hashIntPair(-i, -j)
        let [i_, j_] = unhashIntPair(n)
        t.equal(i_, -i)
        t.equal(j_, -j)
      }
    }
    t.equal(hashIntPair(...unhashIntPair(i)), i)
    t.equal(hashIntPair(...unhashIntPair(-i)), -i)
  }

  t.end()
})

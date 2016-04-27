import test from 'tape'

import Immo from './Immo.js'

let testProps = {a: 'foo'}
let testState = {b: 'bar', c: 'baz'}
let testComputed = {d: 42}

test('plain Immo from array', (t) => {
  let Im = Immo(['a'], ['b', 'c'], ['d'])
  let im = new Im(testProps, testState, testComputed)

  t.equal(im.a, 'foo')
  t.equal(im.b, 'bar')
  t.equal(im.c, 'baz')
  t.equal(im.d, 42)

  t.end()
})

test('plain Immo from object', (t) => {
  let Im = Immo(testProps, testState, testComputed)
  let im = new Im(testProps, testState, testComputed)

  t.equal(im.a, 'foo')
  t.equal(im.b, 'bar')
  t.equal(im.c, 'baz')
  t.equal(im.d, 42)

  t.end()
})

function testVersioning (t, im1, im2) {
  t.test('versions', (t) => {
    t.plan(4)
    im2.updateIfOutdated({
      b () {
        t.fail('im3 should not be outdated')
      }
    })
    im1.updateIfOutdated({
      b (im) {
        t.pass('im1 is outdated')
        t.equal(im, im2, 'current version is im3')
      }
    })
    im1.updateIfOutdated({
      c () {
        t.fail('im1 should not be outdated')
      }
    })
    im2.updateIfOutdated({
      c (im) {
        t.pass('im3 is outdated')
        t.equal(im, im1, 'current version is im1')
      }
    })
  })
}

test('plain Immo update', (t) => {
  let Im = Immo(testProps, testState, testComputed)
  let im1 = new Im(testProps, testState, testComputed)
  let im2 = im1.update({b: 'bar2', c: 'baz2'})
  let im3 = im2.update({c: 'baz3'})
  im3.d = 43

  t.comment('im1')
  t.equal(im1.a, 'foo')
  t.equal(im1.b, 'bar')
  t.equal(im1.c, 'baz')
  t.equal(im1.d, 43)

  t.comment('im2')
  t.equal(im2.a, 'foo')
  t.equal(im2.b, 'bar2')
  t.equal(im2.c, 'baz2')
  t.equal(im2.d, 43)

  t.comment('im3')
  t.equal(im3.a, 'foo')
  t.equal(im3.b, 'bar2')
  t.equal(im3.c, 'baz3')
  t.equal(im3.d, 43)

  testVersioning(t, im1, im3)

  t.end()
})

test('inherited Immo', (t) => {
  class MyClass extends Immo(testProps, testState, testComputed) {
    foobar () {
      return this.a + this.b
    }
  }

  let im1 = new MyClass(testProps, testState, testComputed)
  let im2 = im1.update({b: 'bar2', c: 'baz2'})
  let im3 = im2.update({b: 'bar3', c: 'baz3'})
  im3.d = 43

  t.comment('im1')
  t.equal(im1.a, 'foo')
  t.equal(im1.b, 'bar')
  t.equal(im1.c, 'baz')
  t.equal(im1.foobar(), 'foobar')
  t.equal(im1.d, 43)

  t.comment('im2')
  t.equal(im2.a, 'foo')
  t.equal(im2.b, 'bar2')
  t.equal(im2.c, 'baz2')
  t.equal(im2.foobar(), 'foobar2')
  t.equal(im2.d, 43)

  t.comment('im3')
  t.equal(im3.a, 'foo')
  t.equal(im3.b, 'bar3')
  t.equal(im3.c, 'baz3')
  t.equal(im3.foobar(), 'foobar3')
  t.equal(im3.d, 43)

  testVersioning(t, im1, im3)

  t.end()
})

test('inherited*2 Immo', (t) => {
  class ClassOne extends Immo(testProps, testState, testComputed) {
    foobar () {
      return this.a + this.b
    }
  }

  class ClassTwo extends ClassOne {
    asdf () {
      return this.b + this.c
    }
  }

  let im1 = new ClassTwo(testProps, testState, testComputed)
  let im2 = im1.update({b: 'bar2', c: 'baz2'})
  let im3 = im2.update({b: 'bar3', c: 'baz3'})
  im3.d = 43

  t.comment('im1')
  t.equal(im1.a, 'foo')
  t.equal(im1.b, 'bar')
  t.equal(im1.c, 'baz')
  t.equal(im1.foobar(), 'foobar')
  t.equal(im1.asdf(), 'barbaz')
  t.equal(im1.d, 43)

  t.comment('im2')
  t.equal(im2.a, 'foo')
  t.equal(im2.b, 'bar2')
  t.equal(im2.c, 'baz2')
  t.equal(im2.foobar(), 'foobar2')
  t.equal(im2.asdf(), 'bar2baz2')
  t.equal(im2.d, 43)

  t.comment('im3')
  t.equal(im3.a, 'foo')
  t.equal(im3.b, 'bar3')
  t.equal(im3.c, 'baz3')
  t.equal(im3.foobar(), 'foobar3')
  t.equal(im3.asdf(), 'bar3baz3')
  t.equal(im3.d, 43)

  testVersioning(t, im1, im3)

  t.end()
})

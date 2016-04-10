import test from 'tape'

import Immo from './Immo.js'

let testProps = {a: 'foo'}
let testState = {b: 'bar', c: 'baz'}

test('plain Immo from array', (t) => {
  let Im = Immo(['a'], ['b', 'c'])
  let im = new Im(testProps, testState)

  t.equal(im.a, 'foo')
  t.equal(im.b, 'bar')
  t.equal(im.c, 'baz')

  t.end()
})

test('plain Immo from object', (t) => {
  let Im = Immo(testProps, testState)
  let im = new Im(testProps, testState)

  t.equal(im.a, 'foo')
  t.equal(im.b, 'bar')
  t.equal(im.c, 'baz')

  t.end()
})

test('plain Immo update', (t) => {
  let Im = Immo(testProps, testState)
  let im1 = new Im(testProps, testState)
  let im2 = im1.update({b: 'bar2', c: 'baz2'})
  let im3 = im2.update({c: 'baz3'})

  t.comment('im1')
  t.equal(im1.a, 'foo')
  t.equal(im1.b, 'bar')
  t.equal(im1.c, 'baz')

  t.comment('im2')
  t.equal(im2.a, 'foo')
  t.equal(im2.b, 'bar2')
  t.equal(im2.c, 'baz2')

  t.comment('im3')
  t.equal(im3.a, 'foo')
  t.equal(im3.b, undefined) // b is not assigned!
  t.equal(im3.c, 'baz3')

  t.end()
})

test('inherited Immo', (t) => {
  class MyClass extends Immo(testProps, testState) {
    foobar () {
      return this.a + this.b
    }
  }

  let im1 = new MyClass(testProps, testState)
  let im2 = im1.update({b: 'bar2', c: 'baz2'})
  let im3 = im2.update({b: 'bar3', c: 'baz3'})

  t.comment('im1')
  t.equal(im1.a, 'foo')
  t.equal(im1.b, 'bar')
  t.equal(im1.c, 'baz')
  t.equal(im1.foobar(), 'foobar')

  t.comment('im2')
  t.equal(im2.a, 'foo')
  t.equal(im2.b, 'bar2')
  t.equal(im2.c, 'baz2')
  t.equal(im2.foobar(), 'foobar2')

  t.comment('im3')
  t.equal(im3.a, 'foo')
  t.equal(im3.b, 'bar3')
  t.equal(im3.c, 'baz3')
  t.equal(im3.foobar(), 'foobar3')

  t.end()
})

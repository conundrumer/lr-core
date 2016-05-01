import test from 'tape'

import {abstractClass, interfaceClass} from './abstract-interface.js'

test('abstractClass', (t) => {
  class AbstractFoo {
    bar () {}
    baz () {
      return 42
    }
  }
  abstractClass('bar')(AbstractFoo)

  t.test('abstract subclass', (t) => {
    class Foo extends AbstractFoo {}
    let foo = new Foo()
    t.equal(foo.baz(), 42)
    try {
      foo.bar()
      t.fail()
    } catch (e) {
      t.ok(e instanceof TypeError)
      t.equal(e.message, 'Foo.prototype.bar is not implemented')
    }

    t.end()
  })

  t.test('concrete subclass', (t) => {
    class Foo extends AbstractFoo {
      bar () {
        return 'hello'
      }
    }
    let foo = new Foo()
    t.equal(foo.bar(), 'hello')
    t.equal(foo.baz(), 42)

    t.end()
  })

  t.end()
})

test('interfaceClass', (t) => {
  class IFoo {
    bar () {}
    baz () {}
  }
  interfaceClass(IFoo)
  t.test('abstract subclass', (t) => {
    class Foo extends IFoo {
      baz () {
        return 42
      }
    }
    let foo = new Foo()
    t.equal(foo.baz(), 42)
    try {
      foo.bar()
      t.fail()
    } catch (e) {
      t.ok(e instanceof TypeError)
      t.equal(e.message, 'Foo.prototype.bar is not implemented')
    }

    t.end()
  })

  t.test('concrete subclass', (t) => {
    class Foo extends IFoo {
      bar () {
        return 'hello'
      }
      baz () {
        return 42
      }
    }
    let foo = new Foo()
    t.equal(foo.bar(), 'hello')
    t.equal(foo.baz(), 42)

    t.end()
  })

  t.end()
})

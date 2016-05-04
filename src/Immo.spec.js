import test from 'tape'

import Immo, {setupImmo} from './Immo.js'

let testUpdater = (TestClass, self, target, current, currentThis) =>
  target !== current && self instanceof TestClass && currentThis instanceof TestClass

test('Immo subclass', (t) => {
  let updateTester
  let setUpdateTester = (t) => { updateTester = t }

  // @setupImmo
  class TestClass extends Immo {
    get __props__ () {
      return {a: 'a', b: 'b'}
    }
    get __state__ () {
      return {c: 'c', d: 'd'}
    }
    get __computed__ () {
      return {e: 'e', f: 'f'}
    }
    get __update__ () {
      return {
        c (...args) {
          updateTester.ok(testUpdater(TestClass, this, ...args), '__update__.c')
        },
        d (...args) {
          this.bar()
        }
      }
    }
    bar () {
      this.updateComputed()
    }
  }
  setupImmo(TestClass)

  runTest(t, TestClass, setUpdateTester)

  t.test('no infinite mutual recursion with updateComputed', (t) => {
    let foo1 = new TestClass()
    let foo2 = foo1.updateState({d: 'd2'})
    foo1.bar()
    foo2.bar()
    t.end()
  })

  t.end()
})

test('Immo subsubclass', (t) => {
  let updateTester
  let setUpdateTester = (t) => { updateTester = t }

  // @setupImmo
  class TestClass extends Immo {
    get __props__ () {
      return {a: 'a'}
    }
    get __state__ () {
      return {c: 'c'}
    }
    get __computed__ () {
      return {e: 'e'}
    }
    get __update__ () {
      return {
        c (...args) {
          updateTester.ok(testUpdater(TestClass, this, ...args), '__update__.c')
        }
      }
    }
  }
  setupImmo(TestClass)

  // @setupImmo
  class SubTestClass extends TestClass {
    get __props__ () {
      return {b: 'b'}
    }
    get __state__ () {
      return {d: 'd'}
    }
    get __computed__ () {
      return {f: 'f'}
    }
    get __update__ () {
      return {
        d (...args) {
          updateTester.fail()
        }
      }
    }
  }
  setupImmo(SubTestClass)

  runTest(t, SubTestClass, setUpdateTester)

  t.end()
})

test('Immo subsubclass variation', (t) => {
  let updateTester
  let setUpdateTester = (t) => { updateTester = t }

  // @setupImmo
  class TestClass extends Immo {
    get __props__ () {
      return {b: 'b'}
    }
    get __state__ () {
      return {d: 'd'}
    }
    get __computed__ () {
      return {f: 'f'}
    }
    get __update__ () {
      return {
        d (...args) {
          updateTester.fail()
        }
      }
    }
  }
  setupImmo(TestClass)

  // @setupImmo
  class SubTestClass extends TestClass {
    get __props__ () {
      return {a: 'a'}
    }
    get __state__ () {
      return {c: 'c'}
    }
    get __computed__ () {
      return {e: 'e'}
    }
    get __update__ () {
      return {
        c (...args) {
          updateTester.ok(testUpdater(SubTestClass, this, ...args), '__update__.c')
        }
      }
    }
  }
  setupImmo(SubTestClass)

  runTest(t, SubTestClass, setUpdateTester)

  t.end()
})

test('Immo empty subsubclass', (t) => {
  let updateTester
  let setUpdateTester = (t) => { updateTester = t }

  // @setupImmo
  class TestClass extends Immo {
    get __props__ () {
      return {a: 'a', b: 'b'}
    }
    get __state__ () {
      return {c: 'c', d: 'd'}
    }
    get __computed__ () {
      return {e: 'e', f: 'f'}
    }
    get __update__ () {
      return {
        c (...args) {
          updateTester.ok(testUpdater(TestClass, this, ...args), '__update__.c')
        },
        d (...args) {
          updateTester.fail()
        }
      }
    }
  }
  setupImmo(TestClass)

  class SubTestClass extends TestClass {}

  runTest(t, SubTestClass, setUpdateTester)

  t.end()
})

function runTest (t, TestClass, setUpdateTester) {
  const getValues = ({a, b, c, d, e, f}) => ({a, b, c, d, e, f})
  const defaultValues = {a: 'a', b: 'b', c: 'c', d: 'd', e: 'e', f: 'f'}
  const customValues = {a: 'a1', b: 'b', c: 'c1', d: 'd', e: 'e1', f: 'f'}

  t.test('default instantiation', (t) => {
    let foo1 = new TestClass()
    let foo2 = foo1.updateState({c: 'c2'})

    t.deepEqual(getValues(foo1), defaultValues, 'foo1: default')

    t.deepEqual(getValues(foo2), Object.assign({}, defaultValues, {c: 'c2'}), 'foo2: c updated')

    t.comment('modify computed')
    foo1.e = 'e2'
    t.equal(foo1.e, 'e2', 'foo1 computed modified')
    t.equal(foo2.e, 'e2', 'foo2 computed modified')

    t.test('update computed', (t) => {
      t.plan(1)
      setUpdateTester(t)
      foo1.updateComputed()
      foo1.updateComputed()
    })

    t.end()
  })

  t.test('instantiation w given props', (t) => {
    let foo1 = new TestClass({
      props: {a: 'a1'},
      state: {c: 'c1'},
      computed: {e: 'e1'}
    })
    let foo2 = foo1.updateState({c: 'c2'})
    let foo3 = foo2.updateState({c: 'c3'})

    t.deepEqual(getValues(foo1), customValues, 'foo1: init')

    t.deepEqual(getValues(foo2), Object.assign({}, customValues, {c: 'c2'}), 'foo2: c updated')

    t.deepEqual(getValues(foo3), Object.assign({}, customValues, {c: 'c3'}), 'foo3: c updated')

    t.comment('modify computed')
    foo2.e = 'c2'
    t.equal(foo1.e, 'c2', 'foo1 computed modified')
    t.equal(foo2.e, 'c2', 'foo2 computed modified')
    t.equal(foo3.e, 'c2', 'foo3 computed modified')

    t.test('update computed', (t) => {
      t.plan(3)
      setUpdateTester(t)
      foo3.updateComputed()
      t.test('foo1', (t) => {
        t.plan(1)
        setUpdateTester(t)
        foo1.updateComputed()
        foo1.updateComputed()
      })
      t.test('foo2', (t) => {
        t.plan(1)
        setUpdateTester(t)
        foo2.updateComputed()
        foo2.updateComputed()
      })
      t.test('foo3', (t) => {
        t.plan(1)
        setUpdateTester(t)
        foo3.updateComputed()
        foo3.updateComputed()
      })
    })

    t.end()
  })
}

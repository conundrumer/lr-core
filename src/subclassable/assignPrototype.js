export default function assignPrototype (Class, Subclassable, key) {
  Object.getOwnPropertyNames(Class.prototype)
  .forEach((k) => {
    let d = Object.getOwnPropertyDescriptor(Class.prototype, k)
    if (k !== 'constructor' && d.value instanceof Function) {
      Object.defineProperty(Subclassable.prototype, k, Object.assign({}, d, {
        value: function (...args) {
          return d.value.call(this[key], ...args)
        }
      }))
    }
  })
}

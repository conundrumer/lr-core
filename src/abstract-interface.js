// until decorators make it into node...
export function abstractClass (...abstractMethods) {
  return function decorator (target) {
    for (let method of abstractMethods) {
      target.prototype[method] = function () {
        throw new TypeError(`${this.constructor.name}.prototype.${method} is not implemented`)
      }
    }
  }
}

export function interfaceClass (target) {
  let abstractMethods = Object.getOwnPropertyNames(target.prototype)
    .filter((names) => names !== 'constructor')
  abstractClass(...abstractMethods)(target)
}

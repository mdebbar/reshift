const escope = require('escope')
const recast = require('recast')
const nt = recast.types.namedTypes

class ScopeManager {
  constructor(ast, options) {
    this.manager = escope.analyze(ast, options)
    this.currentScope = this.manager.acquire(ast)
  }

  acquire(node) {
    if (nt.Function.check(node)) {
      this.currentScope = this.manager.acquire(node)
    }
    return this.currentScope
  }

  release(node) {
    if (nt.Function.check(node)) {
      this.currentScope = this.manager.release(node)
    }
    return this.currentScope
  }

  wrap(node, fn) {
    this.acquire(node)
    const result = fn()
    this.release(node)
    return result
  }
}

module.exports = ScopeManager

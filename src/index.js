require('./def/capture')

const assert = require('assert')
const { parse, parseAsPartial } = require('./ast-parse')
const { print } = require('./ast-print')
const { createSubTreeMatcher } = require('./ast-matching')
const { applyTransform, normalizeTransform } = require('./ast-transform')

class ReShift {
  constructor(source) {
    this.ast = parse(source)
    this.transformations = []
  }

  add({ capture, transform, filter = () => true }) {
    assert(
      typeof capture === 'string',
      `Expecting 'capture' of type string, got ${typeof capture}`
    )
    assert(
      typeof transform === 'string' || typeof transform === 'function',
      `Expecting 'transform' of type string or function, got ${typeof transform}`
    )
    assert(
      typeof filter === 'function',
      `Expecting 'filter' of type function, got ${typeof filter}`
    )
    transform = normalizeTransform(transform)
    this.transformations.push({ capture, transform, filter })
    return this
  }

  applyTransformations() {
    const captureTrees = this.transformations.map(t => parseAsPartial(t.capture))
    const matchInSubTree = createSubTreeMatcher(this.ast, captureTrees)

    // `trees` holds all AST trees that still need to be considered for transformation.
    // Initially, it's the whole AST of the source. Subsequently, whenever a subtree is
    // transformed, we need to append it to this list to potentially apply other transforms on it.
    const trees = [this.ast]
    while (trees.length > 0) {
      const subtree = trees.shift()
      matchInSubTree(subtree, (path, capturedInfo, i) => {
        const { filter, transform } = this.transformations[i]
        if (filter(path, capturedInfo)) {
          applyTransform(path, capturedInfo, transform)
          trees.push(path.node)
        }
      })
    }
  }

  toSource(options) {
    this.applyTransformations()
    return print(this.ast, options)
  }

  toString() {
    return this.toSource()
  }
}

module.exports = function reShift(source) {
  return new ReShift(source)
}

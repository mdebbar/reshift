require('./def/capture')

const assert = require('assert')
const { parse, parseAsPartial } = require('./ast-parse')
const { print } = require('./ast-print')
const { matchSubTree } = require('./ast-matching')
const { applyTransform } = require('./ast-transform')

class ReShift {
  constructor(source) {
    this.ast = parse(source)
    this.transformations = []
  }

  add({ capture, transform, filter }) {
    assert(
      typeof capture === 'string',
      `Expecting 'capture' of type string, got ${typeof capture}`
    )
    assert(
      typeof transform === 'string' || typeof transform === 'function',
      `Expecting 'transform' of type string or function, got ${typeof transform}`
    )
    assert(
      typeof filter === 'undefined' || typeof filter === 'function',
      `Expecting 'filter' of type function, got ${typeof filter}`
    )
    this.transformations.push({ capture, transform, filter })
    return this
  }

  applyTransformation({ capture, transform, filter }) {
    const captureTree = parseAsPartial(capture)
    let matches = matchSubTree(this.ast, captureTree)
    if (filter) {
      matches = matches.filter(({ path, capturedInfo }) => filter(path, capturedInfo))
    }
    matches.forEach(({ path, capturedInfo }) => applyTransform(path, capturedInfo, transform))
  }

  toSource(options) {
    if (this.transformations.length > 0) {
      this.transformations.forEach(this.applyTransformation, this)
    }
    return print(this.ast, options)
  }

  toString() {
    return this.toSource()
  }
}

module.exports = function reShift(source) {
  return new ReShift(source)
}

require('./def/capture')

const { parse, parseAsPartial } = require('./ast-parse')
const { print } = require('./ast-print')
const { matchSubTree } = require('./ast-matching')
const { applyTransform } = require('./ast-transform')

class ReShift {
  constructor(source) {
    this.ast = parse(source)
    this.capturedMatches = null
  }

  capture(template) {
    const captureTree = parseAsPartial(template)
    this.capturedMatches = matchSubTree(this.ast, captureTree)
    return this
  }

  filter(fn, ctxt) {
    if (!this.capturedMatches) {
      throw 'You have to capture something before you can filter it'
    }

    this.capturedMatches = this.capturedMatches.filter(
      ({ path, capturedInfo }) => fn.call(ctxt, path, capturedInfo)
    )
    return this
  }

  transformInto(template) {
    if (!this.capturedMatches) {
      throw 'You have to capture something before you can transform it'
    }

    this.capturedMatches.forEach(
      ({ path, capturedInfo}) => applyTransform(path, capturedInfo, template)
    )
    return this
  }

  toSource(options) {
    return print(this.ast, options)
  }

  toString() {
    return this.toSource()
  }
}

module.exports = function reShift(source) {
  return new ReShift(source)
}

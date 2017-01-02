const AstTransformUtil = require('./ast-transform-util')
const { parseAsPartial } = require('./ast-parse')
const { deepCopy } = require('./ast-copy')

const util = new AstTransformUtil()

function applyTransform(path, capturedInfo, transformFn) {
  util.reset(path, capturedInfo)
  transformFn(util, capturedInfo)
}

function normalizeTransform(transform) {
  if (typeof transform === 'string') {
    transform = parseAsPartial(transform)
    return (util) => util.replace(deepCopy(transform))
  }
  return transform
}

module.exports = { applyTransform, normalizeTransform }

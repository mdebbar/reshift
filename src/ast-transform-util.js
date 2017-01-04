const AstTransformer = require('./ast-transformer')
const { parseAsPartial } = require('./ast-parse')
const { deepCopy } = require('./ast-copy')

const transformer = new AstTransformer()

function applyTransform(path, capturedInfo, transformFn) {
  transformer.reset(path, capturedInfo)
  transformFn(transformer)
  // TODO: do this
  // return transformer.didTransform
}

function normalizeTransform(transform) {
  if (typeof transform === 'string') {
    const transformTree = parseAsPartial(transform)
    return function normalizedTransform(t) {
      t.replace(deepCopy(transformTree))
    }
  }
  return transform
}

module.exports = { applyTransform, normalizeTransform }

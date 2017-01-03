const AstTransformer = require('./ast-transformer')
const { parseAsPartial } = require('./ast-parse')
const { deepCopy } = require('./ast-copy')

const transformer = new AstTransformer()

function applyTransform(path, capturedInfo, transformFn) {
  transformer.reset(path, capturedInfo)
  transformFn(transformer)
}

function normalizeTransform(transform) {
  if (typeof transform === 'string') {
    transform = parseAsPartial(transform)
    return (t) => t.replace(deepCopy(transform))
  }
  return transform
}

module.exports = { applyTransform, normalizeTransform }

const AstTransformer = require('./AstTransformer')
const AstFilterer = require('./AstFilterer')
const { parseAsPartial } = require('./ast-parse')
const { deepCopy } = require('./ast-copy')


function applyTransform(path, captured, transformFn) {
  // TODO: [optimization] Find a way to reuse these instances without causing issues.
  const transformer = new AstTransformer(path, captured)
  const filterer = new AstFilterer(path, captured)

  transformFn(transformer, filterer)
  return transformer.didTransform
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

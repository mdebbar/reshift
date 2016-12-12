/**
 * Implements transformers for ast types. For definitions of all ast types, look
 * at https://github.com/benjamn/ast-types
 */

const t = require('recast/lib/types')
const nt = t.namedTypes

const typeTransformers = {}
module.exports = typeTransformers

Object.keys(nt).forEach(function createTransformerForType(type) {
  typeTransformers[type] = (node) => Object.assign({}, node, { type })
})

/**
 * Implements matchers for ast types. For definitions of all ast types, look
 * at https://github.com/benjamn/ast-types
 */

const nt = require('recast/lib/types').namedTypes
const { matchPattern } = require('./util')

const typeMatchers = {}
module.exports = typeMatchers

Object.keys(nt).forEach(function createMatcherForType(type) {
  typeMatchers[type] = (pattern) => (node) => {
    if (!nt[type].check(node)) {
      return false
    }
    if (pattern) {
      return matchPattern(node, pattern)
    }
    return true
  }
})

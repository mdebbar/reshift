const nt = require('recast/lib/types').namedTypes
const matchPattern = require('../traverser2/matchPattern')

/**
 * Implements matchers for ast types. For definitions of all ast types, look
 * at https://github.com/benjamn/ast-types
 */

const typeMatchers = {}
module.exports = typeMatchers

Object.keys(nt).forEach(function createMatcherForType(type) {
  typeMatchers[type] = (pattern) => (value, path) => {
    if (!nt[type].check(value)) {
      return false
    }
    if (pattern) {
      return matchPattern(path, pattern)
    }
    return true
  }
})

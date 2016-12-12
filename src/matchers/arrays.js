const matchPattern = require('../traverser2/matchPattern')

/**
 * Implements matchers for arrays.
 */
module.exports = {
  // FIX: Pass a path instance to `matchPattern`.
  every: (itemMatcher) => (propArray) => {
    if (!Array.isArray(propArray)) {
      throw 'Trying to use an array matcher on a non-array'
    }
    return propArray.every((prop) => matchPattern(prop, itemMatcher))
  },

  some: (itemMatcher) => (propArray) => {
    if (!Array.isArray(propArray)) {
      throw 'Trying to use an array matcher on a non-array'
    }
    return propArray.some((prop) => matchPattern(prop, itemMatcher))
  },

  // TODO: exactly(n, itemMatcher)
  // TODO: atLeast(n, itemMatcher) // can replace `some()` ==> atLeast(1, itemMatcher)
  // TODO: atMost(n, itemMatcher)
}

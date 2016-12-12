/**
 * Implements matchers for arrays.
 */

const { matchPattern } = require('./util')

module.exports = {
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

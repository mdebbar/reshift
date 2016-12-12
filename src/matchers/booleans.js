/**
 * Implements matchers for boolean operations.
 */

const { matchPattern } = require('./util')

module.exports = {
  or: (...matchers) => (prop) => {
    return matchers.some((matcher) => matchPattern(prop, matcher))
  },

  and: (...matchers) => (prop) => {
    return matchers.every((matcher) => matchPattern(prop, matcher))
  },

  not: (matcher) => (prop) => {
    return !matchPattern(prop, matcher)
  },

  // TODO: do we need XOR?
}

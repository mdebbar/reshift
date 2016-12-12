/**
 * Implements matchers for boolean operations.
 */

module.exports = {
  or: (...matchers) => (prop, matchProp) => {
    return matchers.some((matcher) => matchProp(prop, matcher))
  },

  and: (...matchers) => (prop, matchProp) => {
    return matchers.every((matcher) => matchProp(prop, matcher))
  },

  not: (matcher) => (prop, matchProp) => {
    return !matchProp(prop, matcher)
  },

  // TODO: do we need XOR?
}

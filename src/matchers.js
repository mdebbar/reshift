const t = require('recast/lib/types').namedTypes

const m = {}
module.exports = m

// Create matchers for all ast types
Object.keys(t).forEach(function createMatcherForType(type) {
  m[type] = (conditions) => (node) => {
    if (!t[type].check(node)) {
      return false
    }
    if (conditions) {
      return matchNode(node, conditions)
    }
    return true
  }
})

// Add a matcher for every array item
m.every = (itemMatcher) => (propArray) => {
  if (!Array.isArray(propArray)) {
    throw 'Trying to use an array matcher on a non-array'
  }
  return propArray.every((prop) => matchProp(prop, itemMatcher))
}

// Add an OR matcher
m.or = (...matchers) => (prop) => {
  return matchers.some((matcher) => matchProp(prop, matcher))
}

function matchNode(node, conditions) {
  // TODO: [optimize] run literal conditions first since they are cheap.
  return Object.keys(conditions).every(
    (key) => matchProp(node[key], conditions[key])
  )
}

function matchProp(prop, matcher) {
  if (typeof matcher === 'function') {
    return matcher(prop)
  }
  return prop === matcher
}

const t = require('recast/lib/types').namedTypes

const matchers = {}
module.exports = matchers

// Add matchers for ast types
Object.keys(t).forEach(function createMatcherForType(type) {
  matchers[type] = (conditions) => (node) => {
    if (!t[type].check(node)) {
      return false
    }
    if (conditions) {
      return matchNode(node, conditions)
    }
    return true
  }
})

// Add an array matcher
matchers.each = (itemMatcher) => (propArray) => {
  if (!Array.isArray(propArray)) {
    throw 'Trying to use an array matcher on a non-array'
  }
  return propArray.every(itemMatcher)
}

function matchNode(node, conditions) {
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

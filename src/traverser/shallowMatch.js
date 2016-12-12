/**
 * Possible return values:
 * - true: the node matches the pattern.
 * - object/array: a map of patterns that need to be matched with node properties.
 */
function shallowMatch(node, pattern) {
  switch (typeof pattern) {
    case 'function':
      var matchResult = pattern(node)
      if (!isAcceptableMatchResult(matchResult)) {
        debugger
        throw `function pattern returned ${matchResult}`
      }
      return matchResult
    case 'undefined':
      return node == null
    case 'object':
      // `pattern` is either null, object or array.
      if (pattern === null) {
        return node == null
      }
      return pattern
    default:
      node === pattern
  }
}

function isAcceptableMatchResult(result) {
  const type = typeof result
  return result !== null && (type === 'boolean' || type === 'object')
}

module.exports = shallowMatch

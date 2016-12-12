/**
 *
 */
function matchPattern(node, pattern, matchProp) {
  while (pattern && pattern !== true) {
    switch (typeof pattern) {
      case 'function':
        // `pattern()` could return another pattern to match against.
        pattern = pattern(node)
        break
      case 'undefined':
        return node == null
      case 'object':
        // `pattern` is either null, object or array.
        if (pattern === null) {
          return node == null
        }
        return Object.keys(pattern).every(
          (key) => matchProp(node, key, pattern[key])
        )
      default:
        return node === pattern
    }
  }
  return pattern
}

module.exports = matchPattern

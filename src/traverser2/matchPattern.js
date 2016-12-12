/**
 *
 */
function matchPattern(path, pattern) {
  if (!path) {
    return false
  }

  switch (typeof pattern) {
    case 'function':
      return pattern(path.value, path)
    case 'object':
      // `pattern` is either null, object or array.
      return Object.keys(pattern).every(
        (key) => matchPattern(path.get(key), pattern[key])
      )
    default:
      return path.value === pattern
  }
}

module.exports = matchPattern

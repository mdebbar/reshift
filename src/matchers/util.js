function matchPattern(prop, pattern) {
  switch (typeof pattern) {
    case 'function':
      return pattern(prop)
    case 'object':
      if (pattern === null) {
        return prop == null
      }
      // It's ok to do this since `matchPattern` works fine on objects and arrays.
      // TODO: [optimization] match literal patterns first since they are cheap.
      return Object.keys(pattern).every(
        (key) => matchPattern(prop[key], pattern[key])
      )
    case 'undefined':
      return prop == null
    default:
      return prop === pattern
  }
}

module.exports = { matchPattern }

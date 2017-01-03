function deepCopy(ast) {
  if (!ast || typeof ast !== 'object') {
    return ast
  }

  const newAst = {}
  const toCopy = [{ src: ast, dest: newAst }]
  while (toCopy.length > 0) {
    const { src, dest } = toCopy.shift()
    for (const name in src) {
      if (!src.hasOwnProperty(name)) {
        continue
      }
      const value = src[name]
      if (value && typeof value === 'object' && name !== 'loc') {
        dest[name] = Array.isArray(value) ? [] : {}
        toCopy.push({ src: value, dest: dest[name] })
      } else if (typeof value !== 'function') {
        dest[name] = value
      }
    }
  }
  return newAst
}

module.exports = { deepCopy }

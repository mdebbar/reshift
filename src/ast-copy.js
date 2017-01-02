const { types } = require('recast')

function deepCopy(ast) {
  if (!ast || typeof ast !== 'object') {
    return ast
  }

  const newAst = {}
  const toCopy = [{ src: ast, dest: newAst }]
  while (toCopy.length > 0) {
    const { src, dest } = toCopy.shift()
    const fieldNames = types.getFieldNames(src)
    for (let i = 0; i < fieldNames.length; i++) {
      const name = fieldNames[i]
      const value = src[name]
      if (value && typeof value === 'object') {
        dest[name] = Array.isArray(value) ? [] : {}
        toCopy.push({ src: value, dest: dest[name] })
      } else {
        dest[name] = value
      }
    }
  }
  return newAst
}

module.exports = { deepCopy }

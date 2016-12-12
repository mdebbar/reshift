const findAllMatches = require('./findAllMatches')

function matchAndTransform(ast, pattern, transform) {
  findAllMatches(ast, pattern, (path) => {
    const transformed = transform(path)
    if (typeof transformed !== 'undefined') {
      path.replace(transformed)
    }
  })
  return ast
}

function getMatchCount(ast, pattern) {
  let matchCount = 0
  findAllMatches(ast, pattern, () => {
    matchCount++
  })
  return matchCount
}

function getAllMatches(ast, pattern) {
  const matches = []
  findAllMatches(ast, pattern, (path) => {
    matches.push(path.value)
  })
  return matches
}

module.exports = { matchAndTransform, getMatchCount, getAllMatches }

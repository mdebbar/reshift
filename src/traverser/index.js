const findAllMatches = require('./findAllMatches')

function matchAndTransform(ast, pattern, transform) {
  const astCopy = Object.assign({}, ast)
  findAllMatches(astCopy, pattern, (node, parent, matchedKey) => {
    parent[matchedKey] = transform(node)
  })
  return astCopy
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
  findAllMatches(ast, pattern, (node) => {
    // console.log('===============================')
    // console.log('FOUND MATCH:')
    // console.log(node)
    // console.log('===============================')
    matches.push(node)
  })
  return matches
}

module.exports = { matchAndTransform, getMatchCount, getAllMatches }

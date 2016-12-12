const types = require('recast/lib/types')
const matchPattern = require('./matchPattern')
// const matchScope = require('./matchScope')

function findAllMatches(ast, pattern, callback) {
  types.visit(ast, { visitNode })

  function visitNode(path) {
    if (matchPattern(path, pattern)) {
      callback(path)
      return false
    }
    this.traverse(path)
  }
}

module.exports = findAllMatches

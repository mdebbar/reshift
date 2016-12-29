const recast = require('recast')

function print(ast, options) {
  return recast.print(ast, options).code
}

module.exports = { print }

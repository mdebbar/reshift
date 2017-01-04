const { namedTypes: n } = require('recast/lib/types')
const { parseAsPartial } = require('./ast-parse')
const { hasMatchesInSubtree } = require('./ast-matching')

class AstFilterer {
  reset(ast, path, captured) {
    this.ast = ast
    this.path = path
    this.captured = captured
    this.namedTypes = n
  }

  has(template) {
    const templateTree = parseAsPartial(template)
    return hasMatchesInSubtree(this.ast, this.path.value, templateTree)
  }
}

module.exports = AstFilterer

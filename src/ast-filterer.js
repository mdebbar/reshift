const { namedTypes: n } = require('recast/lib/types')
const { parseAsPartial } = require('./ast-parse')
const { hasMatchesInSubtree } = require('./ast-matching')

class AstFilterer {
  reset(ast, path, captured) {
    this.ast = ast
    this.path = path
    this.captured = captured
    this.types = n
  }

  contains(node, template) {
    if (typeof node === 'string' && typeof template === 'undefined') {
      template = node
      node = this.path.value
    }
    const templateTree = parseAsPartial(template)
    return hasMatchesInSubtree(this.ast, node, templateTree)
  }
}

module.exports = AstFilterer

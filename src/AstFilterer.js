const AstUtil = require('./AstUtil')
const { hasMatchesInSubtree } = require('./ast-matching')
const { findRootPath } = require('./ast-find')

class AstFilterer extends AstUtil {
  /**
   * Check whether the tree contains a match for the given `template`.
   * @param path: NodePath|AST the path/node to be searched (optional)
   * @param template: String|AST the template of code to be matched
   */
  contains(...args) {
    const { path, template } = this._getPathAndTemplateNoCaptured(...args)
    const root = findRootPath(path)
    return hasMatchesInSubtree(root, path, template)
  }
}

module.exports = AstFilterer

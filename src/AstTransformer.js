const { builders: b, namedTypes: n } = require('recast/lib/types')
const { findAscendant, findDescendant } = require('./ast-find')
const AstUtil = require('./AstUtil')

class AstTransformer extends AstUtil {
  constructor(path, captured) {
    super(path, captured)
    this.didTransform = false
  }

  /**
   * @param path: NodePath|AST the path/node to be replaced (optional)
   * @param template: String|AST the template of replacement code
   */
  replace(...args) {
    this.didTransform = true
    let { path, template } = this._getPathAndTemplate(...args)

    // Handle some tricky cases when replacing expressions/statements.
    if (n.Expression.check(template)) {
      if (n.ExpressionStatement.check(path.value)) {
        // Replacing an ExpressionStatement with an Expression
        // ==> keep the wrapper ExpressionStatement and replace its inner `expression`.
        path = path.get('expression')
      } else if (n.Statement.check(path.value)) {
        // Replacing a Statement with an Expression
        // ==> wrap the template inside an ExpressionStatement.
        template = b.expressionStatement(template)
      }
    } else if (n.ExpressionStatement.check(path.parentPath.value)) {
      // Replacing an `expression` wrapped inside an ExpressionStatement with a non-Expression
      // ==> replace the whole ExpressionStatement wrapper.
      path = path.parentPath
    }

    if (template) {
      path.replace(template)
    } else {
      path.prune()
    }
    return this
  }

  /**
   * @param path: NodePath|AST the path/node to prepend into (optional)
   * @param template: String|AST the template of code to be prepended
   */
  prepend(...args) {
    let { path, template } = this._getPathAndTemplate(...args)
    path = findDescendant(path, 1, (p) => Array.isArray(p.value))
    path.unshift(template)
  }

  /**
   * @param path: NodePath|AST the path/node to insert before (optional)
   * @param template: String|AST the template of code to be inserted
   */
  insertBefore(...args) {
    return this._insert('insertBefore', ...args)
  }

  /**
   * @param path: NodePath|AST the path/node to insert after (optional)
   * @param template: String|AST the template of code to be inserted
   */
  insertAfter(...args) {
    return this._insert('insertAfter', ...args)
  }

  /**
   *
   */
  chain(subtree, shifters) {
    // TODO: find a solution to the cyclic dependency.
    const { reShiftAstSubtree } = require('./reshift')
    if (reShiftAstSubtree(this.path, subtree, shifters)) {
      this.didTransform = true
    }
  }

  _insert(insertMethod, ...args) {
    this.didTransform = true
    const { path, template } = this._getPathAndTemplate(...args)

    const element = findAscendant(path, 0, (p) => typeof p.name === 'number')
    let insertList = Array.isArray(template) ? template : [template]

    // In BlockStatement's we can't put Expressions. We need to wrap them in ExpressionStatement.
    if (n.BlockStatement.check(element.parent.node)) {
      insertList = insertList.map(item =>
        n.Expression.check(item) ? b.expressionStatement(item) : item
      )
    }
    element[insertMethod](...insertList)
    return this
  }
}

module.exports = AstTransformer

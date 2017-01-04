const { builders: b, namedTypes: n } = require('recast/lib/types')
const { parseAsPartial } = require('./ast-parse')
const { replaceCaptureNodes } = require('./ast-capture')
// const { preOrder } = require('./ast-traverse')

class AstTransformer {
  reset(path, captured) {
    this.path = path
    this.captured = captured
    this.namedTypes = n
  }

  replace(replacement) {
    replacement = this._processReplacement(replacement)
    let path = this.path

    // Handle some tricky cases when replacing expressions/statements.
    if (n.Expression.check(replacement)) {
      if (n.ExpressionStatement.check(path.value)) {
        // Replacing an ExpressionStatement with an Expression
        // ==> keep the wrapper ExpressionStatement and replace its inner `expression`.
        path = path.get('expression')
      } else if (n.Statement.check(path.value)) {
        // Replacing a Statement with an Expression
        // ==> wrap the replacement inside an ExpressionStatement.
        replacement = b.expressionStatement(replacement)
      }
    } else if (n.ExpressionStatement.check(path.parentPath.value)) {
      // Replacing an `expression` wrapped inside an ExpressionStatement with a non-Expression
      // ==> replace the whole ExpressionStatement wrapper.
      path = path.parentPath
    }

    if (replacement) {
      path.replace(replacement)
    } else {
      path.prune()
    }
    return this
  }

  insertBefore(replacement) {
    replacement = this._processReplacement(replacement)
    replacement = Array.isArray(replacement) ? replacement : [replacement]

    const element = this._findNearestListElement()
    element.insertBefore(...replacement)
    return this
  }

  insertAfter(replacement) {
    replacement = this._processReplacement(replacement)
    replacement = Array.isArray(replacement) ? replacement : [replacement]

    const element = this._findNearestListElement()
    element.insertAfter(...replacement)
    return this
  }

  _processReplacement(replacement) {
    if (typeof replacement === 'string') {
      replacement = parseAsPartial(replacement)
    }
    // TODO: Should we remove all formatting info from the replacement tree?
    // preOrder(replacement, (path) => {
    //   delete path.node.loc
    //   delete path.node.start
    //   delete path.node.end
    // })
    return replaceCaptureNodes(replacement, this.captured)
  }

  /**
   * Find the nearest parent that's a list item. This is useful when inserting
   * a node before/after another.
   */
  _findNearestListElement() {
    let nearestListElement = this.path
    while (nearestListElement && typeof nearestListElement.name !== 'number') {
      nearestListElement = nearestListElement.parentPath
    }

    if (!nearestListElement) {
      // This should never happen, but being defensive in case it does.
      throw new Error('Trying to insert')
    }
    return nearestListElement
  }
}

module.exports = AstTransformer

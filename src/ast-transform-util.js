const { builders: b, namedTypes: n } = require('recast/lib/types')
const { parseAsPartial } = require('./ast-parse')
const { preOrder, preOrderWithType } = require('./ast-traverse')

class AstTransformUtil {
  reset(path, capturedInfo) {
    this.path = path
    this.capturedInfo = capturedInfo
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

    const element = this._getNearestListElement()
    element.insertBefore(...replacement)
    return this
  }

  insertAfter(replacement) {
    replacement = this._processReplacement(replacement)
    replacement = Array.isArray(replacement) ? replacement : [replacement]

    const element = this._getNearestListElement()
    element.insertAfter(...replacement)
    return this
  }

  _processReplacement(replacement) {
    if (typeof replacement === 'string') {
      replacement = parseAsPartial(replacement)
    }
    // Remove all formatting info from the replacement tree.
    preOrder(replacement, (path) => {
      delete path.node.loc
      delete path.node.start
      delete path.node.end
    })
    return this._replaceCaptureNodes(replacement)
  }

  _replaceCaptureNodes(ast) {
    if (n.Capture.check(ast)) {
      return this._getCapturedNode(ast.name)
    }

    preOrderWithType(ast, 'Capture', (path) => {
      const capturedNode = this._getCapturedNode(path.node.name)
      // TODO: maybe use `path.prune()` when `capturedNode` is falsey?
      path.replace(capturedNode)
    })
    return ast
  }

  _getCapturedNode(name) {
    if (!(name in this.capturedInfo)) {
      throw `Trying to use {{${name}}} in the transform but it wasn't captured.`
    }
    return this.capturedInfo[name]
  }

  _getNearestListElement() {
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

module.exports = AstTransformUtil

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

  // TODO: support passing which node to be replaced.
  replace(replacement) {
    replacement = this.build(replacement)
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

  insertBefore(item) {
    return this._insert('insertBefore', item)
  }

  insertAfter(item) {
    return this._insert('insertAfter', item)
  }

  chain(subtree, shifters) {
    // TODO: find a solution to the cyclic dependency.
    const { reShiftAstSubtree } = require('./ast-shifter')
    return reShiftAstSubtree(this.path.node, subtree, shifters)
  }

  build(template) {
    if (typeof template === 'string') {
      template = parseAsPartial(template)
    }
    // TODO: Should we remove all formatting info from the template tree?
    // preOrder(template, (path) => {
    //   delete path.node.loc
    //   delete path.node.start
    //   delete path.node.end
    // })
    return replaceCaptureNodes(template, this.captured)
  }

  _insert(insertMethod, item) {
    item = this.build(item)
    item = Array.isArray(item) ? item : [item]

    const element = this._findNearestListElement()
    element[insertMethod](...item)
    return this
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

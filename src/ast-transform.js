const { builders: b, namedTypes: n } = require('recast/lib/types')
const { parseAsPartial } = require('./ast-parse')
const { preOrder } = require('./ast-traverse')

function applyTransform(path, capturedInfo, transform) {
  if (typeof transform === 'function') {
    transform = transform(path, capturedInfo)
    if (typeof transform === 'undefined') {
      return
    }
  }
  applyTemplateTransform(path, capturedInfo, transform)
}

function applyTemplateTransform(path, capturedInfo, transform) {
  let transformTree = parseAsPartial(transform)
  insertCapturedInfo(transformTree, capturedInfo)

  // Handle some tricky cases when replacing expressions/statements.

  if (n.Expression.check(transformTree)) {
    if (n.ExpressionStatement.check(path.value)) {
      // Replacing an ExpressionStatement with an Expression
      // ==> keep the wrapper ExpressionStatement and replace its inner `expression`.
      path = path.get('expression')
    } else if (n.Statement.check(path.value)) {
      // Replacing a Statement with an Expression
      // ==> wrap the replacement inside an ExpressionStatement.
      transformTree = b.expressionStatement(transformTree)
    }
  } else if (n.ExpressionStatement.check(path.parentPath.value)) {
    // Replacing an `expression` wrapped inside an ExpressionStatement with a non-Expression
    // ==> replace the whole ExpressionStatement wrapper.
    path = path.parentPath
  }

  if (transformTree) {
    path.replace(transformTree)
  } else {
    path.prune()
  }
}

function insertCapturedInfo(ast, info) {
  // TODO: [optimization] use `type.visit(ast, { visitCapture() {...} })`
  preOrder(ast, function insertCapturedInfoVisitor(path) {
    if (n.Capture.check(path.node)) {
      const { name } = path.node
      if (!(name in info)) {
        throw `Trying to use {{${name}}} in the transform but it wasn't captured.`
      }
      path.replace(info[name])
    }
  })
}

module.exports = { applyTransform }

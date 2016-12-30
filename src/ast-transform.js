const { namedTypes } = require('recast/lib/types')
const { parseAsPartial } = require('./ast-parse')
const { preOrder } = require('./ast-traverse')

function applyTransform(path, capturedInfo, transform) {
  const type = typeof transform
  if (type === 'string') {
    applyTemplateTransform(path, capturedInfo, transform)
  } else if (type === 'function') {
    // TODO: implement
  } else {
    throw `ReShift.transformInto() expects a string or function, got ${type} instead.`
  }
}

function applyTemplateTransform(path, capturedInfo, template) {
  const parsedTemplate = parseAsPartial(template)
  insertCapturedInfo(parsedTemplate, capturedInfo)
  // If the matched node is wrapped in an ExpressionStatement, we should replace the whole statement.
  if (namedTypes.ExpressionStatement.check(path.parentPath.value) &&
      !namedTypes.Expression.check(parsedTemplate)) {
    path = path.parentPath
  }
  path.replace(parsedTemplate)
}

function insertCapturedInfo(ast, info) {
  preOrder(ast, function insertCapturedInfoVisitor(path) {
    if (namedTypes.Capture.check(path.node)) {
      const { name } = path.node
      if (!(name in info)) {
        throw `Trying to use {{${name}}} in the transform but it wasn't captured.`
      }
      path.replace(info[name])
    }
  })
}

module.exports = { applyTransform }

const { namedTypes: n } = require('recast/lib/types')
const { preOrderType } = require('./ast-traverse')

function replaceCaptureNodes(ast, captured) {
  if (n.Capture.check(ast)) {
    return getCapturedNode(captured, ast.name)
  }

  preOrderType(ast, 'Capture', (path) => {
    const capturedNode = getCapturedNode(captured, path.node.name)
    if (capturedNode) {
      path.replace(capturedNode)
    } else {
      path.prune()
    }
  })
  return ast
}

function getCapturedNode(captured, name) {
  if (!(name in captured)) {
    throw `Trying to use replace {{${name}}} but it wasn't captured.`
  }
  return captured[name]
}

module.exports = { replaceCaptureNodes }

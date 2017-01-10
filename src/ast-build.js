const { namedTypes: n } = require('recast/lib/types')
const { preOrderType } = require('./ast-traverse')
const { parseAsPartial } = require('./ast-parse')

function build(template, captured) {
  if (typeof template === 'string') {
    template = parseAsPartial(template)
  }
  // TODO: Should we remove all formatting info from the template tree?
  // preOrder(template, (path) => {
  //   delete path.node.loc
  //   delete path.node.start
  //   delete path.node.end
  // })
  if (captured) {
    return _replaceCaptureNodes(template, captured)
  } else {
    return template
  }
}

function _replaceCaptureNodes(ast, captured) {
  if (n.Capture.check(ast)) {
    return _getCapturedNode(captured, ast.name)
  }

  preOrderType(ast, 'Capture', (path) => {
    const capturedNode = _getCapturedNode(captured, path.node.name)
    if (capturedNode) {
      path.replace(capturedNode)
    } else {
      path.prune()
    }
  })
  return ast
}

function _getCapturedNode(captured, name) {
  if (captured && typeof captured === 'object' && name in captured) {
    return captured[name]
  }
  throw new Error(`Trying to replace {{${name}}} but it wasn't captured.`)
}

module.exports = { build }

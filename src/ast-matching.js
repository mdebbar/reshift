const types = require('recast/lib/types')
const { namedTypes } = types
const { postOrder } = require('./ast-traverse')

/**
 * Inside the `ast`, find all matches to `subtree`. The traversal is post-order
 * so inner nodes are matched first.
 */
function matchSubTree(ast, subtree) {
  const matches = []
  postOrder(ast, function matchSubTreeVisitor(path) {
    let capturedInfo
    if ((capturedInfo = compareAndCapture(path, subtree))) {
      matches.push({ path, capturedInfo })
    }
  })
  return matches
}

/**
 * Compares a `path` with a `subtree` and returns the result. If they match,
 * it returns an object containing all captured nodes. If no match, returns false.
 *
 * This implementation is iterative (using a queue) to avoid deep recursive calls.
 */
function compareAndCapture(path, subtree) {
  if (!namedTypes[path.node.type].check(subtree)) {
    return false
  }

  const capturedInfo = {}
  const paths = [{ path, subtree }]

  while (paths.length > 0) {
    const { path, subtree } = paths.shift()
    const { value } = path

    if (namedTypes.Capture.check(subtree)) {
      capturedInfo[subtree.name] = value
    } else if (typeof value === 'object' &&
               typeof subtree === 'object' &&
               value !== null &&
               subtree !== null) {
      types.getFieldNames(value).forEach((fieldName) => {
        paths.push({ path: path.get(fieldName), subtree: types.getFieldValue(subtree, fieldName) })
      })
    } else if (value != subtree) {
      return false
    }
  }
  return capturedInfo
}

module.exports = { matchSubTree }

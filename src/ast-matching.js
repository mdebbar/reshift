const types = require('recast/lib/types')
const { namedTypes } = types
const { postOrderSubtree } = require('./ast-traverse')

function createMatcher(ast, captureTrees, callback) {

  function visitor(path) {
    for (let i = 0; i < captureTrees.length; i++) {
      const capturedInfo = compareAndCapture(path, captureTrees[i])
      if (!capturedInfo) {
        continue
      }
      // The callback can return false to indicate that it didn't find this match satisfying.
      // In that case, we should continue looking for another match and not break.
      if (callback(path, capturedInfo, i) === false) {
        continue
      }
      break // from the for-loop
    }
  }

  return function findMatchInSubTree(subtree) {
    postOrderSubtree(ast, subtree, visitor)
  }
}

function hasMatchesInSubtree(ast, subtree, matchTree) {
  let matchFound = false
  const findMatchInSubTree = createMatcher(ast, [matchTree], onMatch)

  function onMatch() {
    matchFound = true
  }

  findMatchInSubTree(subtree)
  return matchFound
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
      // TODO: if 2 captures have the same name, we should check if they are equal.
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

module.exports = { createMatcher, hasMatchesInSubtree }

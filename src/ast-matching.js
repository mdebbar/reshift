const types = require('recast/lib/types')
const { namedTypes } = types
const { preOrderSubtree, preOrderTwo } = require('./ast-traverse')

function findMatchInSubTree(ast, subtree, captureTrees, callback) {
  let startOver = true

  function matchingVisitor(path) {
    for (let i = 0; i < captureTrees.length; i++) {
      const captured = compareAndCapture(path.value, captureTrees[i])
      if (captured) {
        // The callback can return true to indicate that a transform has been applied.
        // In that case, we should re-traverse the tree looking for new matches.
        const retValue = callback(path, captured, i)
        if (retValue === true) {
          // A transform has been successfully applied
          // ==> start over and cancel the current traversal.
          startOver = true
          return false
        }
        // The callback can also return false to indicate that it doesn't want
        // any more matches.
        if (retValue === false) {
          this.abort()
        }
      }
    }
  }

  while (startOver) {
    startOver = false
    preOrderSubtree(ast, subtree, matchingVisitor)
  }
}

function hasMatchesInSubtree(ast, subtree, matchTree) {
  let matchFound = false
  findMatchInSubTree(ast, subtree, [matchTree], () => {
    matchFound = true
    return false
  })
  return matchFound
}

/**
 * Compares a `path` with a `subtree` and returns the result. If they match,
 * it returns an object containing all captured nodes. If no match, returns false.
 *
 * This implementation is iterative (using a queue) to avoid deep recursive calls.
 */
function compareAndCapture(ast, captureTree) {
  // TODO: [optimization] bail out as fast as possible
  let captured = {}

  function compareAndCaptureVisitor(path1, path2) {
    const [val1, val2] = [path1.value, path2.value]
    if (namedTypes.Capture.check(val2)) {
      // TODO: if 2 captures have the same name, we should check if they are equal.
      captured[val2.name] = val1
      // Tell the traverser to skip the children of current node.
      return false
    }
    if (val1 === null || val2 === null || typeof val1 !== 'object' || typeof val2 !== 'object') {
      if (val1 != val2) {
        captured = false
        this.abort()
      }
    }
  }

  preOrderTwo(ast, captureTree, compareAndCaptureVisitor)
  return captured
}

module.exports = { findMatchInSubTree, hasMatchesInSubtree }

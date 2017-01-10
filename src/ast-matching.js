const types = require('recast/lib/types')
const { namedTypes } = types
const { preOrderSubtree, preOrderTwo } = require('./ast-traverse')

const emptyFn = () => {}

function findMatchesInSubTree(ast, subtree, captureTrees, callback) {
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
          // Comment the above 2 lines if you want no re-traversals.
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
  preOrderSubtree(ast, subtree, function matchingVisitor(path) {
    if (compare(path.value, matchTree)) {
      matchFound = true
      this.abort()
    }
  })
  return matchFound
}

/**
 * Compares a `tree` with a `captureTree` and returns either the captured info or false if the
 * comparison fails.
 */
function compareAndCapture(tree, captureTree) {
  const captured = {}
  const equal = compare(tree, captureTree, function onCapture(captureNode, matchingNode) {
    captured[captureNode.name] = matchingNode
  })
  return equal && captured
}

/**
 * Compares a `tree` with a `captureTree` and returns a boolean. Whenever a capture node is found,
 * the `onCapture` callback will be called with capture node and the matching node from `tree`.
 */
function compare(tree, captureTree, onCapture = emptyFn) {
  // TODO: [optimization] bail out as fast as possible
  let equal = true

  preOrderTwo(tree, captureTree, function compareVisitor(path1, path2) {
    const [val1, val2] = [path1.value, path2.value]
    if (namedTypes.Capture.check(val2)) {
      // TODO: if 2 captures have the same name, we should check if they are equal.
      onCapture(val2, val1)
      // Tell the traverser to skip the children of current node.
      return false
    }
    if (val1 === null || val2 === null || typeof val1 !== 'object' || typeof val2 !== 'object') {
      if (val1 != val2) {
        equal = false
        this.abort()
      }
    }
  })

  return equal
}

module.exports = { findMatchesInSubTree, hasMatchesInSubtree }

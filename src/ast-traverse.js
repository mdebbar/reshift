const types = require('recast/lib/types')
const { namedTypes: n, NodePath } = types

const ABORT_EXCEPTION = Symbol('ABORT_EXCEPTION')

/**
 * Low-level pre-order (breadth-first) traversal of an AST.
 * It invokes `callback` for everything in the AST, not just nodes.
 *
 * The callback can return false to skip the traversal of the current node's children.
 * It can also call `this.abort()` to stop the whole traversal.
 */
function preOrder(ast, callback) {
  preOrderTwo(ast, null, function(path1) {
    return callback.call(this, path1)
  })
}

/**
 * Traverses two AST trees and calls `callback` on each pair of paths.
 */
function preOrderTwo(ast1, ast2, callback) {
  // https://github.com/benjamn/ast-types/blob/d3b32/lib/path-visitor.js#L126
  const root1 = (ast1 instanceof NodePath) ? ast1 : new NodePath({ root: ast1 }).get('root')
  const root2 = (ast2 instanceof NodePath) ? ast2 : new NodePath({ root: ast2 }).get('root')

  // A queue that keeps pairs of paths to be traversed.
  const queue = []
  queue.push([root1, root2])

  let didAbort = false
  const context = {
    abort() {
      didAbort = true
      throw ABORT_EXCEPTION
    },
  }

  while (queue.length > 0) {
    const [path1, path2] = queue.shift()

    let traverseChildren = true
    try {
      traverseChildren = callback.call(context, path1, path2)
    } finally {
      if (didAbort) {
        return false // eslint-disable-line no-unsafe-finally
      }
    }

    if (traverseChildren !== false) {
      const usedKeys = {}
      const appendChildrenPair = (key) => {
        if (!usedKeys[key]) {
          usedKeys[key] = true
          queue.push([path1.get(key), path2.get(key)])
        }
      }
      getChildKeys(path1.value).forEach(appendChildrenPair)
      getChildKeys(path2.value).forEach(appendChildrenPair)
    }
  }
}

/**
 * Pre-order traversal with filtering by node type.
 */
function preOrderType(ast, type, callback) {
  preOrder(ast, function preOrderTypeVisitor(path) {
    if (n[type].check(path.value)) {
      return callback.call(this, path)
    }
  })
}

/**
 * Pre-order (breadth-first) traversal of a subtree inside an AST.
 */
function preOrderSubtree(ast, subtree, callback) {
  const path = getNodePath(ast, subtree)
  preOrderType(path, 'Node', callback)
}

/**
 * Get the path of a `subtree` inside an AST.
 */
function getNodePath(ast, node) {
  if (node instanceof NodePath) {
    return node
  }

  let nodePath
  preOrder(ast, function findSubtreePathVisitor(path) {
    if (path.value === node) {
      nodePath = path
      this.abort()
    }
  })
  return nodePath
}

/**
 * Get keys for children of a value in an AST. The "value" could be anything
 * inside the AST (e.g. node, array, etc).
 */
function getChildKeys(value) {
  if (!value || typeof value !== 'object') {
    return []
  }

  if (Array.isArray(value)) {
    return value.map((_, i) => i)
  } else {
    return types.getFieldNames(value)
  }
}


module.exports = {
  preOrder, preOrderTwo, preOrderType, preOrderSubtree,
  getNodePath,
  getChildKeys,
}

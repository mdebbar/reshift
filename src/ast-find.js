const { getChildKeys } = require('./ast-traverse')

/**
 * Find the root parent of `path`.
 */
function findRootPath(path) {
  while (path.parent) {
    path = path.parent
  }
  return path
}

function findAscendant(path, maxDepth, predicate) {
  maxDepth || (maxDepth = Infinity)
  let depth = 0
  let currentPath = path
  while (depth <= maxDepth) {
    if (predicate(currentPath)) {
      return currentPath
    }
    depth++
    currentPath = currentPath.parentPath
  }
}

function findDescendant(path, maxDepth, predicate) {
  if (predicate(path)) {
    return path
  }

  maxDepth || (maxDepth = Infinity)
  let depth = 1
  let queue = [path]
  let nextQueue = []
  while (depth <= maxDepth && queue.length > 0) {
    const currentPath = queue.shift()
    const keys = getChildKeys(currentPath.value)
    for (let i = 0; i < keys.length; i++) {
      const childPath = currentPath.get(keys[i])
      if (predicate(childPath)) {
        return childPath
      }
      nextQueue.push(childPath)
    }

    if (queue.length === 0 && nextQueue.length > 0) {
      depth++
      queue = nextQueue
      nextQueue = []
    }
  }
}

module.exports = { findRootPath, findAscendant, findDescendant }

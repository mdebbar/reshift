const recast = require('recast')

const EMPTY_FN = () => {}

// TODO: [optimization] implement a non-recursive.

/**
 * Traverses an AST tree using depth-first traversal.
 * `visit` will be invoked with (node, parent, key) arguments. If it returns `false`
 * the traversal will be skipped for the descendants of that child.
 */
function traverse(ast, visit) {
  if (!ast || typeof ast !== 'object') {
    return
  }

  let enter = visit
  let leave
  if (typeof visit === 'object') {
    enter = visit.enter
    leave = visit.leave
  }

  enter = typeof enter === 'function' ? enter : EMPTY_FN
  leave = typeof leave === 'function' ? leave : EMPTY_FN

  recast.types.eachField(ast, (key, child) => {
    let continueTraversal = enter(child, ast, key)
    if (continueTraversal !== false) {
      traverse(child, visit)
    }
    leave(child, ast, key)
  })
}

module.exports = traverse

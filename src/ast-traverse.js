const types = require('recast/lib/types')
const { namedTypes: n, NodePath } = types

function preOrderWithType(ast, type, callback) {
  // https://github.com/benjamn/ast-types/blob/d3b32/lib/path-visitor.js#L126
  const rootPath = new NodePath({ root: ast }).get('root')
  const queue = [rootPath]

  while (queue.length > 0) {
    const path = queue.shift()
    let continueTraversal = true

    // If this is a node of requested type, visit it!
    if (n[type].check(path.value)) {
      continueTraversal = callback(path)
    }

    if (!path.value || typeof path.value !== 'object' || continueTraversal === false) {
      continue
    }

    // Continue traversing child nodes
    if (Array.isArray(path.value)) {
      for (let i = 0; i < path.value.length; i++) {
        const childPath = path.get(i)
        queue.push(childPath)
      }
    } else {
      const fieldNames = types.getFieldNames(path.value)
      for (let i = 0; i < fieldNames.length; i++) {
        const name = fieldNames[i]
        const childPath = path.get(name)
        queue.push(childPath)
      }
    }
  }
}

function preOrder(ast, callback) {
  preOrderWithType(ast, 'Node', callback)
}

// TODO: [optimization] write an iterative post-order traversal.
function postOrder(ast, callback) {
  types.visit(ast, {
    visitNode: function visitNode(path) {
      this.traverse(path)
      callback(path)
    },
  })
}

/**
 * Post-order traversal of a subtree inside an AST.
 */
function postOrderSubtree(ast, subtree, callback) {
  let insideSubtree = false
  types.visit(ast, {
    visitNode: function visitNode(path) {
      const thisIsSubtree = path.node === subtree
      if (thisIsSubtree) {
        insideSubtree = true
      }
      this.traverse(path)
      if (insideSubtree) {
        callback(path)
      }
      if (thisIsSubtree) {
        insideSubtree = false
      }
    },
  })
}


module.exports = { preOrder, preOrderWithType, postOrder, postOrderSubtree }

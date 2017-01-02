const types = require('recast/lib/types')

// TODO: [optimization] write an iterative implementation for traversal.

function preOrderWithType(ast, type, callback) {
  types.visit(ast, {
    [`visit${type}`]: function visitNode(path) {
      if (callback(path) !== false) {
        this.traverse(path)
      }
    },
  })
}

function preOrder(ast, callback) {
  preOrderWithType(ast, 'Node', callback)
}

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

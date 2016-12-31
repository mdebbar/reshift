const types = require('recast/lib/types')

function preOrder(ast, callback) {
  types.visit(ast, {
    visitNode: function visitNode(path) {
      if (callback(path) !== false) {
        this.traverse(path)
      }
    },
  })
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


module.exports = { preOrder, postOrder, postOrderSubtree }

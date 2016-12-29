const types = require('recast/lib/types')

// TODO: Provide a way to skip traversing sub-tree (e.g. callback returns false)
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


module.exports = { preOrder, postOrder }

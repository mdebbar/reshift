// const typeTransformers = require('./types')

module.exports = {
  clone: (node, props) => Object.assign({}, node, props),
}

const babylon = require('babylon')
const { namedTypes } = require('recast/lib/types')

const BABYLON_OPTIONS = {
  plugins: ['flow', 'jsx'],
}

const BABYLON_CAPTURE_OPTIONS = {
  allowReturnOutsideFunction: true,
  plugins: ['capture'],
}


function _parse(source, ...options) {
  const finalOptions = (options.length === 1) ? options[0] : Object.assign({}, ...options)
  return babylon.parse(source, finalOptions)
}

function parse(source, options) {
  return _parse(source, BABYLON_OPTIONS, options)
}

function parseAsPartial(source, options) {
  const { program } = _parse(source, BABYLON_CAPTURE_OPTIONS, options)

  let partial = program.body
  if (Array.isArray(partial)) {
    if (partial.length === 0) {
      partial = null
    } else if (partial.length === 1) {
      partial = partial[0]
    }
  }

  // Remove any wrapper ExpressionStatement's.
  if (partial && namedTypes.ExpressionStatement.check(partial)) {
    partial = partial.expression
  }
  return partial
}

module.exports = { parse, parseAsPartial }

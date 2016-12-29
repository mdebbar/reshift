const recast = require('recast')
const babylon = require('babylon')

const BABYLON_CAPTURE_OPTIONS = {
  allowReturnOutsideFunction: true,
  plugins: ['capture'],
}

// A parser that passes the correct options to babylon.
const captureParser = {
  parse(source) {
    return babylon.parse(source, BABYLON_CAPTURE_OPTIONS)
  },
}

const RECAST_CAPTURE_OPTIONS = {
  parser: captureParser,
}


function parse(source, options) {
  return recast.parse(source, options)
}

function parseAsPartial(source) {
  const { program } = parse(source, RECAST_CAPTURE_OPTIONS)

  let partial = program.body
  if (Array.isArray(partial)) {
    if (partial.length === 0) {
      partial = null
    }
    if (partial.length === 1) {
      partial = partial[0]
    }
  }

  // Remove any wrapper expression statements.
  if (partial && partial.type === 'ExpressionStatement') {
    partial = partial.expression
  }
  return partial
}

module.exports = { parse, parseAsPartial }

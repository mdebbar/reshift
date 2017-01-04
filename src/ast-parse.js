const recast = require('recast')
const babylon = require('babylon')

const { namedTypes } = recast.types

const BABYLON_CAPTURE_OPTIONS = {
  allowReturnOutsideFunction: true,
  plugins: ['capture'],
}

const createBabylonParser = (options) => ({
  parse(source) {
    return babylon.parse(source, options)
  },
})

// TODO: maybe use the 'flow' and 'jsx' plugins by default?
const normalParser = createBabylonParser()
const captureParser = createBabylonParser(BABYLON_CAPTURE_OPTIONS)


function _parse(source, ...options) {
  const finalOptions = (options.length === 1) ? options[0] : Object.assign({}, ...options)
  return recast.parse(source, finalOptions)
}

function parse(source, options) {
  return _parse(source, { parser: normalParser }, options)
}

function parseWithCapture(source, options) {
  return _parse(source, { parser: captureParser }, options)
}

function parseAsPartial(source, options) {
  const { program } = parseWithCapture(source, options)

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

module.exports = { parse, parseWithCapture, parseAsPartial }

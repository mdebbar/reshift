const assert = require('assert')
const { parse, /* parseWithCapture, */ parseAsPartial } = require('./ast-parse')
const { findMatchInSubTree } = require('./ast-matching')
const { applyTransform, normalizeTransform } = require('./ast-transform-util')
// const { replaceCaptureNodes } = require('./ast-capture')
const { print } = require('./ast-print')
const AstFilterer = require('./ast-filterer')

const filterer = new AstFilterer()

function reShift(source, shifters) {
  const ast = parse(source)
  if (reShiftAst(ast, shifters)) {
    return print(ast)
  }
  return source
}

/**
 * Applies a `shifter` to the given `ast` and returns true if any transformation occurs
 * on the AST.
 */
function reShiftAst(ast, shifters) {
  return reShiftAstSubtree(ast, ast, shifters)
}

/**
 * Applies a `shifter` to a `subtree` inside the given `ast`.
 * Also returns true if any transformations occur.
 */
function reShiftAstSubtree(ast, subtree, shifters) {
  shifters.forEach(validateShifter)

  let isTransformed = false
  const transforms = shifters.map(s => normalizeTransform(s.transform))
  const captureTrees = shifters.map(s => parseAsPartial(s.capture))

  function onMatch(path, captured, i) {
    const { filter } = shifters[i]

    filterer.reset(ast, path, captured)
    if (!filter || filter(filterer)) {
      applyTransform(path, captured, transforms[i])
      isTransformed = true
      // By returning true, the matcher will know that a transformation has been applied.
      return true
    }
  }

  findMatchInSubTree(ast, subtree, captureTrees, onMatch)
  return isTransformed
}


function validateShifter({ capture, transform, filter }) {
  assert(
    typeof capture === 'string',
    `Expecting 'capture' of type string, got ${typeof capture}`
  )
  assert(
    typeof transform === 'undefined' || typeof transform === 'string' || typeof transform === 'function',
    `Expecting 'transform' of type string or function, got ${typeof transform}`
  )
  // TODO: should we just expose the filterer to `transform` and get rid of `filter`?
  assert(
    typeof filter === 'undefined' || typeof filter === 'function',
    `Expecting 'filter' of type function, got ${typeof filter}`
  )
}

module.exports = { reShift, reShiftAst, reShiftAstSubtree }

const assert = require('assert')
const { parse, /* parseWithCapture, */ parseAsPartial } = require('./ast-parse')
const { createMatcher } = require('./ast-matching')
const { applyTransform, normalizeTransform } = require('./ast-transform-util')
// const { replaceCaptureNodes } = require('./ast-capture')
const { print } = require('./ast-print')
const AstFilterer = require('./ast-filterer')

const filterer = new AstFilterer()
const ShifterKey = Symbol('ShifterKey')

function createShifter(...shifts) {
  shifts.forEach(validateShift)
  return {
    [ShifterKey]: true,
    shifts,
  }
}

function reShift(source, shifter) {
  const ast = parse(source)
  if (reShiftAst(ast, shifter)) {
    return print(ast)
  }
  return source
}

/**
 * Applies a `shifter` to the given `ast` and returns true if any transformation occurs
 * on the AST.
 */
function reShiftAst(ast, shifter) {
  const { shifts } = shifter

  let isMatched = false
  const transforms = shifts.map(s => normalizeTransform(s.transform))
  const captureTrees = shifts.map(s => parseAsPartial(s.capture))

  function onMatch(path, captured, i) {
    const { filter } = shifts[i]

    filterer.reset(ast, path, captured)
    if (filter && !filter(filterer)) {
      // Tell the AST matcher that this wasn't really a match.
      return false
    }

    isMatched = true
    if (transforms[i]) {
      applyTransform(path, captured, transforms[i])
      trees.push(path.node)
    }
  }

  const findMatchInSubTree = createMatcher(ast, captureTrees, onMatch)
  // `trees` holds all AST trees that still need to be considered for transformation.
  // Initially, it's the whole AST of the source. Subsequently, whenever a subtree is
  // transformed, we need to append it to this list to potentially apply other transforms on it.
  const trees = [ast]
  while (trees.length > 0) {
    const subtree = trees.shift()
    findMatchInSubTree(subtree)
  }
  return isMatched
}

function reShiftAstSubtree(ast, subtree, shifter) {
  const { shifts } = shifter

  let isMatched = false
  const transforms = shifts.map(s => normalizeTransform(s.transform))
  const captureTrees = shifts.map(s => parseAsPartial(s.capture))

  function onMatch(path, captured, i) {
    const { filter } = shifts[i]

    filterer.reset(ast, path, captured)
    if (filter && !filter(filterer)) {
      // Tell the AST matcher that this wasn't really a match.
      return false
    }

    isMatched = true
    if (transforms[i]) {
      applyTransform(path, captured, transforms[i])
      treesToSearch.push(path.node)
    }
  }

  const findMatchInSubTree = createMatcher(ast, captureTrees, onMatch)
  // `trees` holds all AST trees that still need to be considered for transformation.
  // Initially, it's the whole AST of the source. Subsequently, whenever a subtree is
  // transformed, we need to append it to this list to potentially apply other transforms on it.
  const treesToSearch = [subtree]
  while (treesToSearch.length > 0) {
    const tree = treesToSearch.shift()
    findMatchInSubTree(tree)
  }
  return isMatched
}


function validateShift({ capture, transform, filter }) {
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

module.exports = { reShift, reShiftAst, reShiftAstSubtree, createShifter }

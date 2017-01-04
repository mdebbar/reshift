const { parse, parseWithCapture, parseAsPartial } = require('./ast-parse')
const { createSubTreeMatcher } = require('./ast-matching')
const { applyTransform, normalizeTransform } = require('./ast-transform-util')
const { replaceCaptureNodes } = require('./ast-capture')
const { print } = require('./ast-print')

function run(source, shifterFn) {
  const shifter = shifterFn(source)

  const ast = parse(source)
  if (applyShifter(ast, shifter)) {
    return print(ast)
  }
  return source
}

/**
 * Returns true if a match/transformation occurs on the AST.
 */
function applyShifter(ast, shifter) {
  const { shifts } = shifter

  let isMatched = false
  const transforms = shifts.map(s => normalizeTransform(s.transform))
  const captureTrees = shifts.map(s => parseAsPartial(s.capture))
  const matchInSubTree = createSubTreeMatcher(ast, captureTrees)

  function onMatch(path, captured, i) {
    const { filter, chain: chainedShifter } = shifts[i]

    if (filter && !filter(path, captured)) {
      return
    }

    if (chainedShifter) {
      // A `chain` shifter can use some captured nodes in its source, so we need to replace
      // capture nodes.
      const chainAst = replaceCaptureNodes(parseWithCapture(chainedShifter.source), captured)
      // If the chained shifter doesn't match anything, we need to bail out the current shifter.
      if (!applyShifter(chainAst, chainedShifter)) {
        return
      }
    }

    isMatched = true
    if (transforms[i]) {
      applyTransform(path, captured, transforms[i])
      trees.push(path.node)
    }
  }

  // `trees` holds all AST trees that still need to be considered for transformation.
  // Initially, it's the whole AST of the source. Subsequently, whenever a subtree is
  // transformed, we need to append it to this list to potentially apply other transforms on it.
  const trees = [ast]
  while (trees.length > 0) {
    const subtree = trees.shift()
    matchInSubTree(subtree, onMatch)
  }
  return isMatched
}

module.exports = run

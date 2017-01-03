const { parse, parseAsPartial } = require('./ast-parse')
const { createSubTreeMatcher } = require('./ast-matching')
const { applyTransform, normalizeTransform } = require('./ast-transform-util')
const { print } = require('./ast-print')

const emptyFilter = () => true

function run(source, shifterFn) {
  const shifter = shifterFn(source)

  const ast = parse(source)
  const { shifts } = shifter

  const transforms = shifts.map(s => normalizeTransform(s.transform))
  const captureTrees = shifts.map(s => parseAsPartial(s.capture))
  const matchInSubTree = createSubTreeMatcher(ast, captureTrees)

  // `trees` holds all AST trees that still need to be considered for transformation.
  // Initially, it's the whole AST of the source. Subsequently, whenever a subtree is
  // transformed, we need to append it to this list to potentially apply other transforms on it.
  const trees = [ast]
  while (trees.length > 0) {
    const subtree = trees.shift()
    matchInSubTree(subtree, (path, capturedInfo, i) => {
      const filter = shifts[i].filter || emptyFilter
      if (filter(path, capturedInfo)) {
        applyTransform(path, capturedInfo, transforms[i])
        trees.push(path.node)
      }
    })
  }
  return print(ast)
}

module.exports = run

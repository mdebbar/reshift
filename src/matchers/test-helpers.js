const recast = require('recast')
const types = recast.types
const matchPattern = require('../traverser2/matchPattern')

function parse(code) {
  const main = recast.parse(code).program.body[0]
  // Remove any wrapper expression statements.
  if (recast.types.namedTypes.ExpressionStatement.check(main)) {
    return main.expression
  }
  return main
}

// TODO: Add debugging info when assertion fails.
function expectMatch(matcher, astOrCode) {
  const ast = (typeof astOrCode === 'string') ? parse(astOrCode) : astOrCode
  const path = new types.NodePath(ast)
  expect(matchPattern(path, matcher)).toBe(true)
}

function expectNoMatch(matcher, astOrCode) {
  const ast = (typeof astOrCode === 'string') ? parse(astOrCode) : astOrCode
  const path = new types.NodePath(ast)
  expect(matchPattern(path, matcher)).toBe(false)
}

module.exports = { parse, expectMatch, expectNoMatch }

const recast = require('recast')

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
  expect(matcher(ast)).toBe(true)
}

function expectNoMatch(matcher, astOrCode) {
  const ast = (typeof astOrCode === 'string') ? parse(astOrCode) : astOrCode
  expect(matcher(ast)).toBe(false)
}

module.exports = { parse, expectMatch, expectNoMatch }

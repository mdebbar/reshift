// TODO: Add debugging info when assertion fails.
function expectMatch(matcher, ast) {
  expect(matcher(ast)).toBe(true)
}

function expectNoMatch(matcher, ast) {
  expect(matcher(ast)).toBe(false)
}

module.exports = { expectMatch, expectNoMatch }

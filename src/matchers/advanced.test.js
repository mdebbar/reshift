const m = require('./index')
const { expectMatch, expectNoMatch } = require('./test-helpers')

test('match arrow function that can be shortened to a return expression', () => {
  // Matches a call expression with 3 arguments and the first two are literals.
  const matcher = m.ArrowFunctionExpression({
    body: m.BlockStatement({
      body: { 0: m.ReturnStatement() },
    }),
  })

  expectMatch(matcher, '() => { return x; }')
  expectMatch(matcher, '() => { return fn(); }')
  expectNoMatch(matcher, '() => {}')
  expectNoMatch(matcher, '() => { var x = 10; return x; }')
  expectNoMatch(matcher, '() => { console.log("hello"); }')
})

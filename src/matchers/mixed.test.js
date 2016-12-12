const m = require('./index')
const { expectMatch, expectNoMatch } = require('./test-helpers')

test('`and` of array pattern and array length', () => {
  // Matches a call expression with 3 arguments and the first two are literals.
  const matcher = m.CallExpression({
    arguments: m.and({ length: 3 }, [m.Literal(), m.Literal()]),
  })

  expectMatch(matcher, 'fn(10, 20, [])')
  expectNoMatch(matcher, 'fn(10, y, 20)')
  expectNoMatch(matcher, 'fn(10, 20)')
})

test('nesting `or` and `every` works fine', () => {
  const matcher = m.CallExpression({
    arguments: m.every(m.or(m.Identifier(), m.Literal(), m.ObjectExpression())),
  })

  expectMatch(matcher, 'fn(xyz, {})')
  expectMatch(matcher, 'fn(x, 20, {})')
  expectMatch(matcher, 'fn()')
  expectNoMatch(matcher, 'fn(x, otherFn(), {})')
})

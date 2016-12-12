const m = require('./index')
const { expectMatch, expectNoMatch } = require('./test-helpers')

test('`or` matcher works on type matchers and literal values', () => {
  const matcher = m.AssignmentExpression({
    left: m.Identifier({ name: m.or('x', 'y', 'z') }),
    right: m.or(
      m.Literal({ value: m.or(10, 20) }),
      m.ArrayExpression(),
    ),
  })

  expectMatch(matcher, 'x = 10')
  expectMatch(matcher, 'y = 20')
  expectMatch(matcher, 'z = []')
  expectNoMatch(matcher, 'x = 11')
  expectNoMatch(matcher, 't = 20')
})

test('nested `or`', () => {
  const matcher = m.AssignmentExpression({
    left: m.Identifier({ name: m.or('x', 'y') }),
    right: m.or(
      m.ObjectExpression(),
      m.CallExpression({ callee: m.or(m.Identifier(), m.MemberExpression(), m.CallExpression()) }),
    ),
  })

  expectMatch(matcher, 'x = fn()')
  expectMatch(matcher, 'y = Math.random()')
  expectMatch(matcher, 'x = fn()()')
  expectNoMatch(matcher, 'z = Math.random()')
  expectNoMatch(matcher, 'x = 10')
})

test('`not` matcher works on type matchers and literal values', () => {
  const matcher = m.AssignmentExpression({
    left: m.Identifier({ name: m.not('t') }),
    right: m.not(m.ArrayExpression()),
  })

  expectMatch(matcher, 'x = 10')
  expectMatch(matcher, 'y = 20')
  expectMatch(matcher, 'z = 11')
  expectNoMatch(matcher, 'x = []')
  expectNoMatch(matcher, 't = 20')
})

test('nested `not`', () => {
  const matcher = m.AssignmentExpression({
    left: m.Identifier(),
    right: m.not(m.Literal({
      value: m.not(10),
    })),
  })

  expectMatch(matcher, 'x = 10')
  expectMatch(matcher, 'y = []')
  expectNoMatch(matcher, 'z = 20')
})

test('`not` with `or`', () => {
  const matcher = m.AssignmentExpression({
    left: m.Identifier(),
    right: m.not(m.or(
      m.Literal({ value: 20 }),
      m.ArrayExpression(),
    )),
  })

  expectMatch(matcher, 'x = 10')
  expectMatch(matcher, 'y = {}')
  expectNoMatch(matcher, 'z = []')
  expectNoMatch(matcher, 't = 20')
})

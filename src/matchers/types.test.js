const m = require('./index')
const { expectMatch, expectNoMatch } = require('./test-helpers')

test('shallow matching', () => {
  expectMatch(m.Identifier(), 'xyz')
  expectMatch(m.Literal(), '100')
  expectMatch(m.ArrayExpression(), '[]')

  expectNoMatch(m.Identifier(), '100')
  expectNoMatch(m.Literal(), 'xyz')
  expectNoMatch(m.ObjectExpression(), '[]')
})

test('matches inherited ast types', () => {
  expectMatch(m.Expression(), '[]')
  expectMatch(m.Expression(), '1 + 2')
})

test('deep full matching', () => {
  const matcher1 = m.AssignmentExpression({ left: m.Identifier(), right: m.Literal() })
  expectMatch(matcher1, 'x = 10')

  // Go deeper!
  const matcher2 = m.AssignmentExpression({
    left: m.Identifier(),
    right: m.CallExpression({
      callee: m.MemberExpression({
        object: m.Identifier(),
        property: m.Identifier(),
      }),
    }),
  })
  expectMatch(matcher2, 'x = Math.random()')
})

test('deep partial matching', () => {
  const matcher1 = m.AssignmentExpression({ left: m.Identifier() })
  expectMatch(matcher1, 'x = 10')

  // Go deeper!
  const matcher2 = m.AssignmentExpression({
    right: m.CallExpression({
      callee: m.MemberExpression({
        object: m.Identifier(),
      }),
    }),
  })
  expectMatch(matcher2, 'x = Math.random()')
})

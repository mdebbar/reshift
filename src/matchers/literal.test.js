const m = require('./index')
const { expectMatch, expectNoMatch } = require('./test-helpers')

test('full matching of literal patterns', () => {
  const matcher = m.AssignmentExpression({
    operator: '=',
    left: m.Identifier({ name: 'x' }),
    right: m.Literal({ value: 'abc' }),
  })

  expectMatch(matcher, 'x = "abc"')
})

test('partial matching of literal patterns', () => {
  const matcher = m.AssignmentExpression({
    operator: '=',
    right: m.Literal({ value: 'abc' }),
  })

  expectMatch(matcher, 'y = "abc"')
})

test('detect shallow non-match', () => {
  const matcher = m.AssignmentExpression({ operator: '=' })
  expectNoMatch(matcher, 'x += "abc"')
})

test('detect deep non-match', () => {
  const matcher = m.AssignmentExpression({
    operator: '=',
    left: m.Identifier({ name: 'x' }),
    right: m.Literal({ value: 'abc' }),
  })

  expectNoMatch(matcher, 'y = "abc"')
})

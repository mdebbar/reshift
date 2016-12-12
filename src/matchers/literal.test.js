const b = require('recast/lib/types').builders
const m = require('./index')
const { expectMatch, expectNoMatch } = require('./test-helpers')

test('matches literal pattern', () => {
  // Can do full matching
  const ast1 = b.assignmentExpression('=', b.identifier('x'), b.literal('abc'))

  const matcher1 = m.AssignmentExpression({
    operator: '=',
    left: m.Identifier({ name: 'x' }),
    right: m.Literal({ value: 'abc' }),
  })

  expectMatch(matcher1, ast1)

  // Can do partial matching
  const ast2 = b.assignmentExpression('=', b.identifier('x'), b.literal('abc'))

  const matcher2 = m.AssignmentExpression({
    operator: '=',
    right: m.Literal({ value: 'abc' }),
  })

  expectMatch(matcher2, ast2)

  // Can detect non-match from shallow property
  const ast3 = b.assignmentExpression('+=', b.identifier('x'), b.literal('abc'))

  const matcher3 = m.AssignmentExpression({ operator: '=' })

  expectNoMatch(matcher3, ast3)

  // Can detect non-match from deep property
  const ast4 = b.assignmentExpression('=', b.identifier('y'), b.literal('abc'))

  const matcher4 = m.AssignmentExpression({
    operator: '=',
    left: m.Identifier({ name: 'x' }),
    right: m.Literal({ value: 'abc' }),
  })

  expectNoMatch(matcher4, ast4)
})

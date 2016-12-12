const b = require('recast/lib/types').builders
const m = require('./index')
const { expectMatch, expectNoMatch } = require('./test-helpers')

test('shallow matching', () => {
  expectMatch(m.Identifier(), b.identifier('xyz'))
  expectMatch(m.Literal(), b.literal(123))
  expectMatch(m.ObjectExpression(), b.objectExpression([]))

  expectNoMatch(m.Identifier(), b.literal(100))
  expectNoMatch(m.Literal(), b.identifier('xyz'))
  expectNoMatch(m.ObjectExpression(), b.arrayExpression([]))
})

test('matches inherited ast types', () => {
  expectMatch(m.Expression(), b.arrayExpression([]))
  expectMatch(m.Expression(), b.objectExpression([]))
})

test('deep full matching', () => {
  const ast1 = b.assignmentExpression('=', b.identifier('x'), b.literal(10))
  const matcher1 = m.AssignmentExpression({ left: m.Identifier(), right: m.Literal() })
  expectMatch(matcher1, ast1)

  // Go deeper!
  const ast2 =
    b.assignmentExpression('=',
      b.identifier('x'),
      b.callExpression(
        b.memberExpression(b.identifier('Math'), b.identifier('random')),
        [],
      ),
    )
  const matcher2 = m.AssignmentExpression({
    left: m.Identifier(),
    right: m.CallExpression({
      callee: m.MemberExpression({
        object: m.Identifier(),
        property: m.Identifier(),
      }),
    }),
  })
  expectMatch(matcher2, ast2)
})

test('deep partial matching', () => {
  const ast1 = b.assignmentExpression('=', b.identifier('x'), b.literal(10))
  const matcher1 = m.AssignmentExpression({ left: m.Identifier() })
  expectMatch(matcher1, ast1)

  // Go deeper!
  const ast2 =
    b.assignmentExpression('=',
      b.identifier('x'),
      b.callExpression(
        b.memberExpression(b.identifier('Math'), b.identifier('random')),
        [],
      ),
    )
  const matcher2 = m.AssignmentExpression({
    right: m.CallExpression({
      callee: m.MemberExpression({
        object: m.Identifier(),
      }),
    }),
  })
  expectMatch(matcher2, ast2)
})

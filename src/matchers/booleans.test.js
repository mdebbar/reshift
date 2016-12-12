const b = require('recast/lib/types').builders
const m = require('./index')
const { expectMatch, expectNoMatch } = require('./test-helpers')

test('`or` matcher works on type matchers and literal values', () => {
  const ast1 = b.variableDeclarator(b.identifier('x'), b.literal(10))
  const ast2 = b.variableDeclarator(b.identifier('y'), b.literal(20))
  const ast3 = b.variableDeclarator(b.identifier('z'), b.arrayExpression([]))
  const ast4 = b.variableDeclarator(b.identifier('x'), b.literal(11))
  const ast5 = b.variableDeclarator(b.identifier('t'), b.literal(20))

  const matcher = m.VariableDeclarator({
    id: m.Identifier({ name: m.or('x', 'y', 'z') }),
    init: m.or(
      m.Literal({ value: m.or(10, 20) }),
      m.ArrayExpression(),
    ),
  })

  expectMatch(matcher, ast1)
  expectMatch(matcher, ast2)
  expectMatch(matcher, ast3)
  expectNoMatch(matcher, ast4)
  expectNoMatch(matcher, ast5)
})

test('nested `or`', () => {
  const ast1 =
    b.assignmentExpression('=',
      b.identifier('x'),
      b.callExpression(b.literal('this is a string'), []),
    )
  const ast2 =
    b.assignmentExpression('=',
      b.identifier('x'),
      b.callExpression(b.memberExpression(b.identifier('Math'), b.identifier('random')), []),
    )
  const ast3 =
    b.assignmentExpression('=',
      b.identifier('z'),
      b.callExpression(b.memberExpression(b.identifier('Math'), b.identifier('random')), []),
    )
  const ast4 = b.assignmentExpression('=', b.identifier('x'), b.literal(10))

  const matcher = m.AssignmentExpression({
    left: m.Identifier({ name: m.or('x', 'y') }),
    right: m.or(
      m.ObjectExpression(),
      m.CallExpression({ callee: m.or(m.MemberExpression(), m.Identifier(), m.Literal()) }),
    ),
  })

  expectMatch(matcher, ast1)
  expectMatch(matcher, ast2)
  expectNoMatch(matcher, ast3)
  expectNoMatch(matcher, ast4)
})

test('`not` matcher works on type matchers and literal values', () => {
  const ast1 = b.variableDeclarator(b.identifier('x'), b.literal(10))
  const ast2 = b.variableDeclarator(b.identifier('y'), b.literal(20))
  const ast3 = b.variableDeclarator(b.identifier('z'), b.literal(11))
  const ast4 = b.variableDeclarator(b.identifier('x'), b.arrayExpression([]))
  const ast5 = b.variableDeclarator(b.identifier('t'), b.literal(20))

  const matcher = m.VariableDeclarator({
    id: m.Identifier({ name: m.not('t') }),
    init: m.not(m.ArrayExpression()),
  })

  expectMatch(matcher, ast1)
  expectMatch(matcher, ast2)
  expectMatch(matcher, ast3)
  expectNoMatch(matcher, ast4)
  expectNoMatch(matcher, ast5)
})

test('nested `not`', () => {
  const ast1 = b.variableDeclarator(b.identifier('x'), b.literal(10))
  const ast2 = b.variableDeclarator(b.identifier('y'), b.arrayExpression([]))
  const ast3 = b.variableDeclarator(b.identifier('z'), b.literal(20))

  const matcher = m.VariableDeclarator({
    id: m.Identifier(),
    init: m.not(m.Literal({
      value: m.not(10),
    })),
  })

  expectMatch(matcher, ast1)
  expectMatch(matcher, ast2)
  expectNoMatch(matcher, ast3)
})

test('`not` with `or`', () => {
  const ast1 = b.variableDeclarator(b.identifier('x'), b.literal(10))
  const ast2 = b.variableDeclarator(b.identifier('y'), b.objectExpression([]))
  const ast3 = b.variableDeclarator(b.identifier('z'), b.arrayExpression([]))
  const ast4 = b.variableDeclarator(b.identifier('t'), b.literal(20))

  const matcher = m.VariableDeclarator({
    id: m.Identifier(),
    init: m.not(m.or(
      m.Literal({ value: 20 }),
      m.ArrayExpression(),
    )),
  })

  expectMatch(matcher, ast1)
  expectMatch(matcher, ast2)
  expectNoMatch(matcher, ast3)
  expectNoMatch(matcher, ast4)
})

const b = require('recast/lib/types').builders
const m = require('../src/matchers')

test('correctly matches literal property values', () => {
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

test('The "every" matcher works', () => {
  // Shallow
  const ast1 = b.arrayExpression([
    b.literal(10),
    b.identifier('y'),
    b.objectExpression([]),
  ])

  const matcher1 = m.ArrayExpression({
    elements: m.every(m.Expression()),
  })

  expectMatch(matcher1, ast1)

  // Deep & nested
  const ast2 = b.arrayExpression([
    b.objectExpression([
      b.property('init', b.identifier('p1'), b.literal(10)),
      b.property('init', b.identifier('p2'), b.literal(20)),
    ]),
    b.objectExpression([
      b.property('init', b.identifier('p1'), b.literal(100)),
    ]),
  ])

  const matcher2 = m.ArrayExpression({
    elements: m.every(m.ObjectExpression({
      properties: m.every(m.Property({
        key: m.Identifier({ name: (prop) => prop.startsWith('p') }),
        value: m.Literal(),
      })),
    })),
  })

  expectMatch(matcher2, ast2)

  // Detects non-matches
  const ast3 = b.arrayExpression([
    b.objectExpression([
      b.property('init', b.identifier('p1'), b.literal(10)),
      b.property('init', b.identifier('k2'), b.literal(20)),
    ]),
    b.objectExpression([
      b.property('init', b.identifier('p1'), b.literal(100)),
    ]),
  ])

  const matcher3 = m.ArrayExpression({
    elements: m.every(m.ObjectExpression({
      properties: m.every(m.Property({
        key: m.Identifier({ name: (prop) => prop.startsWith('p') }),
        value: m.Literal(),
      })),
    })),
  })

  expectNoMatch(matcher3, ast3)
})

test('The "or" matcher works', () => {
  const ast1 = b.variableDeclarator(b.identifier('x'), b.literal(10))
  const ast2 = b.variableDeclarator(b.identifier('y'), b.literal(20))
  const ast3 = b.variableDeclarator(b.identifier('z'), b.arrayExpression([]))
  const ast4 = b.variableDeclarator(b.identifier('t'), b.literal(10))
  const ast5 = b.variableDeclarator(b.identifier('x'), b.literal(11))

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

test('The "every" matcher interops with the "or" matcher', () => {
  const ast1 =
    b.callExpression(b.identifier('fn1'), [
      b.literal('xyz'),
      b.objectExpression([]),
    ])

  const ast2 =
    b.callExpression(b.identifier('fn2'), [
      b.identifier('x'),
      b.literal(10),
      b.objectExpression([]),
    ])

  const ast3 = b.callExpression(b.identifier('fn3'), [])

  const ast4 =
    b.callExpression(b.identifier('fn4'), [
      b.identifier('x'),
      b.callExpression(b.identifier('otherFn'), []),
      b.objectExpression([]),
    ])

  const matcher = m.CallExpression({
    arguments: m.every(m.or(m.Identifier(), m.Literal(), m.ObjectExpression())),
  })

  expectMatch(matcher, ast1)
  expectMatch(matcher, ast2)
  expectMatch(matcher, ast3)
  expectNoMatch(matcher, ast4)
})

function expectMatch(matcher, ast) {
  expect(matcher(ast)).toBe(true)
}

function expectNoMatch(matcher, ast) {
  expect(matcher(ast)).toBe(false)
}

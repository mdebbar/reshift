const b = require('recast/lib/types').builders
const m = require('./index')
const { expectMatch, expectNoMatch } = require('./test-helpers')

test('matches array\'s `length`', () => {
  const ast1 = b.callExpression(b.identifier('fn'), [
    b.literal(10),
    b.identifier('y'),
    b.arrayExpression([]),
  ])
  const ast2 = b.callExpression(b.identifier('fn'), [])
  const ast3 = b.callExpression(b.identifier('fn'), [b.literal(10), b.identifier('y')])

  const matcher = m.CallExpression({
    arguments: { length: 3 },
  })

  expectMatch(matcher, ast1)
  expectNoMatch(matcher, ast2)
  expectNoMatch(matcher, ast3)
})

test('matches array pattern', () => {
  const ast1 = b.callExpression(b.identifier('fn'), [
    b.literal(10),
    b.identifier('y'),
    b.arrayExpression([]),
  ])
  const ast2 = b.callExpression(b.identifier('fn'), [
    b.identifier('y'),
    b.literal(10),
    b.arrayExpression([]),
  ])
  const ast3 = b.callExpression(b.identifier('fn'), [
    b.literal(10),
    b.identifier('y'),
  ])

  const matcher = m.CallExpression({
    arguments: [m.Literal(), m.Identifier(), m.ArrayExpression()],
  })

  expectMatch(matcher, ast1)
  expectNoMatch(matcher, ast2)
  expectNoMatch(matcher, ast3)
})

test('matches partial array pattern', () => {
  const ast1 = b.callExpression(b.identifier('fn'), [
    b.literal(10),
    b.identifier('x'),
    b.arrayExpression([]),
  ])
  const ast2 = b.callExpression(b.identifier('fn'), [b.literal(10), b.identifier('y')])
  const ast3 = b.callExpression(b.identifier('fn'), [b.identifier('y'), b.literal(10)])
  const ast4 = b.callExpression(b.identifier('fn'), [b.literal(10), b.literal(10), b.identifier('y')])

  const matcher = m.CallExpression({
    arguments: [m.Literal({ value: 10 }), m.Identifier()],
  })

  expectMatch(matcher, ast1)
  expectMatch(matcher, ast2)
  expectNoMatch(matcher, ast3)
  expectNoMatch(matcher, ast4)
})

test('matches nested array patterns', () => {
  const ast1 = b.callExpression(b.identifier('fn'), [
    b.literal(10),
    b.identifier('y'),
    b.arrayExpression([b.objectExpression([]), b.objectExpression([])]),
  ])
  const ast2 = b.callExpression(b.identifier('fn'), [
    b.identifier('y'),
    b.literal(10),
    b.arrayExpression([b.objectExpression([])]),
  ])
  const ast3 = b.callExpression(b.identifier('fn'), [
    b.identifier('y'),
    b.literal(10),
    b.arrayExpression([b.objectExpression([]), b.literal(20)]),
  ])

  const matcher = m.CallExpression({
    arguments: [m.Literal(), m.Identifier(), m.ArrayExpression({
      elements: [m.ObjectExpression(), m.ObjectExpression()],
    })],
  })

  expectMatch(matcher, ast1)
  expectNoMatch(matcher, ast2)
  expectNoMatch(matcher, ast3)
})

test('matches nth item in array', () => {
  const ast1 = b.callExpression(b.identifier('fn'), [
    b.literal(10),
    b.identifier('x'),
    b.arrayExpression([]),
  ])
  const ast2 = b.callExpression(b.identifier('fn'), [b.literal(10), b.identifier('x'), b.objectExpression([])])
  const ast3 = b.callExpression(b.identifier('fn'), [b.literal(10), b.identifier('x')])

  // Matches a call expression with the 3rd argument being an array expression.
  const matcher = m.CallExpression({
    arguments: { 2: m.ArrayExpression() },
  })

  expectMatch(matcher, ast1)
  expectNoMatch(matcher, ast2)
  expectNoMatch(matcher, ast3)
})

test('`every` matcher works', () => {
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
      b.property('init', b.identifier('p3'), b.literal(100)),
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
      b.property('init', b.identifier('p3'), b.literal(100)),
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

test('`some` matcher works', () => {
  // Shallow
  const ast1 = b.arrayExpression([
    b.literal(10),
    b.identifier('y'),
    b.objectExpression([]),
  ])

  const matcher1 = m.ArrayExpression({
    elements: m.some(m.Literal()),
  })

  expectMatch(matcher1, ast1)

  // Deep & nested
  const ast2 = b.arrayExpression([
    b.objectExpression([
      b.property('init', b.identifier('p1'), b.literal(10)),
      b.property('init', b.identifier('p2'), b.literal(20)),
    ]),
    b.objectExpression([
      b.property('init', b.identifier('p3'), b.literal(100)),
    ]),
  ])

  const matcher2 = m.ArrayExpression({
    elements: m.some(m.ObjectExpression({
      properties: m.some(m.Property({
        key: m.Identifier({ name: 'p2' }),
        value: m.Literal({ value: 20 }),
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
    elements: m.some(m.ObjectExpression({
      properties: m.some(m.Property({
        key: m.Identifier({ name: (prop) => prop.startsWith('a') }),
        value: m.Literal(),
      })),
    })),
  })

  expectNoMatch(matcher3, ast3)
})

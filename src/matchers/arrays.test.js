const m = require('./index')
const { expectMatch, expectNoMatch } = require('./test-helpers')

test('matches array\'s `length`', () => {
  // Matches function calls with 3 arguments.
  const matcher = m.CallExpression({
    arguments: { length: 3 },
  })

  expectMatch(matcher, 'fn(10, y, [])')
  expectNoMatch(matcher, 'fn()')
  expectNoMatch(matcher, 'fn(10, y)')
})

test('matches array pattern', () => {
  const matcher = m.CallExpression({
    arguments: [m.Literal(), m.Identifier(), m.ArrayExpression()],
  })

  expectMatch(matcher, 'fn(10, y, [])')
  expectNoMatch(matcher, 'fn(y, 10, [])')
  expectNoMatch(matcher, 'fn(10, y)')
})

test('matches partial array pattern', () => {
  const matcher = m.CallExpression({
    arguments: [m.Literal({ value: 10 }), m.Identifier()],
  })

  expectMatch(matcher, 'fn(10, x, [])')
  expectMatch(matcher, 'fn(10, y)')
  expectNoMatch(matcher, 'fn(y, 10)')
  expectNoMatch(matcher, 'fn(10, 10, y)')
})

test('matches nested array patterns', () => {
  const matcher = m.CallExpression({
    arguments: [m.Literal(), m.Identifier(), m.ArrayExpression({
      elements: [m.ObjectExpression(), m.ObjectExpression()],
    })],
  })

  expectMatch(matcher, 'fn(10, y, [{}, {}])')
  expectNoMatch(matcher, 'fn(y, 10, [{}])')
  expectNoMatch(matcher, 'fn(y, 10, [{}, 20])')
})

test('matches nth item in array', () => {
  // Matches a call expression with the 3rd argument being an array expression.
  const matcher = m.CallExpression({
    arguments: { 2: m.ArrayExpression() },
  })

  expectMatch(matcher, 'fn(10, x, [])')
  expectNoMatch(matcher, 'fn(10, x, {})')
  expectNoMatch(matcher, 'fn(10, x)')
})

test('`every` matcher works', () => {
  // Shallow
  const matcher1 = m.ArrayExpression({
    elements: m.every(m.Expression()),
  })

  expectMatch(matcher1, '[10, y, {}]')

  // Deep & nested
  const matcher2 = m.ArrayExpression({
    elements: m.every(m.ObjectExpression({
      properties: m.every(m.Property({
        key: m.Identifier({ name: (prop) => prop.startsWith('p') }),
        value: m.Literal(),
      })),
    })),
  })

  expectMatch(matcher2, '[{ p1: 10, p2: 20 }, { p3: 100 }]')

  // Detects non-matches
  const matcher3 = m.ArrayExpression({
    elements: m.every(m.ObjectExpression({
      properties: m.every(m.Property({
        key: m.Identifier({ name: (prop) => prop.startsWith('p') }),
        value: m.Literal(),
      })),
    })),
  })

  expectNoMatch(matcher3, '[{ p1: 10, k2: 20 }, { p3: 100 }]')
})

test('`some` matcher works', () => {
  // Shallow
  const matcher1 = m.ArrayExpression({
    elements: m.some(m.Literal()),
  })

  expectMatch(matcher1, '[10, y, {}]')

  // Deep & nested
  const matcher2 = m.ArrayExpression({
    elements: m.some(m.ObjectExpression({
      properties: m.some(m.Property({
        key: m.Identifier({ name: 'p2' }),
        value: m.Literal({ value: 20 }),
      })),
    })),
  })

  expectMatch(matcher2, '[{ p1: 10, p2: 20 }, { p3: 100 }]')

  // Detects non-matches
  const matcher3 = m.ArrayExpression({
    elements: m.some(m.ObjectExpression({
      properties: m.some(m.Property({
        key: m.Identifier({ name: (prop) => prop.startsWith('a') }),
        value: m.Literal(),
      })),
    })),
  })

  expectNoMatch(matcher3, '[{ p1: 10, k2: 20 }, { p1: 100 }]')
})

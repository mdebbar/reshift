const b = require('recast/lib/types').builders
const m = require('./index')
const { expectMatch, expectNoMatch } = require('./test-helpers')

test('`and` of array pattern and array length', () => {
  const ast1 = b.callExpression(b.identifier('fn'), [
    b.literal(10),
    b.literal(20),
    b.arrayExpression([]),
  ])
  const ast2 = b.callExpression(b.identifier('fn'), [
    b.literal(10),
    b.identifier('y'),
    b.literal(20),
  ])
  const ast3 = b.callExpression(b.identifier('fn'), [
    b.literal(10),
    b.literal(20),
  ])

  // Matches a call expression with 3 arguments and the first two are literals.
  const matcher = m.CallExpression({
    arguments: m.and({ length: 3 }, [m.Literal(), m.Literal()]),
  })

  expectMatch(matcher, ast1)
  expectNoMatch(matcher, ast2)
  expectNoMatch(matcher, ast3)
})

test('nesting `or` and `every` works fine', () => {
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

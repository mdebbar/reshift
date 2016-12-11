const b = require('recast/lib/types').builders
const m = require('../src/matchers')

test('correctly matches literal property values', () => {
  const shouldMatch =
    b.variableDeclaration('var', [
      b.variableDeclarator(b.identifier('abc'), b.literal(10)),
      b.variableDeclarator(b.identifier('def'), b.literal(10)),
    ])

  const shouldNotMatch =
    b.variableDeclaration('var', [
      b.variableDeclarator(b.identifier('abc'), b.literal(10)),
      b.variableDeclarator(b.identifier('def'), b.literal(20)),
    ])

  const matcher = m.VariableDeclaration({
    kind: 'var',
    declarations: m.each(m.VariableDeclarator({
      init: m.Literal({
        value: 10,
      }),
    })),
  })

  expect(matcher(shouldMatch)).toBe(true)
  expect(matcher(shouldNotMatch)).toBe(false)
})

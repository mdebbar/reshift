require('../test-helpers/expect-code-equality')
const { namedTypes } = require('recast/lib/types')
const reShift = require('..')

test('pre-calculate additions', () => {
  const code = `
    fn(5 + 2 + 1 + 10, 7 + 8 + x)
  `
  const expected = `
    fn(18, 15 + x)
  `

  const transformed =
    reShift(code).add({
      capture: '{{x}} + {{y}}',
      transform: (path, captured) => `${captured.x.value + captured.y.value}`,
      filter: (path, captured) =>
        namedTypes.Literal.check(captured.x) && namedTypes.Literal.check(captured.y) &&
        typeof captured.x.value === 'number' &&
        typeof captured.y.value === 'number',
    }).toSource()
  expect(transformed).toEqualCode(expected)
})

test('pre-calculate additions/subtractions/multiplication/division', () => {
  const code = `
    fn((6 / 2 + 4 - 1) * 10, 4 + 3 - 2 * x)
  `
  const expected = `
    fn(60, 7 - 2 * x)
  `

  const filter =
    (path, captured) => namedTypes.NumericLiteral.check(captured.x) && namedTypes.NumericLiteral.check(captured.y)

  const transformed =
    reShift(code).add({
      capture: '{{x}} + {{y}}',
      transform: (path, captured) => `${captured.x.value + captured.y.value}`,
      filter: filter,
    }).add({
      capture: '{{x}} - {{y}}',
      transform: (path, captured) => `${captured.x.value - captured.y.value}`,
      filter: filter,
    }).add({
      capture: '{{x}} * {{y}}',
      transform: (path, captured) => `${captured.x.value * captured.y.value}`,
      filter: filter,
    }).add({
      capture: '{{x}} / {{y}}',
      transform: (path, captured) => `${captured.x.value / captured.y.value}`,
      filter: filter,
    }).toSource()
  expect(transformed).toEqualCode(expected)
})

test('pre-calculate string concatenations', () => {
  const code = `
    var str = 'abc' + fn('def' + 'ge' + 'pqrst')
  `
  const expected = `
    var str = 'abc' + fn('defgepqrst')
  `

  const transformed =
    reShift(code).add({
      capture: '{{x}} + {{y}}',
      transform: (path, captured) => `('${captured.x.value + captured.y.value}')`,
      filter: (path, captured) =>
        namedTypes.Literal.check(captured.x) && namedTypes.Literal.check(captured.y) &&
        typeof captured.x.value === 'string' &&
        typeof captured.y.value === 'string',
    }).toSource()
  expect(transformed).toEqualCode(expected)
})

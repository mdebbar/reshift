require('../test-helpers/expect-code-equality')
const { namedTypes } = require('recast/lib/types')
const { reShift } = require('..')

test('pre-calculate additions', () => {
  const code = `
    var sum = 5 + 2 + 1 + fn() + 10 + 7 + x + y + 3 + 6
  `
  const expected = `
    var sum = 8 + fn() + 17 + x + y + 9
  `

  const filter = (f) =>
    f.types.NumericLiteral.check(f.captured.x) &&
    f.types.NumericLiteral.check(f.captured.y)

  const shifters = [{
    capture: '{{x}} + {{y}}',
    filter: filter,
    transform: (t) => t.replace(`${t.captured.x.value + t.captured.y.value}`),
  }, {
    capture: '{{extra}} + {{x}} + {{y}}',
    filter: filter,
    transform: (t) => t.replace(`{{extra}} + ${t.captured.x.value + t.captured.y.value}`),
  }]
  const transformed = reShift(code, shifters)
  expect(transformed).toEqualCode(expected)
})

test('pre-calculate additions/subtractions/multiplication/division', () => {
  const code = `
    fn((6 / 2 + 4 - 1) * 10, 4 + 3 - 2 * x)
  `
  const expected = `
    fn(60, 7 - 2 * x)
  `

  const filter = (f) =>
    f.types.NumericLiteral.check(f.captured.x) &&
    f.types.NumericLiteral.check(f.captured.y)

  const shifters = [{
    capture: '{{x}} + {{y}}',
    transform: (t) => t.replace(`${t.captured.x.value + t.captured.y.value}`),
    filter: filter,
  }, {
    capture: '{{x}} - {{y}}',
    transform: (t) => t.replace(`${t.captured.x.value - t.captured.y.value}`),
    filter: filter,
  }, {
    capture: '{{x}} * {{y}}',
    transform: (t) => t.replace(`${t.captured.x.value * t.captured.y.value}`),
    filter: filter,
  }, {
    capture: '{{x}} / {{y}}',
    transform: (t) => t.replace(`${t.captured.x.value / t.captured.y.value}`),
    filter: filter,
  }]
  const transformed = reShift(code, shifters)
  expect(transformed).toEqualCode(expected)
})

test('pre-calculate string concatenations', () => {
  const code = `
    var str = "ab" + "c" + fn("def" + "ge" + "pqrst")
  `
  const expected = `
    var str = 'abc' + fn('defgepqrst')
  `

  const shifters = [{
    capture: '{{x}} + {{y}}',
    transform: (t) => t.replace(`('${t.captured.x.value + t.captured.y.value}')`),
    filter: (f) =>
      f.types.StringLiteral.check(f.captured.x) &&
      f.types.StringLiteral.check(f.captured.y),
  }]
  const transformed = reShift(code, shifters)
  expect(transformed).toEqualCode(expected)
})

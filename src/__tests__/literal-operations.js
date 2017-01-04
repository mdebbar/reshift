require('../test-helpers/expect-code-equality')
const { namedTypes } = require('recast/lib/types')
const { run, reShift } = require('..')

test('pre-calculate additions', () => {
  const code = `
    var sum = 5 + 2 + 1 + fn() + 10 + 7 + x + y + 3 + 6
  `
  const expected = `
    var sum = 8 + fn() + 17 + x + y + 9
  `

  const filter = (path, captured) =>
    namedTypes.NumericLiteral.check(captured.x) &&
    namedTypes.NumericLiteral.check(captured.y)

  const shifter = (source) =>
    reShift(source, {
      capture: '{{x}} + {{y}}',
      filter: filter,
      transform: (t) => t.replace(`${t.captured.x.value + t.captured.y.value}`),
    }, {
      capture: '{{extra}} + {{x}} + {{y}}',
      filter: filter,
      transform: (t) => t.replace(`{{extra}} + ${t.captured.x.value + t.captured.y.value}`),
    })
  const transformed = run(code, shifter)
  expect(transformed).toEqualCode(expected)
})

test('pre-calculate additions/subtractions/multiplication/division', () => {
  const code = `
    fn((6 / 2 + 4 - 1) * 10, 4 + 3 - 2 * x)
  `
  const expected = `
    fn(60, 7 - 2 * x)
  `

  const filter = (path, captured) =>
    namedTypes.NumericLiteral.check(captured.x) &&
    namedTypes.NumericLiteral.check(captured.y)

  const shifter = (source) =>
    reShift(source, {
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
    })
  const transformed = run(code, shifter)
  expect(transformed).toEqualCode(expected)
})

test('pre-calculate string concatenations', () => {
  const code = `
    var str = "ab" + "c" + fn("def" + "ge" + "pqrst")
  `
  const expected = `
    var str = 'abc' + fn('defgepqrst')
  `

  const shifter = (source) =>
    reShift(source, {
      capture: '{{x}} + {{y}}',
      transform: (t) => t.replace(`('${t.captured.x.value + t.captured.y.value}')`),
      filter: (path, captured) =>
        namedTypes.Literal.check(captured.x) && namedTypes.Literal.check(captured.y) &&
        typeof captured.x.value === 'string' &&
        typeof captured.y.value === 'string',
    })
  const transformed = run(code, shifter)
  expect(transformed).toEqualCode(expected)
})

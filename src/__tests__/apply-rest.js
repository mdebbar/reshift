require('../test-helpers/expect-code-equality')
const { reShift } = require('..')

test('replace fn.apply() with rest arguments', () => {
  const code = `
    fn.apply(null, arr);
    fn.apply(obj, arr);
    obj.fn.apply(undefined, [x, y].concat([z]))
  `
  const expected = `
    fn(...arr);
    fn.apply(obj, arr);
    obj.fn(...[x, y].concat([z]))
  `

  const shifters = [{
    capture  : '{{fn}}.apply(null, {{args}})',
    transform: '{{fn}}(...{{args}})',
  }, {
    capture  : '{{fn}}.apply(undefined, {{args}})',
    transform: '{{fn}}(...{{args}})',
  }]
  const transformed = reShift(code, shifters)
  expect(transformed).toEqualCode(expected)
})

test('handle more cases of .apply()', () => {
  // TODO: remove comments from code below.
  const code = `
    fn.apply(null, arr);
    fn.apply(obj, arr);
    // obj.fn.apply(undefined, [x, y].concat([z]))
    obj.fn.apply(obj, [x, y, z])
    // obj.fn.apply(obj2, [x, y].concat([z]))
    obj().fn.apply(obj(), [x, y].concat([z]))
  `
  const expected = `
    fn(...arr);
    fn.apply(obj, arr);
    // obj.fn.apply(undefined, [x, y].concat([z]))
    obj.fn(...[x, y, z])
    // obj.fn.apply(obj2, [x, y].concat([z]))
    obj().fn.apply(obj(), [x, y].concat([z]))
  `

  const shifters = [{
    capture  : '{{fn}}.apply(null, {{args}})',
    filter: (f) => f.types.Identifier.check(f.captured.fn),
    transform: '{{fn}}(...{{args}})',
  }, {
    capture  : '{{fn}}.apply(undefined, {{args}})',
    filter: (f) => f.types.Identifier.check(f.captured.fn),
    transform: '{{fn}}(...{{args}})',
  }, {
    capture  : '{{obj}}.{{fn}}.apply({{obj}}, {{args}})',
    filter: (f) => !f.contains(f.captured.obj, '{{x}}()'),
    transform: '{{obj}}.{{fn}}(...{{args}})',
  }]
  const transformed = reShift(code, shifters)
  expect(transformed).toEqualCode(expected)
})

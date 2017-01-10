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

    transform: (t, f) => {
      if (!f.types.Identifier.check(f.captured.fn)) {
        return
      }
      t.replace('{{fn}}(...{{args}})')
    },
  }, {
    capture  : '{{fn}}.apply(undefined, {{args}})',

    transform: (t, f) => {
      if (!f.types.Identifier.check(f.captured.fn)) {
        return
      }
      t.replace('{{fn}}(...{{args}})')
    },
  }, {
    capture  : '{{obj}}.{{fn}}.apply({{obj}}, {{args}})',

    transform: (t, f) => {
      if (f.contains(f.captured.obj, '{{x}}()')) {
        return
      }
      t.replace('{{obj}}.{{fn}}(...{{args}})')
    },
  }]
  const transformed = reShift(code, shifters)
  expect(transformed).toEqualCode(expected)
})

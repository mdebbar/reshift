require('../test-helpers/expect-code-equality')
const reShift = require('..')

test('remove bind(this) from simple situation', () => {
  const code = '(() => {}).bind(this)'
  const expected = '() => {}'

  const transformed =
    reShift(code).add({
      capture  : '(() => {}).bind(this)',
      transform: '() => {}',
    }).toSource()
  expect(transformed).toEqualCode(expected)
})

test('remove bind(this) from complex situation', () => {
  const code = `
    const each = ((item, i, a) => {
      return item.map(((x, j) => {
        return x * i * j;
      }).bind(this))
    }).bind(that);

    function doSomething(arr) {
      arr.forEach(((item, i, a) => {
        each(item, i, a);
      }).bind(this));
    }
  `
  const expected = `
    const each = ((item, i, a) => {
      return item.map((x, j) => {
        return x * i * j;
      })
    }).bind(that);

    function doSomething(arr) {
      arr.forEach((item, i, a) => {
        each(item, i, a);
      });
    }
  `

  const transformed =
    reShift(code).add({
      capture  : '(( {{...params}} ) => { {{...body}} }).bind(this)',
      transform: '( {{...params}} ) => { {{...body}} }',
    }).toSource()
  expect(transformed).toEqualCode(expected)
})

test('convert block body with a single return to expression', () => {
  const code = `
    const fn = (arr => {
      return function() {
        arr.forEach(item => {
          return {
            arr,
            extra: 'str'
          };
        });
      };
    }).apply(null, args);
  `
  const expected = `
    const fn = (arr => function() {
      arr.forEach(item => ({
        arr,
        extra: 'str'
      }));
    }).apply(null, args);
  `

  const transformed =
    reShift(code).add({
      capture  : '( {{...params}} ) => { return {{retExpr}} }',
      transform: '( {{...params}} ) => {{retExpr}}',
    }).toSource()
  expect(transformed).toEqualCode(expected)
})

test('convert function expressions to arrow functions', () => {
  const code = `
    const fn = function(arr) {
      return function() {
        arr.forEach(function(item) {
          return item + 2;
        });
        arr.forEach(() => 0)
      };
    }.apply(null, args);
  `
  const expected = `
    const fn = arr => {
      return () => {
        arr.forEach(item => {
          return item + 2;
        });
        arr.forEach(() => 0)
      };
    }.apply(null, args);
  `

  const transformed =
    reShift(code).add({
      capture  : '(function( {{...params}} ) { {{...body}} })',
      transform: '( {{...params}} ) => { {{...body}} }',
    }).toSource()
  expect(transformed).toEqualCode(expected)
})

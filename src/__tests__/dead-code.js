require('../test-helpers/expect-code-equality')
const { namedTypes } = require('recast/lib/types')
const reShift = require('..')

test('remove if-statement when its test is falsey', () => {
  const code = `
    while (condition) {
      console.log(x);
      if (false) {
        fn();
      }
    }
    if (test) {
      if (0) {
        fn2();
        if (test2) {
          fn3();
        }
      }
      fn4();
    }
  `
  const expected = `
    while (condition) {
      console.log(x);
    }
    if (test) {
      fn4();
    }
  `

  const transformed =
    reShift(code).add({
      //capture: 'if ( {{test: Literal}} ) { {{...body}} }',
      capture  : 'if ( {{test}} ) { {{...body}} }',
      transform: '',
      filter: (path, captured) => namedTypes.Literal.check(captured.test) && !captured.test.value,
    }).toSource()
  expect(transformed).toEqualCode(expected)
})

test('remove array.forEach() when its callback is empty', () => {
  const code = `
    function fn(arr) {
      var context = this.getContext();
      arr.forEach(function(item) {});
      console.log(arr);
    }
  `
  const expected = `
    function fn(arr) {
      var context = this.getContext();
      console.log(arr);
    }
  `

  const transformed =
    reShift(code).add({
      capture  : '{{arr}}.forEach(function({{...params}}) { {{...body}} })',
      transform: '',
      filter: (path, captured) => captured.body.length === 0,
    }).toSource()
  expect(transformed).toEqualCode(expected)
})

require('../test-helpers/expect-code-equality')
const { namedTypes } = require('recast/lib/types')
const {
  reShift,
  createShifter
} = require('..');

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

  const shifter = createShifter({
    //capture: 'if ( {{test: Literal}} ) { {{...body}} }',
    capture  : 'if ( {{test}} ) { {{...body}} }',
    transform: '',
    filter: (f) => f.namedTypes.Literal.check(f.captured.test) && !f.captured.test.value,
  })
  const transformed = reShift(code, shifter)
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

  const shifter = createShifter({
    capture  : '{{arr}}.forEach(function({{...params}}) { {{...body}} })',
    transform: '',
    filter: (f) => f.captured.body.length === 0,
  })
  const transformed = reShift(code, shifter)
  expect(transformed).toEqualCode(expected)
})

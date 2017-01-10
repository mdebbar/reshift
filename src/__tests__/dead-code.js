require('../test-helpers/expect-code-equality')
const { reShift } = require('..')

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

  const shifters = [{
    //capture: 'if ( {{test: Literal}} ) { {{...body}} }',
    capture  : 'if ( {{test}} ) { {{...body}} }',

    transform: (t, f) => {
      if (!(f.types.Literal.check(f.captured.test) && !f.captured.test.value)) {
        return
      }
      t.replace('')
    },
  }]
  const transformed = reShift(code, shifters)
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

  const shifters = [{
    capture  : '{{arr}}.forEach(function({{...params}}) { {{...body}} })',

    transform: (t, f) => {
      if (f.captured.body.length !== 0) {
        return
      }
      t.replace('')
    },
  }]
  const transformed = reShift(code, shifters)
  expect(transformed).toEqualCode(expected)
})

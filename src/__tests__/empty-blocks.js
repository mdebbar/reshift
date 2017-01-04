require('../test-helpers/expect-code-equality')
const {
  reShift,
  createShifter
} = require('..');

test('remove if-statement when its block is empty', () => {
  const code = `
    while (condition) {
      console.log(x);
      if (x == y) {

      }
      if (x > y) {
        console.log(y);
      }
    }
  `
  const expected = `
    while (condition) {
      console.log(x);
      if (x > y) {
        console.log(y);
      }
    }
  `

  const shifter = createShifter({
    capture  : 'if ( {{test}} ) { {{...body}} }',
    transform: '',
    filter: (f) => f.captured.body.length === 0,
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

test('replace array.map() with `undefined` when callback is empty', () => {
  const code = `
    function fn(arr) {
      var context = this.getContext();
      const result = arr.map(function(item) {});
      console.log(result);
      return result;
    }
  `
  const expected = `
    function fn(arr) {
      var context = this.getContext();
      const result = void 0;
      console.log(result);
      return result;
    }
  `

  const shifter = createShifter({
    capture  : '{{arr}}.map(function({{...params}}) { {{...body}} })',
    transform: 'void 0',
    filter: (f) => f.captured.body.length === 0,
  })
  const transformed = reShift(code, shifter)
  expect(transformed).toEqualCode(expected)
})

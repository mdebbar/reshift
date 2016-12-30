require('../test-helpers/expect-code-equality')
const reShift = require('..')

test('convert to arrow functions and remove bind(this) and block', () => {
  const code = `
    const fn = function(arr) {
      return function() {
        arr.forEach(function(item) {
          return item + 2;
        });
        arr.forEach(() => { return 0 })
      };
    }.bind(this);
  `
  const expected = `
    const fn = arr => () => {
      arr.forEach(item => item + 2);
      arr.forEach(() => 0)
    };
  `

  const transformed =
    reShift(code).add({
      capture: '(function( {{...params}} ) { {{...body}} })',
      transform: '( {{...params}} ) => { {{...body}} }',
    }).add({
      capture: '(( {{...params}} ) => { {{...body}} }).bind(this)',
      transform: '( {{...params}} ) => { {{...body}} }',
    }).add({
      capture: '(( {{...params}} ) => { return {{retExpr}} })',
      transform: '(( {{...params}} ) => {{retExpr}})',
    }).toSource()
  expect(transformed).toEqualCode(expected)
})

require('../test-helpers/expect-code-equality')
const { run, reShift } = require('..')

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

  const shifter = (source) =>
    reShift(source, {
      capture: '(function( {{...params}} ) { {{...body}} })',
      transform: '( {{...params}} ) => { {{...body}} }',
    }, {
      capture: '(( {{...params}} ) => { {{...body}} }).bind(this)',
      transform: '( {{...params}} ) => { {{...body}} }',
    }, {
      capture: '(( {{...params}} ) => { return {{retExpr}} })',
      transform: '(( {{...params}} ) => {{retExpr}})',
    })
  const transformed = run(code, shifter)
  expect(transformed).toEqualCode(expected)
})

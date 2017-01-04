require('../test-helpers/expect-code-equality')
const { run, reShift } = require('..')

test('check if function has reference to `this`', () => {
  const code = `
    var fn = function(x, y) {
      if (x) {
        return this.calc(x);
      }
      return y;
    }
    var fn2 = function(x, y) {
      return x * y;
    }
  `
  const expected = `
    var fn = (x, y) => {
      if (x) {
        return _that.calc(x);
      }
      return y;
    }
    var fn2 = function(x, y) {
      return x * y;
    }
  `

  const shifter = (source) =>
    reShift(source, {
      capture: '(function( {{...params}}) { {{...body}} })',
      chain: reShift('{{...body}}', {
        capture: 'this',
        transform: '_that',
      }),
      transform: '( {{...params}}) => { {{...body}} }',
    })
  const transformed = run(code, shifter)
  expect(transformed).toEqualCode(expected)
})

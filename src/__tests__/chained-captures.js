require('../test-helpers/expect-code-equality')
const {
  reShift,
  createShifter
} = require('..');

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

  const shifter = createShifter({
    capture: '(function( {{...params}}) { {{...body}} })',
    filter: (f) => f.contains('this'),
    chain: reShift('{{...body}}', {
      capture: 'this',
      transform: '_that',
    }),
    transform: '( {{...params}}) => { {{...body}} }',
  })
  const transformed = reShift(code, shifter)
  expect(transformed).toEqualCode(expected)
})

test('handle `arguments` when converting to arrow functions', () => {
  const code = `
    const fn = function(arr, i) {
      obj.method.apply(null, arguments);
    };
  `
  const expected = `
    const fn = (arr, i, ...rest) => {
      const args = [arr, i, ...rest]
      obj.method.apply(null, args);
    };
  `

  const shifter = createShifter({
    capture: '(function( {{...params}} ) { {{...body}} })',
    filter: (f) => !f.contains('arguments'),
    transform: '( {{...params}} ) => { {{...body}} }',
  }, {
    capture: '(function( {{...params}} ) { {{...body}} })',
    filter: (f) => f.contains('arguments'),
    transform: (t) => {
      t.captured.params.push(t.build('...rest'))
      t.captured.body.unshift(t.build('const args = [{{...params}}]'))
      t.replace('( {{...params}} ) => { {{...body}} }')
    },
    chain: reShift('{{...body}}', {
      capture: 'arguments',
      transform: 'args',
    }),
  })
  const transformed = reShift(code, shifter)
  expect(transformed).toEqualCode(expected)
})

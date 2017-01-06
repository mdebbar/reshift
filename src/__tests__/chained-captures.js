require('../test-helpers/expect-code-equality')
const { reShift } = require('..')

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

  const shifters = [{
    capture: '(function( {{...params}}) { {{...body}} })',
    filter: (f) => f.contains('this'),
    transform: (t) =>
      t.replace('( {{...params}}) => { {{...body}} }')
      .chain(t.captured.body, [{
        capture: 'this',
        transform: '_that',
      }]),
  }]
  const transformed = reShift(code, shifters)
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

  const shifters = [{
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
      t.chain(t.captured.body, [{
        capture: 'arguments',
        transform: 'args',
      }])
    },
  }]
  const transformed = reShift(code, shifters)
  expect(transformed).toEqualCode(expected)
})

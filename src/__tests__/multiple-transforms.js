require('../test-helpers/expect-code-equality')
const { reShift } = require('..')

test('convert to arrow functions and remove bind(this) and block', () => {
  const code = `
    const fn = function(arr) {
      this.method();
      return function() {
        arr.forEach(function(item) {
          return item + 2;
        });
        console.log(this);
        arr.forEach(() => { return 0 })
      };
    }.bind(this);

    fetch(function() {
      console.log(arguments.length);
    }.bind(this))
  `
  const expected = `
    const fn = arr => {
      this.method();
      return function() {
        arr.forEach(item => item + 2);
        console.log(this);
        arr.forEach(() => 0)
      };
    };

    fetch(function() {
      console.log(arguments.length);
    }.bind(this))
  `

  const shifters = [{
    capture: '(function( {{...params}} ) { {{...body}} })',

    transform: (t, f) => {
      if (f.contains('this') || f.contains('arguments')) {
        return
      }
      t.replace('( {{...params}} ) => { {{...body}} }')
    },
  }, {
    capture: '(function( {{...params}} ) { {{...body}} }).bind(this)',

    transform: (t, f) => {
      if (f.contains('arguments')) {
        return
      }
      t.replace('( {{...params}} ) => { {{...body}} }')
    },
  }, {
    capture: '(( {{...params}} ) => { {{...body}} }).bind(this)',
    transform: '( {{...params}} ) => { {{...body}} }',
  }, {
    capture: '(( {{...params}} ) => { return {{retExpr}} })',
    transform: '(( {{...params}} ) => {{retExpr}})',
  }]
  const transformed = reShift(code, shifters)
  expect(transformed).toEqualCode(expected)
})

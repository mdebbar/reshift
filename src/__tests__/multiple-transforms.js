require('../test-helpers/expect-code-equality')
const { run, reShift } = require('..')

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

  const shifter = (source) =>
    reShift(source, {
      capture: '(function( {{...params}} ) { {{...body}} })',
      filter: (f) => !f.has('this') && !f.has('arguments'),
      transform: '( {{...params}} ) => { {{...body}} }',
    }, {
      capture: '(function( {{...params}} ) { {{...body}} }).bind(this)',
      filter: (f) => !f.has('arguments'),
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

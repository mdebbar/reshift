require('../test-helpers/expect-code-equality')
const reShift = require('..')

test.skip('check if function has reference to `this`', () => {
  const code = `
    var fn = function(x, y) {
      if (x) {
        return this.calc(x);
      }
      return y;
    }
  `
  const expected = `

  `

  const transformed =
    reShift(code).add({
      capture  : 'for ( var {{i}} = 0; {{i}} < {{arr}}.length; {{i}}++ ) { {{...body}} }',
      transform: 'Array.prototype.forEach.call({{arr}}, function(_, {{i}}) { {{...body}} })',
    }).toSource()
  expect(transformed).toEqualCode(expected)
})

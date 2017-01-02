require('../test-helpers/expect-code-equality')
const reShift = require('..')

test('convert for-loop to forEach', () => {
  const code = `
    for (var j = 0; j < list.length; j++) {
      console.log(list[j]);
    }
    for (var j = 0; test(j); j++) {
      console.log(j);
    }
  `.trim() // TODO: workaround for https://github.com/benjamn/recast/issues/356
  const expected = `
    Array.prototype.forEach.call(list, function(_, j) {
      console.log(list[j]);
    });
    for (var j = 0; test(j); j++) {
      console.log(j);
    }
  `

  const transformed =
    reShift(code).add({
      capture  : 'for ( var {{i}} = 0; {{i}} < {{arr}}.length; {{i}}++ ) { {{...body}} }',
      transform: 'Array.prototype.forEach.call({{arr}}, function(_, {{i}}) { {{...body}} })',
    }).toSource()
  expect(transformed).toEqualCode(expected)
})

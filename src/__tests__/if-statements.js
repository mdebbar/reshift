require('../test-helpers/expect-code-equality')
const reShift = require('..')

test('convert if-else to ternary operation', () => {
  const code = `
    function fn(test) {
      if (typeof test === 'function') {
        return test.call(this, false);
      } else {
        return null;
      }
    }

    function fn(test) {
      if (test) {
        return fn(test);
      } else if (test2) {
        return test2;
      }
    }
  `
  const expected = `
    function fn(test) {
      return (typeof test === 'function' ? test.call(this, false) : null);
    }

    function fn(test) {
      if (test) {
        return fn(test);
      } else if (test2) {
        return test2;
      }
    }
  `

  const transformed =
    reShift(code).add({
      capture  : 'if ( {{test}} ) { return {{ifRet}} } else { return {{elseRet}} }',
      transform: 'return {{test}} ? {{ifRet}} : {{elseRet}}',
    }).toSource()
  expect(transformed).toEqualCode(expected)
})

test('remove `else` when the `if` block returns', () => {
  const code = `
    function fn(test) {
      if (typeof test === 'function') {
        return test.call(this, false);
      } else {
        return null;
      }
    }

    function fn(test) {
      if (test) {
        return fn(test);
      } else if (test2) {
        return test2;
      } else {
        obj.something();
      }
    }
  `
  const expected = `
    function fn(test) {
      if (typeof test === 'function') {
        return test.call(this, false);
      }
      return null;
    }

    function fn(test) {
      if (test) {
        return fn(test);
      } else if (test2) {
        return test2;
      }
      obj.something();
    }
  `

  const transformed =
    reShift(code).add({
      capture  : 'if ( {{test}} ) { return {{ifRet}} } else { {{...elseBody}} }',
      // transform: 'if ( {{test}} ) { return {{ifRet}} } {{...elseBody}}',
      transform: (util) => {
        util.replace('if ( {{test}} ) { return {{ifRet}} }')
        util.insertAfter('{{...elseBody}}')
      },
    }).toSource()
  expect(transformed).toEqualCode(expected)
})

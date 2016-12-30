const diff = require('jest-diff')

const REGEX_LEADING_SPACE = /^\s*/mg
const REGEX_MULTI_SPACE = /\s\s+/g

function stripCode(code) {
  if (typeof code === 'string') {
    return code.replace(REGEX_LEADING_SPACE, '').replace(REGEX_MULTI_SPACE, '').trim()
  }
  return code
}

function toEqualCode(received, expected) {
  received = stripCode(received)
  expected = stripCode(expected)

  const pass = received === expected
  let message
  if (pass) {
    message = () =>
      this.utils.matcherHint('.not.toBe') + '\n\n' +
      'Expected code to not be the same as:\n' +
      `${this.utils.printExpected(expected)}\n` +
      'Received:\n' +
      `${this.utils.printReceived(received)}`
  } else {
    const diffString = diff(expected, received, { expand: this.expand })
    message = () =>
      this.utils.matcherHint('.toBe') + '\n\n' +
      'Expected code to be the same as:\n' +
      `${this.utils.printExpected(expected)}\n` +
      'Received:\n' +
      `${this.utils.printReceived(received)}` +
      (diffString ? `\n\nDifference:\n\n${diffString}` : '')
  }
  return { message, pass }
}

beforeAll(() => {
  expect.extend({ toEqualCode })
})

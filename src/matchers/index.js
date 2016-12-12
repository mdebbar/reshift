const typeMatchers = require('./types')
const arrayMatchers = require('./arrays')
const booleanMatchers = require('./booleans')

module.exports = Object.assign({}, typeMatchers, arrayMatchers, booleanMatchers)

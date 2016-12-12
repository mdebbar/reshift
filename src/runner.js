const fs = require('fs')
const path = require('path')
const args = process.argv.slice(2)
const [shifterPath, inputPath] = args

const recast = require('recast')
const { matchAndTransform, getAllMatches, getMatchCount } = require('./traverser2')


const { match, transform } = require(path.resolve(shifterPath))
const code = fs.readFileSync(inputPath, 'utf8')
const ast = recast.parse(code)

console.log(recast.print(ast).code)
console.log('')
console.log('      *  *  *      ')
console.log('      *  *  *      ')
console.log('')

// console.log('MATCHES:')
console.log(getMatchCount(ast, match))
console.log('\n')
const transformedAst = matchAndTransform(ast, match, transform)
console.log(recast.print(transformedAst).code)

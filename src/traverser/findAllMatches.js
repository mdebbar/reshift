const ScopeManager = require('./ScopeManager')
const traverse = require('./traverse')
const matchPattern = require('./matchPattern')
const matchScope = require('./matchScope')

function findAllMatches(ast, pattern, callback) {
  const scopeManager = new ScopeManager(ast, { ecmaVersion: 6 })

  function visitEnter(node, parent, key) {
    scopeManager.acquire(node)

    // TODO: think about creating a "pattern walker" similar to "traverse" but follows the pattern tree.
    //       It can deal with things like: '*' and  '**' for deep matching.
    //       It can also handle the scope.
    if (matchProp(parent, key, pattern)) {
      callback(node, parent, key)
      return false
    }
  }

  function visitLeave(node) {
    scopeManager.release(node)
  }

  function matchProp(parent, key, pattern) {
    switch (key) {
      // case 'capture':
      //   // TODO: capture the matched node so it can be used later.
      case 'scope':
        return matchScope(parent, pattern, scopeManager.currentScope)
      default:
        return scopeManager.wrap(parent[key],
          () => matchPattern(parent[key], pattern, matchProp)
        )
    }
  }

  traverse(ast, { enter: visitEnter, leave: visitLeave })
}

module.exports = findAllMatches

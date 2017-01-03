const assert = require('assert')

const Shifter = Symbol('Shifter')

function reShift(source, ...shifts) {
  shifts.forEach(validateShift)
  return {
    [Shifter]: true,
    source,
    shifts,
  }
}

function validateShift({ capture, chain, transform, filter }) {
  assert(
    typeof capture === 'string',
    `Expecting 'capture' of type string, got ${typeof capture}`
  )
  assert(
    typeof chain === 'undefined' || Shifter in chain,
    'Expecting \'chain\' of type reShift'
  )
  assert(
    typeof transform === 'string' || typeof transform === 'function',
    `Expecting 'transform' of type string or function, got ${typeof transform}`
  )
  assert(
    typeof filter === 'undefined' || typeof filter === 'function',
    `Expecting 'filter' of type function, got ${typeof filter}`
  )
}

module.exports = reShift

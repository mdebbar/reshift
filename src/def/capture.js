const types = require('recast/lib/types')
const { def } = types.Type
const { string } = types.builtInTypes

def('Capture')
  .bases('Node')
  .build('name')
  .field('name', string)

types.finalize()

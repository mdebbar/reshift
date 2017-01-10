const { namedTypes: n } = require('recast/lib/types')
const { build } = require('./ast-build')
const { getNodePath } = require('./ast-traverse')
const { findRootPath } = require('./ast-find')

class AstUtil {
  constructor(path, captured) {
    this.path = path
    this.captured = captured
    this.types = n
  }

  build(template, extraCaptured) {
    const captured = extraCaptured
      ? Object.assign({}, this.captured, extraCaptured)
      : this.captured
    return build(template, captured)
  }

  _getPathAndTemplate(arg1, arg2, arg3) {
    let path, template, captured
    if (typeof arg2 === 'undefined') {
      path = this.path
      template = arg1
    } else {
      path = getNodePath(findRootPath(this.path), arg1)
      template = arg2
      captured = arg3
    }
    return { path: path, template: this.build(template, captured) }
  }

  _getPathAndTemplateNoCaptured(arg1, arg2) {
    let path, template
    if (typeof arg2 === 'undefined') {
      path = this.path
      template = build(arg1)
    } else {
      path = getNodePath(findRootPath(this.path), arg1)
      template = build(arg2)
    }
    return { path: path, template: build(template) }
  }
}

module.exports = AstUtil

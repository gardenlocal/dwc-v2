const TYPES = require('../datatypes')

module.exports = class Role {
  constructor(props) {    
    this.type = TYPES.role
    Object.keys(props).forEach(key => this[key] = props[key])    
  }
}
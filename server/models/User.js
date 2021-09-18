const TYPES = require('../datatypes')

module.exports = class User {
  constructor(props) {
    this.type = TYPES.user
    Object.keys(props).forEach(key => this[key] = props[key])    
  }
}
const TYPES = require('../datatypes')

module.exports = class Role {
  constructor(props) {    
    this.type = TYPES.role
    this.name = null

    Object.keys(props).forEach(key => {
      if (!key in this) {
        console.warn('Appending a key not defined in the Role schema', key)
      }
      this[key] = props[key]
    })    

  }
}
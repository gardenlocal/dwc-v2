const TYPES = require('../datatypes')

module.exports = class Creature {
  constructor(props) {
    this.type = TYPES.creature
    Object.keys(props).forEach(key => this[key] = props[key])    
  }
}
const TYPES = require('../datatypes')

module.exports = class GardenSection {
  constructor(props) {
    this.type = TYPES.gardenSection
    this.neighbors = {
      top: null,
      right: null,
      bottom: null,
      left: null
    }
    Object.keys(props).forEach(key => this[key] = props[key])    
  }
}
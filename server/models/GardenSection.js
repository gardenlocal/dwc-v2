const TYPES = require('../datatypes')

module.exports = class GardenSection {
  constructor(props) {
    this.type = TYPES.gardenSection
    Object.keys(props).forEach(key => this[key] = props[key])    
  }
}
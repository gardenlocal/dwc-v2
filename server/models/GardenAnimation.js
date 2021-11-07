const { randomElementFromArray, randomInRange } = require('../utils');
const TYPES = require('../datatypes');
const SHAPES = {
  TRIANGLE: 'TRIANGLE',
  CIRCLE: 'CIRCLE'
}

module.exports = class GardenAnimation {
  constructor(props) {
    this.type = TYPES.gardenAnimaton;
    this.tilesNums = 2;
    const TILE1 = [
      {
        "target": randomInRange(0.3, 1.0),
        "duration": randomInRange(2500, 7500),
        "shape": randomElementFromArray(Object.values(SHAPES)),
        "anchor":randomElementFromArray([0, 1, 2, 3])
      },
      {
        "target": randomInRange(0.3, 1.0),
        "duration": randomInRange(2500, 7500),
        "shape": randomElementFromArray(Object.values(SHAPES)),
        "anchor":randomElementFromArray([0, 1, 2, 3])
      },
      {
        "target": randomInRange(0.3, 1.0),
        "duration": randomInRange(2500, 7500) ,
        "shape": randomElementFromArray(Object.values(SHAPES)),
        "anchor":randomElementFromArray([0, 1, 2, 3])
      }
    ]
    
    const TILE2 = [
      {
        "target": randomInRange(0.3, 1.0),
        "duration": randomInRange(2500, 7500),
        "shape": randomElementFromArray(Object.values(SHAPES)),
        "anchor":randomElementFromArray([0, 1, 2, 3])
      },
      {
        "target": randomInRange(0.3, 1.0),
        "duration": randomInRange(2500, 7500) ,
        "shape": randomElementFromArray(Object.values(SHAPES)),
        "anchor":randomElementFromArray([0, 1, 2, 3])
      },
      {
        "target": randomInRange(0.3, 1.0),
        "duration": randomInRange(2500, 7500) ,
        "shape": randomElementFromArray(Object.values(SHAPES)),
        "anchor":randomElementFromArray([0, 1, 2, 3])
      }
    ]
    
    const TILE3 = [
      {
        "target": randomInRange(0.3, 1.0),
        "duration": randomInRange(2500, 7500),
        "shape": randomElementFromArray(Object.values(SHAPES)),
        "anchor":randomElementFromArray([0, 1, 2, 3])
      },
      {
        "target": randomInRange(0.3, 1.0),
        "duration": randomInRange(2500, 7500) ,
        "shape": randomElementFromArray(Object.values(SHAPES)),
        "anchor":randomElementFromArray([0, 1, 2, 3])
      },
      {
        "target": randomInRange(0.3, 1.0),
        "duration": randomInRange(2500, 7500) ,
        "shape": randomElementFromArray(Object.values(SHAPES)),
        "anchor":randomElementFromArray([0, 1, 2, 3])
      }
    ]
    
    const TILE4 = [
      {
        "target": randomInRange(0.3, 1.0),
        "duration": randomInRange(2500, 7500),
        "shape": randomElementFromArray(Object.values(SHAPES)),
        "anchor":randomElementFromArray([0, 1, 2, 3])
      },
      {
        "target": randomInRange(0.3, 1.0),
        "duration": randomInRange(2500, 7500) ,
        "shape": randomElementFromArray(Object.values(SHAPES)),
        "anchor":randomElementFromArray([0, 1, 2, 3])
      },
      {
        "target": randomInRange(0.3, 1.0),
        "duration": randomInRange(2500, 7500) ,
        "shape": randomElementFromArray(Object.values(SHAPES)),
        "anchor":randomElementFromArray([0, 1, 2, 3])
      }
    ]
    
    this.tiles = [TILE1, TILE2, TILE3, TILE4]

  } 
}
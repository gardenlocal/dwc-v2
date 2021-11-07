import { distanceAndAngleBetweenTwoPoints, lerp, lerpPoint, randomElementFromArray, randomInRange, sleep } from "../utils.js";

export const SHAPES = {
  TRIANGLE: 'TRIANGLE',
  CIRCLE: 'CIRCLE'
}

export const TILE1 = [
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

export const TILE2 = [
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

export const TILE3 = [
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

export const TILE4 = [
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
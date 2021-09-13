const shuffle = require("lodash.shuffle")
const constants = require("../constants")
const db = require("../models");
const utils = require("../utils")

const Creature = db.creature

exports.createCreature = async (garden) => {
  const creature = new Creature({
    appearance: {
      radius: utils.randomInRange(50, 1200),
      fillColor: { r: utils.randomIntInRange(0, 255), g: utils.randomIntInRange(0, 255), b: utils.randomIntInRange(0, 255), a: 255 },
      strokeColor: { r: utils.randomIntInRange(0, 255), g: utils.randomIntInRange(0, 255), b: utils.randomIntInRange(0, 255), a: 255 },
      strokeWidth: (utils.randomInRange(0, 10) < 5) ? 0 : utils.randomIntInRange(1, 20)
    },
    movement: {
      fromX: utils.randomInRange(garden.x, garden.x + garden.width),
      fromY: utils.randomInRange(garden.y, garden.y + garden.height),
      directionChangeTimestamp: new Date().getTime(),
      toX: utils.randomInRange(garden.x, garden.x + garden.width),
      toY: utils.randomInRange(garden.y, garden.y + garden.height),
      transitionDuration: 20
    }
  })

  await creature.save()
  return creature
}
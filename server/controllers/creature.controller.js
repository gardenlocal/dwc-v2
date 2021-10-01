const shuffle = require("lodash.shuffle")
const constants = require("../constants")
const utils = require("../utils")
const { getUserInfo, getAllCreaturesInfo } = require('../controllers/db.controller')
const Creature = require("../models/Creature")
const database = require("../db")
const { DWC_META } = require("../../shared-constants")

let allCreatures = {}

exports.createCreature = async (garden, user) => {
  console.log('Create creature: ', user._id, user)
  let creature = new Creature({
    appearance: {
      creatureType: utils.randomElementFromArray(Object.values(DWC_META.creatures)),
      radius: utils.randomInRange(125, 250),
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
    },
    owner: user._id
  })

  creature = await database.insert(creature)
  allCreatures[creature._id] = creature

  return creature
}

exports.updateCreatures = async (onlineUsers) => {
  const updated = {}
  if (onlineUsers.length == 0) return updated

  const now = new Date().getTime()

  if (Object.keys(allCreatures).length == 0) {
    allCreatures = (await getAllCreaturesInfo()).reduce((acc, el) => {
      acc[el._id] = el
      return acc
    }, {})
  }

  for (let key in allCreatures) {
    const { directionChangeTimestamp, transitionDuration } = allCreatures[key].movement
    if (now - directionChangeTimestamp >= 1000 * transitionDuration) {
      allCreatures[key].movement.fromX = allCreatures[key].movement.toX
      allCreatures[key].movement.fromY = allCreatures[key].movement.toY

      const randomUser = onlineUsers[utils.randomIntInRange(0, onlineUsers.length)]    
      const user = await getUserInfo(randomUser)
      const garden = user.gardenSection

      allCreatures[key].movement.toX = utils.randomInRange(garden.x, garden.x + garden.width)
      allCreatures[key].movement.toY = utils.randomInRange(garden.y, garden.y + garden.height)
      allCreatures[key].movement.directionChangeTimestamp = now
      allCreatures[key].movement.transitionDuration = utils.randomIntInRange(10, 25)

      await database.update({ _id: allCreatures[key]._id }, allCreatures[key])

      updated[key] = allCreatures[key]
    }
  }

  return updated
}
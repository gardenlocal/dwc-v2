const shuffle = require("lodash.shuffle")
const constants = require("../constants")
const utils = require("../utils")
const TYPES = require('../datatypes')
const { getUserInfo, getAllCreaturesInfo } = require('../controllers/db.controller')
const Creature = require("../models/Creature")
const database = require("../db")
const { DWC_META, generateMoss, generateLichen, generateMushroom } = require("../../shared-constants")
const AnimatedProperty = require('../models/AnimatedProperty')

let allCreatures = {}

exports.createCreature = async (garden, user) => {
  console.log('Create creature: ', user.uid)

  const g = garden
  const movementTransitionDuration = utils.randomInRange(10, 20)

  const creatureType = utils.randomElementFromArray(Object.keys(DWC_META.creaturesNew))
  let creatureProps
  switch (creatureType) {
    case 'moss':
      creatureProps = generateMoss()
      break
    case 'lichen':
      creatureProps = generateLichen()
      break
    case 'mushroom':
      creatureProps = generateMushroom()
      break
  }  

  let creature = new Creature({
    appearance: {
      ...creatureProps      
    },
    movement: {
      fromX: utils.randomInRange(garden.x, garden.x + garden.width),
      fromY: utils.randomInRange(garden.y, garden.y + garden.height),
      directionChangeTimestamp: new Date().getTime(),
      toX: utils.randomInRange(garden.x, garden.x + garden.width),
      toY: utils.randomInRange(garden.y, garden.y + garden.height),
      transitionDuration: 20
    },
    animatedProperties: {
      position: new AnimatedProperty(
        DWC_META.creaturePropertyTypes.position,
        { x: utils.randomInRange(g.x, g.x + g.width), y: utils.randomInRange(g.y, g.y + g.height) },
        { x: utils.randomInRange(g.x, g.x + g.width), y: utils.randomInRange(g.y, g.y + g.height) },
        utils.randomInRange(10, 20),
        true
      )
    },
    owner: user.uid,
  })

  console.log('New creature: ', creature)

  creature = await database.insert(creature)
  allCreatures[creature._id] = creature

  return creature
}

exports.getCreatureForUser = async (uid) => {
  const creature = await database.findOne({ type: TYPES.creature, owner: uid })
  return creature
}

exports.moveCreatureToGarden = async (creature, garden) => {
  creature.movement = {
    fromX: utils.randomInRange(garden.x, garden.x + garden.width),
    fromY: utils.randomInRange(garden.y, garden.y + garden.height),
    directionChangeTimestamp: new Date().getTime(),
    toX: utils.randomInRange(garden.x, garden.x + garden.width),
    toY: utils.randomInRange(garden.y, garden.y + garden.height),
    transitionDuration: 20
  }

  creature.animatedProperties = {
    position: new AnimatedProperty(
      DWC_META.creaturePropertyTypes.position,
      { x: utils.randomInRange(garden.x, garden.x + garden.width), y: utils.randomInRange(garden.y, garden.y + garden.height) },
      { x: utils.randomInRange(garden.x, garden.x + garden.width), y: utils.randomInRange(garden.y, garden.y + garden.height) },
      utils.randomInRange(10, 20),
      true
    )
  }

  await database.update({ _id: creature._id }, creature)
}

exports.updateCreatures = async (onlineUsers) => {
  const updated = {}
  if (onlineUsers.length == 0) return updated

  const now = new Date().getTime()

  allCreatures = (await getAllCreaturesInfo()).reduce((acc, el) => {
    acc[el._id] = el
    return acc
  }, {})


  for (const [key, creature] of Object.entries(allCreatures)) {
    const { animatedProperties } = creature

    // console.log('Checking creature: ', key)

    let updatesForKey = {}
    for (const [animKey, animProp] of Object.entries(animatedProperties)) {

      if (now - animProp.startTime >= animProp.duration * 1000) {
        let type, from, to, duration

        type = animProp.type
        // console.log('----Updating property: ', type)

        // The new from is the old to
        from = animProp.to

        // The new to and duration depend on the property type      
        switch (animProp.type) {

          case DWC_META.creaturePropertyTypes.position:
            // For the position, we send the creature to a random user's garden (only online users)
            const randomUser = onlineUsers[utils.randomIntInRange(0, onlineUsers.length)]    
            const user = await getUserInfo(randomUser)
            const g = user.gardenSection      
            to = { x: utils.randomInRange(g.x, g.x + g.width), y: utils.randomInRange(g.y, g.y + g.height) }

            // Duration for now is at random, between 10 and 20
            duration = utils.randomInRange(10, 20)

            break

          case DWC_META.creaturePropertyTypes.shape:
            // For the shape, we just morph into a new shape
            to = utils.randomElementFromArray(Object.values(DWC_META.creatures))

            // Duration for now is at random, between 10 and 20
            duration = utils.randomInRange(10, 20)

            break

          default:
            break
        }

        const newAnim = new AnimatedProperty(type, from, to, duration)

        // console.log('----Updated ', animatedProperties[animKey], ' to ', newAnim)

        animatedProperties[animKey] = updatesForKey[animKey] = newAnim
      }

      if (Object.keys(updatesForKey).length > 0) {
        await database.update({ _id: creature._id }, { $set: { animatedProperties: creature.animatedProperties }})
        updated[key] = updatesForKey
      }
    }
  }
  
  // console.log('Updates: ', updated)

  return updated
    /*
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
  */  
}

exports.getAllCreaturesInfo = async () => {
  let creatures = null
  try {    
    creatures = await database.find({ type: TYPES.creature })
    if (!creatures) return []

    for (let i = 0; i < creatures.length; i++) {
      creatures[i].owner = await getUserInfo(creatures[i].owner)
    }
  } catch (e) {
    console.error("Failed to retrieve all creatures")
    return null
  }

  return creatures
}
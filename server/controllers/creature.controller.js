const shuffle = require("lodash.shuffle")
const constants = require("../constants")
const utils = require("../utils")
const TYPES = require('../datatypes')
const { getUserInfo } = require('../controllers/db.controller')
const Creature = require("../models/Creature")
const database = require("../db")
const { DWC_META, generateMoss, generateLichen, generateMushroom } = require("../../shared-constants")
const AnimatedProperty = require('../models/AnimatedProperty')
const { getConfig } = require('../config.js')

let allCreatures = {}

exports.createCreature = async (garden, user) => {
  console.log('Create creature: ', user.uid)

  const g = garden

  //const creatureType = Math.random() < 0.7 ? Object.keys(DWC_META.creaturesNew)[0] : Object.keys(DWC_META.creaturesNew)[1]//utils.randomElementFromArray(Object.keys(DWC_META.creaturesNew))
  const creatureTypes = getConfig().creatureTypes
  const creatureType = utils.randomElementFromArray(creatureTypes)
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
    animatedProperties: {
      position: await generateCreatureMovement(creatureProps.creatureType, garden)
    },
    owner: user.uid,
  })

  creature = await database.insert(creature)
  allCreatures[creature._id] = creature

  return creature
}

exports.getCreatureForUser = async (uid) => {
  const creature = await database.findOne({ type: TYPES.creature, owner: uid })
  return creature
}

exports.bringCreatureOnline = async (creature) => {
  await database.update({ _id: creature._id }, { $set: { isOnline: true } })
}

exports.bringCreatureOffline = async (uid) => {
  const creature = await exports.getCreatureForUser(uid)
  await database.update({ _id: creature._id }, { $set: { isOnline: false } })
}

exports.moveCreatureToGarden = async (creature, garden) => {
  creature.animatedProperties = {
    position: await generateCreatureMovement(creature.appearance.creatureType, garden)    
  }

  await database.update({ _id: creature._id }, creature)
}

exports.getAllCreaturesInfo = async () => {
  let creatures = null
  try {    
    creatures = await database.find({ type: TYPES.creature, isOnline: true })
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

const getGardensBounds = async () => {
  const bbox = { x1: 1000000, y1: 1000000, x2: -100000, y2: -100000 }
  const gardens = await database.find({ type: 'gardenSection' })
  for (let g of gardens) {
    bbox.x1 = Math.min(bbox.x1, g.x)
    bbox.y1 = Math.min(bbox.y1, g.y)
    bbox.x2 = Math.max(bbox.x2, g.x)
    bbox.y2 = Math.max(bbox.y2, g.y)
  }  

  bbox.x2 += 1000
  bbox.y2 += 1000
  return bbox
}

const generateCreatureMovement = async (type, ownerGarden, fromPosition, teleport) => {

  if (!fromPosition) {
    fromPosition = { x: utils.randomInRange(ownerGarden.x + 250, ownerGarden.x + ownerGarden.width - 250), y: utils.randomInRange(ownerGarden.y + 250, ownerGarden.y + ownerGarden.height - 250) }    
  }

  const gardenBoundingBox = await getGardensBounds()

  let teleportPosition = teleport ? teleport : ({ x: utils.randomInRange(ownerGarden.x + 250, ownerGarden.x + ownerGarden.width - 250), y: utils.randomInRange(ownerGarden.y + 250, ownerGarden.y + ownerGarden.height - 250) })
  let toPosition
  let direction

  switch (type) {
    case 'moss':
      let diagonalY = (Math.random() < 0.5) ? 1 : -1
      let diagonalX = (Math.random() < 0.5) ? 1 : -1
      let y = (diagonalY < 0) ? (gardenBoundingBox.y2 + 200) : (gardenBoundingBox.y1 - 200)
      let x = teleportPosition.x + diagonalX * Math.abs(y - teleportPosition.y) 

      if (x < gardenBoundingBox.x1 - 500 || x > gardenBoundingBox.x2 + 500) {
        x = (diagonalX < 0) ? (gardenBoundingBox.x1 - 200) : (gardenBoundingBox.x2 + 200)
        y = teleportPosition.y + diagonalY * Math.abs(x - teleportPosition.x)
      }
      
      toPosition = {
        x: x,
        y: y
      }
      break
    case 'mushroom':
      direction = (Math.random() < 0.5) ? 1 : -1
      toPosition = {
        x: (direction < 0) ? gardenBoundingBox.x1 - 200 : gardenBoundingBox.x2 + 200,
        y: teleportPosition.y
      }
      break
    case 'lichen':
      direction = (Math.random() < 0.5) ? 1 : -1
      toPosition = {
        x: teleportPosition.x, 
        y: (direction < 0) ? gardenBoundingBox.y1 - 200 : gardenBoundingBox.y2 + 200,
      }
      break
  }

  let duration = utils.randomInRange(0.5, 1) * utils.distance(teleportPosition, toPosition) * 0.05

  return new AnimatedProperty(
    DWC_META.creaturePropertyTypes.position,
    fromPosition,
    teleportPosition,
    toPosition,
    duration
  )
}

exports.evolveCreature = async (creatureId) => {
  const creature = await database.findOne({ _id: creatureId })  
  if (!creature) return
  console.log('evolving: ', creature._id, creature.appearance.evolutionIndex)
  if (creature.appearance.evolutionIndex != undefined) {
    creature.appearance.evolutionIndex++
    await database.update({ _id: creatureId }, creature)
  }
}

exports.updateSingleCreatureForTap = async (user, newPosition) => {
  const garden = user.gardenSection
  const creature = await exports.getCreatureForUser(user.uid)

  const creatureAnimationParams = await generateCreatureMovement(creature.appearance.creatureType, garden, null, newPosition)
  creature.animatedProperties.position = creatureAnimationParams
  await database.update({ _id: creature._id }, { $set: { animatedProperties: creature.animatedProperties }})
  
  let updated = {}
  updated[creature._id] = { position: creatureAnimationParams }

  return updated
}

exports.updateCreatures = async (onlineUsers, gardensForUid) => {
  //console.log('online users: ', onlineUsers)
  const updated = {}
  if (onlineUsers.length == 0) return updated  

  const now = new Date().getTime()

  allCreatures = (await exports.getAllCreaturesInfo()).reduce((acc, el) => {
    if (onlineUsers.indexOf(el.owner.uid) != -1)
      acc[el._id] = el
    return acc
  }, {})

  for (const [key, creature] of Object.entries(allCreatures)) {
    const { animatedProperties } = creature

    let updatesForKey = {}
    for (const [animKey, animProp] of Object.entries(animatedProperties)) {

      if (now - animProp.startTime >= animProp.duration * 1000) {
        //const ownerGarden = gardensForUid[creature.owner.uid]
        const ownerGarden = utils.randomElementFromArray(Object.values(gardensForUid))
        const creatureAnimationParams = await generateCreatureMovement(creature.appearance.creatureType, ownerGarden, animProp.to)
        animatedProperties[animKey] = updatesForKey[animKey] = creatureAnimationParams
      }

      if (Object.keys(updatesForKey).length > 0) {
        await database.update({ _id: creature._id }, { $set: { animatedProperties: creature.animatedProperties }})
        updated[key] = updatesForKey
      }
    }
  }

  return updated
}
const shuffle = require("lodash.shuffle")
const constants = require("../constants")
const database = require('../db.js')
const TYPES = require('../datatypes')
const GardenSection = require('../models/GardenSection')
const { randomElementFromArray } = require('../utils')
const { DWC_META } = require("../../shared-constants")

exports.createGardenSection = async () => {
  let gardenSection

  // Start from an arbitrary garden section
  try {
    let gardenSections = await database.find({ type: TYPES.gardenSection, x: 0, y: 0 })

    if (gardenSections && gardenSections.length > 0) {
      gardenSection = gardenSections[Math.floor(Math.random() * gardenSections.length)]
    }

  } catch (e) {
    console.error("Caught error in getting arbitrary garden section: ", e)
  }

  let newGarden = null

  // If the query didn't return any results, it means there are no gardens in the database, so we create the first one.
  if (!gardenSection) {
    newGarden = { x: 0, y: 0, width: constants.GARDEN_WIDTH, height: constants.GARDEN_HEIGHT }
  } else {
    // We do a "random" walk until we find an empty spot
    let visited = {}

    while (!newGarden) {
      visited[gardenSection._id] = true      

      let sKeys = Object.keys(gardenSection.neighbors)
      sKeys = shuffle(sKeys)

      // Find a neighbor that's not allocated
      let emptyNeighborKey = null      
      for (let key of sKeys) {
        if (!gardenSection.neighbors[key]) {
          emptyNeighborKey = key
        }
      }
      
      if (!emptyNeighborKey) {
        // If all neighbors are busy, keep going to one that wasn't visited.
        let nextId
        for (let key of sKeys) {
          console.log('Checking for ', key, ' ', gardenSection.neighbors[key])
          if (!visited[gardenSection.neighbors[key]])
            nextId = gardenSection.neighbors[key]
        }

        try {
          gardenSection = await database.findOne({ _id: nextId }) //GardenSection.findById(nextId)
        } catch (e) {
          console.error(e)
          return null
        }
      } else {
        // If we found one free neighbor, create a garden
        switch (emptyNeighborKey) {
          case 'top':
            newGarden = { x: gardenSection.x, y: gardenSection.y - constants.GARDEN_HEIGHT, width: constants.GARDEN_WIDTH, height: constants.GARDEN_HEIGHT }
            break
          case 'right':
            newGarden = { x: gardenSection.x + constants.GARDEN_WIDTH, y: gardenSection.y, width: constants.GARDEN_WIDTH, height: constants.GARDEN_HEIGHT }
            break
          case 'bottom':
            newGarden = { x: gardenSection.x, y: gardenSection.y + constants.GARDEN_HEIGHT, width: constants.GARDEN_WIDTH, height: constants.GARDEN_HEIGHT }
            break
          case 'left':
            newGarden = { x: gardenSection.x - constants.GARDEN_WIDTH, y: gardenSection.y, width: constants.GARDEN_WIDTH, height: constants.GARDEN_HEIGHT }
            break
        }
      }
    }
  }

  // Set up garden background
  newGarden.backgroundTile = randomElementFromArray(Object.values(DWC_META.tiles))
  newGarden.tileScaleX = (Math.random() < 0.5) ? -1 : 1
  newGarden.tileScaleY = (Math.random() < 0.5) ? -1 : 1

  let garden = new GardenSection({ ...newGarden })

  try {
    garden = await database.insert(garden) //garden.save()
  } catch (e) {
    console.error("Exception in trying to save garden: ", e)
    return null
  }

  let nTop, nRight, nBottom, nLeft

  try {
    nTop = await database.findOne({ type: TYPES.gardenSection, x: newGarden.x, y: newGarden.y - constants.GARDEN_HEIGHT })
    nRight = await database.findOne({ type: TYPES.gardenSection, x: newGarden.x + constants.GARDEN_WIDTH, y: newGarden.y })
    nBottom = await database.findOne({ type: TYPES.gardenSection, x: newGarden.x, y: newGarden.y + constants.GARDEN_HEIGHT })
    nLeft = await database.findOne({ type: TYPES.gardenSection, x: newGarden.x - constants.GARDEN_WIDTH, y: newGarden.y })
  } catch (e) {
    console.error('Failed to find neighbors', e)
    return null
  }

  try {
    if (nTop) {
      nTop.neighbors.bottom = garden._id
      garden.neighbors.top = nTop._id
      await database.update({ _id: nTop._id }, nTop)
      //await nTop.save()
    }
    
    if (nRight) {
      nRight.neighbors.left = garden._id
      garden.neighbors.right = nRight._id
      await database.update({ _id: nRight._id }, nRight)
    }

    if (nBottom) {
      nBottom.neighbors.top = garden._id
      garden.neighbors.bottom = nBottom._id
      await database.update({ _id: nBottom._id }, nBottom)
    }

    if (nLeft) {
      nLeft.neighbors.right = garden._id
      garden.neighbors.left = nLeft._id
      await database.update({ _id: nLeft._id }, nLeft)
    }

    await database.update({ _id: garden._id }, garden)
  } catch (e) {
    console.error("Caught exception in creating neighbors for garden: ", e)
    return null
  }

  //console.log('Created garden: ', garden)
  return garden
}

exports.clearGardenSection = async (uid) => {
  const user = await database.findOne({ uid: uid })
  const garden = await database.findOne({ _id: user.gardenSection })
  const nTop = await database.findOne({ _id: garden.neighbors.top })
  const nRight = await database.findOne({ _id: garden.neighbors.right })
  const nBottom = await database.findOne({ _id: garden.neighbors.bottom })
  const nLeft = await database.findOne({ _id: garden.neighbors.left })

  if (nTop) {
    nTop.neighbors.bottom = null
    await database.update({ _id: nTop._id }, nTop)
  }

  if (nRight) {
    nRight.neighbors.left = null
    await database.update({ _id: nLeft._id }, nLeft)
  }

  if (nBottom) {
    nBottom.neighbors.top = null
    await database.update({ _id: nBottom._id }, nBottom)
  }

  if (nLeft) {
    nLeft.neighbors.right = null
    await database.update({ _id: nLeft._id }, nLeft)
  }

  user.gardenSection = null
  await database.update({ _id: user._id }, user)

  await database.remove({ _id: garden._id })

  console.warn('clearGardenSection for user', uid)
}

const TYPES = require('../datatypes')
const database = require('../db')

const userCache = {}

exports.getAllUsersInfo = async () => {
  let users = null
  try {
    users = await database.find({ type: TYPES.user }, { _id: 1, username: 1, creature: 1, gardenSection: 1 })
    if (!users) return []

    for (let i = 0; i < users.length; i++) {
      users[i].gardenSection = await database.findOne({ _id: users[i].gardenSection })
    }
  } catch (e) {
    console.error("Error in fetching all users", e)    
  } 

  return users
}

exports.getUserInfo = async (id) => {
  if (userCache[id]) return userCache[id]

  let userData = null, gardenSection = null
  try {
    userData = await database.findOne({ _id: id })
    if (userData)
      gardenSection = await database.findOne({ _id: userData.gardenSection })

    if (userData && gardenSection) {
      userData.gardenSection = gardenSection
    }

  } catch (e) {
    console.error('Failed to retrieve user by id', id, e)
  }

  userCache[id] = userData
  return userData
}

exports.getUsersInfo = async (ids) => {
  let res = []
  for (let i = 0; i < ids.length; i++) {
    res.push(await exports.getUserInfo(ids[i]))
  }
  return res
}

exports.isUserAdmin = async (id) => {
  let userData = null
  try {
    userData = await database.findOne({ _id: id })
    role = await database.findOne({ _id: userData.role })    
  } catch (e) {
    console.error('Failed to retrieve user by id', id, e)
    return false
  }

  if (role.name == 'admin') return true
  return false
}

exports.getAllCreaturesInfo = async () => {
  let creatures = null
  try {
    //creatures = await Creature.find({}).populate("owner", "-creature").exec()
    creatures = await database.find({ type: TYPES.creature })
    if (!creatures) return []

    for (let i = 0; i < creatures.length; i++) {
      creatures[i].owner = await exports.getUserInfo(creatures[i].owner)
    }
  } catch (e) {
    console.error("Failed to retrieve all creatures")
    return null
  }
  return creatures
}
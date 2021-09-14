const db = require("../models");
const User = db.user;
const Role = db.role;
const Creature = db.creature

const userCache = {}

exports.getAllUsersInfo = async () => {
  let users = null
  try {
    users = await User.find({}, '_id username creature gardenSection')
      .populate("gardenSection")
      .exec()
  } catch (e) {
    console.error("Error in fetching all users", e)    
  } 

  return users
}

exports.getUserInfo = async (id) => {
  if (userCache[id]) return userCache[id]

  let userData = null
  try {
    userData = await User.findById(id, '_id username creature gardenSection')
      .populate("gardenSection")
      .exec()
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

exports.getAllCreaturesInfo = async () => {
  let creatures = null
  try {
    creatures = await Creature.find({}).populate("owner", "-creature").exec()
  } catch (e) {
    console.error("Failed to retrieve all creatures")
    return null
  }
  return creatures
}
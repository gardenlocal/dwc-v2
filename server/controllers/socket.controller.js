const creatureController = require('./creature.controller')
const { getUserInfo, getUsersInfo } = require('./db.controller')
const User = require('../models/User')
const database = require('../db')
const gardenController = require('./garden.controller')

const socketMap = {}
const socketIdToUserId = {}

let animationTimeout
let io = null

exports.initialize = (ioInstance) => {
  io = ioInstance
}

exports.userConnected = async (socket) => {
  const uid = socket.handshake.query.uid
  socketIdToUserId[socket.id] = uid
  socketMap[uid] = socket

  socket.on('disconnect', onDisconnect(socket))

  // Get or create user for the given uid
  let user = await getUserInfo(uid)
  if (!user) {
    user = new User({ uid });
    user = await database.insert(user)  
  }

  // Create a new garden section for the current user
  const garden = await gardenController.createGardenSection()
  if (garden) {
    user.gardenSection = garden._id
  } else {
    console.error('Failed to create garden section for user')
  }

  // Create a new creature for the user if one doesn't exist,
  // or move it in their garden if it does exist
  let creature = creatureController.getCreatureForUser(user.uid)
  if (creature) {
    creatureController.moveCreatureToGarden(creature, garden)
  } else {
    creature = await creatureController.createCreature(garden, user)
    user.creature = creature._id
    await database.update({ _id: user._id }, user)
  }

  io.emit('usersUpdate', await getOnlineUsers())
  io.emit('creatures', await getAllCreatures())
}

const onDisconnect = (socket) => async (reason) => {
  console.log('on disconnect: ', socket.id)
  const uid = socketIdToUserId[socket.id]
  
  delete socketIdToUserId[socket.id]
  delete socketMap[uid]

  await gardenController.clearGardenSection(uid)
}

const getOnlineUsers = async () => {
  console.log('get online users: ', Object.keys(socketMap))
  return (await getUsersInfo(Object.keys(socketMap)))
}

const getAllCreatures = async () => {
  return (await creatureController.getAllCreaturesInfo())
}

exports.startAnimatingCreatures = async () => {
  allCreatures = (await creatureController.getAllCreaturesInfo()).reduce((acc, el) => {
    acc[el._id] = el
    return acc
  }, {})

  /*
  animationTimeout = setInterval(async () => {
    const onlineUsers = Object.keys(socketMap)
    let updated = await creatureController.updateCreatures(onlineUsers)
    if (Object.keys(updated).length > 0) io.emit('creaturesUpdate', updated)
  }, 1000)
  */

}

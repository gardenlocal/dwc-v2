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
  socket.on('adminConnect', onAdminConnect(socket))

  // Get or create user for the given uid
  console.log('Fetching user from DB: ', uid)
  let user = await getUserInfo(uid)
  if (!user) {
    user = new User({ uid });
    await database.insert(user)  
  }
  console.log('done fetching user')
  // Remove old garden for this user, if one existed.
  await gardenController.clearGardenSection(uid)
  console.log('removed old garden')
  // Create a new garden section for the current user
  const garden = await gardenController.createGardenSection(uid)
  console.log('Creating garden for user: ', uid)
  if (garden) {
    user.gardenSection = garden._id
    await database.update({ uid: user.uid }, user)
  } else {
    console.error('Failed to create garden section for user')
  }

  // Create a new creature for the user if one doesn't exist,
  // or move it in their garden if it does exist
  let creature = await creatureController.getCreatureForUser(user.uid)
  if (creature) {
    creatureController.moveCreatureToGarden(creature, garden)
  } else {
    creature = await creatureController.createCreature(garden, user)
    console.log('created creature for user')
    user.creature = creature._id
    await database.update({ uid: user.uid }, user)
  }

  io.emit('usersUpdate', await getOnlineUsers())
  io.emit('creatures', await getAllCreatures())
}

const onAdminConnect = (socket) => async (reason) => {
  console.log('on admin connect')
  io.emit('adminConnectBroadcast', {})
}

const onDisconnect = (socket) => async (reason) => {
  console.log('on disconnect: ', socket.id)
  const uid = socketIdToUserId[socket.id]
  
  delete socketIdToUserId[socket.id]
  delete socketMap[uid]

  io.emit('usersUpdate', await getOnlineUsers())
  io.emit('creatures', await getAllCreatures())

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

  animationTimeout = setInterval(async () => {
    const onlineUsers = Object.keys(socketMap)
    let updated = await creatureController.updateCreatures(onlineUsers)
    if (Object.keys(updated).length > 0) io.emit('creaturesUpdate', updated)
  }, 1000)

}

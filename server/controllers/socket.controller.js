const creatureController = require('./creature.controller')
const { getUserInfo, getUsersInfo } = require('./db.controller')
const User = require('../models/User')
const database = require('../db')
const gardenController = require('./garden.controller')

const socketMap = {}
const socketIdToUserId = {}
const gardenForUidCache = {}

let animationTimeout
let io = null

exports.initialize = (ioInstance) => {
  io = ioInstance
}

exports.userConnected = async (socket) => {
  const uid = socket.handshake.query.uid
  const creatureName = socket.handshake.query.creatureName
  const newCreatureName = creatureName
  socketIdToUserId[socket.id] = uid
  socketMap[uid] = socket

  socket.on('disconnect', onDisconnect(socket))
  socket.on('adminConnect', onAdminConnect(socket))
  socket.on('creatureEvolve', onCreatureEvolve(socket))
  socket.on('gardenTap', onGardenTap(socket))

  // Get or create user for the given uid
  console.log('Fetching user from DB: ', uid)
  let user = await getUserInfo(uid)
  if (!user) {
    user = new User({ uid, creatureName });
    await database.insert(user)  
  }

  user.creatureName = creatureName
  // Remove old garden for this user, if one existed.
  await gardenController.clearGardenSection(uid)

  // Create a new garden section for the current user
  const garden = await gardenController.createGardenSection(uid)

  if (garden) {
    user.gardenSection = garden._id
    await database.update({ uid: user.uid }, user)
    gardenForUidCache[uid] = garden
  } else {
    console.error('Failed to create garden section for user')
  }

  // Create a new creature for the user if one doesn't exist,
  // or move it in their garden if it does exist
  let creature = await creatureController.getCreatureForUser(user.uid)
  if (creature) {
    await creatureController.moveCreatureToGarden(creature, garden)
  } else {
    creature = await creatureController.createCreature(garden, user)
    user.creature = creature._id
    await database.update({ uid: user.uid, creatureName: user.creatureName }, user)
  }

  await creatureController.bringCreatureOnline(creature)

  io.emit('usersUpdate', await getOnlineUsers())
  io.emit('creatures', await getAllCreatures())
}

const onAdminConnect = (socket) => async (reason) => {
  console.log('on admin connect')
  io.emit('adminConnectBroadcast', {})
}

const creatureEvolveTimestamps = {}

const onCreatureEvolve = (socket) => async (data) => {
  console.log('on creature evolve: ', data._id)
  const now = new Date().getTime()
  if (creatureEvolveTimestamps[data._id] && now - creatureEvolveTimestamps[data._id] < 2000) return

  await creatureController.evolveCreature(data._id)

  creatureEvolveTimestamps[data._id] = now
  io.emit('creatureEvolveBroadcast', data)
}

onGardenTap = (socket) => async (data) => {
  const uid = socketIdToUserId[socket.id]
  const user = await getUserInfo(uid)
  let updates = await creatureController.updateSingleCreatureForTap(user, data)
  io.emit('creaturesUpdate', updates)
}

const onDisconnect = (socket) => async (reason) => {
  console.log('on disconnect: ', socket.id)
  const uid = socketIdToUserId[socket.id]
  
  delete socketIdToUserId[socket.id]
  delete socketMap[uid]
  delete gardenForUidCache[uid]

  await gardenController.clearGardenSection(uid)
  await creatureController.bringCreatureOffline(uid)

  io.emit('usersUpdate', await getOnlineUsers())
  io.emit('creatures', await getAllCreatures())
}

const getOnlineUsers = async () => {
  console.log('get online users: ', Object.keys(socketMap))
  return (await getUsersInfo(Object.keys(socketMap)))
}

const getAllCreatures = async () => {
  const creatures = await creatureController.getAllCreaturesInfo()
  console.log('getAllCreatures: ', creatures.length)
  return creatures
}

exports.startAnimatingCreatures = async () => {
  allCreatures = (await creatureController.getAllCreaturesInfo()).reduce((acc, el) => {
    acc[el._id] = el
    return acc
  }, {})

  animationTimeout = setInterval(async () => {
    const onlineUsers = Object.keys(socketMap)
    let updated = await creatureController.updateCreatures(onlineUsers, gardenForUidCache)
    if (Object.keys(updated).length > 0) io.emit('creaturesUpdate', updated)
  }, 1000)

}

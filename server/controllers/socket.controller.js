const creatureController = require('./creature.controller')
const { getUsersInfo, getAllCreaturesInfo } = require('./db.controller')

const socketMap = {}
let animationTimeout
let io = null

exports.initialize = (ioInstance) => {
  io = ioInstance
}

exports.userConnected = async (socket) => {
  console.log('sock: ', socket.decodedToken)
  const userId = socket.decodedToken.id
  socketMap[userId] = socket

  socket.on('disconnect', onDisconnect(socket))
  io.emit('usersUpdate', await getOnlineUsers())
  io.emit('creatures', await getAllCreatures())
}

const onDisconnect = (socket) => async (reason) => {
  const userId = socket.decodedToken.id
  delete socketMap[userId]
  io.emit('usersUpdate', await getOnlineUsers())
}

const getOnlineUsers = async () => {
  return (await getUsersInfo(Object.keys(socketMap)))
}

const getAllCreatures = async () => {
  return (await getAllCreaturesInfo())
}

exports.startAnimatingCreatures = async () => {
  allCreatures = (await getAllCreaturesInfo()).reduce((acc, el) => {
    acc[el._id] = el
    return acc
  }, {})

  animationTimeout = setInterval(async () => {
    const onlineUsers = Object.keys(socketMap)
    let updated = await creatureController.updateCreatures(onlineUsers)
    if (Object.keys(updated).length > 0) io.emit('creaturesUpdate', updated)
  }, 1000)
}

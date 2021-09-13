const { getUsersInfo } = require('../controllers/db.controller')

const socketMap = {}
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
}

const onDisconnect = (socket) => async (reason) => {
  const userId = socket.decodedToken.id
  delete socketMap[userId]
  io.emit('usersUpdate', await getOnlineUsers())
}

const getOnlineUsers = async () => {
  return (await getUsersInfo(Object.keys(socketMap)))
}
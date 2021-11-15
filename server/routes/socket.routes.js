const { initialize, userConnected } = require('../controllers/socket.controller')

module.exports = (io) => {
  initialize(io)
    
  io.on("connection", async (socket) => {
    userConnected(socket)
  })
}
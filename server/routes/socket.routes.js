const { authorize } = require("@thream/socketio-jwt")
const { initialize, userConnected } = require('../controllers/socket.controller')
const config = require("../config/auth.config");

module.exports = (io) => {
  initialize(io)
    
  io.on("connection", async (socket) => {
    userConnected(socket)
  })
}
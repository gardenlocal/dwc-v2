const { authJwt } = require("../middleware");
const controller = require("../controllers/user.controller");
const { authorize } = require("@thream/socketio-jwt")
const config = require("../config/auth.config");

module.exports = (io) => {
  io.use(authorize({ secret: config.secret }))
  io.on("connection", async (socket) => {
    console.log('sock: ', socket.decodedToken)
  })
}
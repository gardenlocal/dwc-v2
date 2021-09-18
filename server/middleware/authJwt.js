const jwt = require("jsonwebtoken");
const config = require("../config/auth.config.js");
const dbController = require('../controllers/db.controller')

verifyToken = (req, res, next) => {
  let token = req.headers["x-access-token"];

  if (!token) {
    return res.status(403).send({ message: "No token provided!" });
  }

  jwt.verify(token, config.secret, (err, decoded) => {
    if (err) {
      return res.status(401).send({ message: "Unauthorized!" });
    }
    req.userId = decoded.id;
    next();
  });
};

isAdmin = async (req, res, next) => {
  const isAdmin = await dbController.isUserAdmin(req.userId)
  if (isAdmin) {
    next()
    return
  } else {
    res.status(403).send({ message: "Require Admin Role!" })
  }
};

const authJwt = {
  verifyToken,
  isAdmin
};
module.exports = authJwt;

const database = require('../db')
const TYPES = require('../datatypes')
const constants = require('../constants')

checkDuplicateUsernameOrEmail = async (req, res, next) => {
  const username = await database.findOne({ type: TYPES.user, username: req.body.username })

  if (!!username) {
    res.status(400).send({ message: "Failed! Username is already in use!" });
    return;
  }

  const email = await database.findOne({ type: TYPES.user, email: req.body.email })
  if (!!email) {
    res.status(400).send({ message: "Failed! Email is already in use!" });
    return;
  }

  next()
};

checkRolesExist = (req, res, next) => {
  if (req.body.roles) {
    for (let i = 0; i < req.body.roles.length; i++) {
      const ROLES = Object.keys(constants.ROLES)
      if (!ROLES.includes(req.body.roles[i])) {
        res.status(400).send({
          message: `Failed! Role ${req.body.roles[i]} does not exist!`
        });
        return;
      }
    }
  }

  next();
};

const verifySignUp = {
  checkDuplicateUsernameOrEmail,
  checkRolesExist
};

module.exports = verifySignUp;

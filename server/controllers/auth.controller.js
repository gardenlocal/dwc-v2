const gardenController = require('./garden.controller')
const creatureController = require('./creature.controller')
const database = require('../db')
const User = require('../models/User')
const GardenSection = require('../models/GardenSection')
const constants = require('../constants')
const TYPES = require('../datatypes')

var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");

const config = {
  secret: 'none'
}

exports.signup = async (req, res) => {
  try {
    const user = new User({
      username: req.body.username,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password, 8)
    });
  
    let savedUser = await database.insert(user)  
    let role = await database.findOne({ type: TYPES.role, name: constants.ROLES.user })
    savedUser.role = role._id
  
    const garden = await gardenController.createGardenSection()
    if (garden) {
      savedUser.gardenSection = garden._id
    } else {
      res.status(500).send({ message: "Failed to create garden for user" });
    }
  
    const creature = await creatureController.createCreature(garden, savedUser)
    savedUser.creature = creature._id
  
    await database.update({ _id: savedUser._id }, savedUser)  
  } catch (e) {
    console.error('Caught exception in sign up: ', e)
    res.status(500).send({ message: e })
    return
  }

  res.status(200).send({ message: "User was registered successfully!" });
};

exports.signin = async (req, res) => {
let user, authorities, gardenSection, token
  try {
    user = await database.findOne({ type: TYPES.user, username: req.body.username })
    if (!user) { return res.status(404).send({ message: "User Not found." }); }
  
    let passwordIsValid = bcrypt.compareSync(req.body.password, user.password);
    if (!passwordIsValid) { return res.status(401).send({ accessToken: null, message: 'Invalid Password'}) }
  
    token = jwt.sign({ id: user._id }, config.secret, { expiresIn: 86400 })
  
    let role = await database.findOne({ _id: user.role })

    authorities = [`ROLE_${role.name.toUpperCase()}`]
    gardenSection = await database.findOne({ _id: user.gardenSection })    
  } catch (e) {
    console.error('Caught exception in sign in: ', e)
    res.status(500).send({ message: e })
    return
  }

  res.status(200).send({
    id: user._id,
    username: user.username,
    email: user.email,
    role: authorities,
    gardenSection: gardenSection,
    accessToken: token
  });
};

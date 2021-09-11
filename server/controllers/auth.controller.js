const config = require("../config/auth.config");
const gardenController = require('./garden.controller')
const db = require("../models");
const User = db.user;
const Role = db.role;

var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");

exports.signup = async (req, res) => {
  const user = new User({
    username: req.body.username,
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, 8)
  });

  let savedUser
  try {
    savedUser = await user.save()
  } catch (e) {
    console.log('Error in saving user: ', e)
    res.status(500).send({ message: e });
    return
  }

  console.log('Saved user', savedUser)
  
  let role

  try {
    role = await Role.findOne({ name: "user" })
  } catch (e) {
    res.status(500).send({ message: e });
    return;
  }

  console.log('Got role: ', role)

  savedUser.roles = [role._id]

  const garden = await gardenController.createGardenSection()
  if (garden) {
    user.gardenSection = garden._id
  } else {
    res.status(500).send({ message: "Failed to create garden for user" });
  }

  try {
    await savedUser.save()
  } catch (e) {
    res.status(500).send({ message: e });
    return;
  }

  res.send({ message: "User was registered successfully!" });
};

exports.signin = (req, res) => {
  User.findOne({
    username: req.body.username
  })
    .populate("roles", "-__v")
    .populate("gardenSection")
    .exec((err, user) => {
      if (err) {
        res.status(500).send({ message: err });
        return;
      }

      if (!user) {
        return res.status(404).send({ message: "User Not found." });
      }

      var passwordIsValid = bcrypt.compareSync(
        req.body.password,
        user.password
      );

      if (!passwordIsValid) {
        return res.status(401).send({
          accessToken: null,
          message: "Invalid Password!"
        });
      }

      var token = jwt.sign({ id: user.id }, config.secret, {
        expiresIn: 86400 // 24 hours
      });

      var authorities = [];

      for (let i = 0; i < user.roles.length; i++) {
        authorities.push("ROLE_" + user.roles[i].name.toUpperCase());
      }
      res.status(200).send({
        id: user._id,
        username: user.username,
        email: user.email,
        roles: authorities,
        gardenSection: user.gardenSection,
        accessToken: token
      });
    });
};

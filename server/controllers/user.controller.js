const db = require("../models");
const User = db.user;
const Role = db.role;


exports.allAccess = (req, res) => {
  res.status(200).send("Public Content.");
};

exports.userBoard = (req, res) => {
  res.status(200).send("User Content.");
};

exports.adminBoard = async (req, res) => {

  let users
  try {
    users = await User.find({}, 'username gardenSection')
      .populate("gardenSection")
      .exec()
  } catch (e) {
    console.error("Error in fetching all users", e)
    res.status(500).send("Error fetching all users")
    return
  } 

  console.log('Users: ', users)
  res.status(200).send(users);
};
const { getAllUsersInfo } = require('./db.controller')

exports.allAccess = (req, res) => {
  res.status(200).send("Public Content.");
};

exports.userBoard = (req, res) => {
  res.status(200).send("User Content.");
};

exports.adminBoard = async (req, res) => {
  let users = await getAllUsersInfo()
  console.log('Users: ', users)
  res.status(200).send(users);
};
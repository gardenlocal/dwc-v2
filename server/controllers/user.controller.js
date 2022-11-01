const { getAllUsersInfo } = require("./db.controller");
const usersService = require("../service/users.service");

exports.allAccess = (req, res) => {
  res.status(200).send("Public Content.");
};

exports.userBoard = (req, res) => {
  res.status(200).send("User Content.");
};

exports.adminBoard = async (req, res) => {
  const users = await usersService.find({ where: {} });
  res.status(200).send(users);
};

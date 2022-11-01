const TYPES = require("../datatypes");
const database = require("../db");

const usersService = require("../service/users.service");

const userCache = {};

exports.getAllUsersInfo = async () => {
  let users = null;
  try {
    users = await database.find({ type: TYPES.user }, { _id: 1, username: 1, creature: 1, gardenSection: 1 });
    if (!users) return [];

    for (let i = 0; i < users.length; i++) {
      users[i].gardenSection = await database.findOne({ _id: users[i].gardenSection });
    }
  } catch (e) {
    console.error("Error in fetching all users", e);
  }

  return users;
};

exports.getUserInfo = async (uid) => {
  let userData = null;

  try {
    userData = await usersService.findByUid(uid);
  } catch (e) {
    console.error("Failed to retrieve user by uid", uid, e);
  }

  if (userData) userCache[uid] = userData;
  return userData;
};

exports.getUsersInfo = async (uids) => {
  let res = [];
  for (let i = 0; i < uids.length; i++) {
    const u = await usersService.findByUid(uids[i]);
    if (u && u.gardenSection) res.push(u);
  }
  return res;
};

exports.isUserAdmin = async (id) => {
  let userData = null;
  try {
    userData = await database.findOne({ _id: id });
    role = await database.findOne({ _id: userData.role });
  } catch (e) {
    console.error("Failed to retrieve user by id", id, e);
    return false;
  }

  if (role.name == "admin") return true;
  return false;
};

const database = require("./db");
const gardenController = require("./controllers/garden.controller");
const creatureController = require("./controllers/creature.controller");
const Role = require("./models/Role");
const User = require("./models/User");
const TYPES = require("./datatypes");
const bcrypt = require("bcryptjs");
const constants = require("./constants");
const { uid } = require("uid");

module.exports = async () => {
  // Initialize with admin user if it doesn't exist already
  return;
  const adminUser = await database.findOne({ usertype: "admin" });
  if (!adminUser) {
    let user = await database.insert(new User({ uid: uid(), usertype: "admin" }));

    const garden = await gardenController.createGardenSection();
    if (garden) {
      user.gardenSection = garden._id;
    }

    const creature = await creatureController.createCreature(garden, user);
    user.creature = creature._id;

    await database.update({ _id: user._id }, user);

    console.log("Created admin user");
  } else {
    console.log("Admin user already exists, skipping creation...");
  }
};

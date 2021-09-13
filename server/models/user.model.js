const mongoose = require("mongoose");

const User = mongoose.model(
  "User",
  new mongoose.Schema({
    username: String,
    email: String,
    password: String,
    isOnline: Boolean,
    roles: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Role"
      }
    ],
    gardenSection: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "GardenSection"
    },
    creature: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Creature"
    }
  })
);

module.exports = User;

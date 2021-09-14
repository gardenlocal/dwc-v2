const mongoose = require("mongoose");

const Creature = mongoose.model(
  "Creature",
  new mongoose.Schema({
    appearance: {
      radius: Number,
      fillColor: {
        r: Number,
        g: Number,
        b: Number,
        a: Number
      },
      strokeColor: {
        r: Number,
        g: Number,
        b: Number,
        a: Number
      },
      strokeWidth: Number
    },
    movement: {
      fromX: Number,
      fromY: Number,
      directionChangeTimestamp: Number,
      toX: Number,
      toY: Number,
      transitionDuration: Number
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  })
);

module.exports = Creature;

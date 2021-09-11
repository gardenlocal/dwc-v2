const mongoose = require("mongoose");

const GardenSection = mongoose.model(
  "GardenSection",
  new mongoose.Schema({
    x: Number,
    y: Number,
    width: Number,
    height: Number,
    neighbors: {
      top: this,
      right: this,
      bottom: this,
      left: this
    }
  })
);

module.exports = GardenSection;

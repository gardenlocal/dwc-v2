const database = require("../db.js");
const TYPES = require("../datatypes");
const { randomElementFromArray, randomIntInRange } = require("../utils");
const { DWC_META } = require("../../shared-constants");
const { getConfig } = require("../config.js");

const usersService = require("../service/users.service");
const gardensService = require("../service/gardens.service");

// NOTE: deprecated on v3
exports.createGardenSection = async (uid) => {
  let gardenSection;

  // Start from an arbitrary garden section
  try {
    let gardenSections = await database.find({ type: TYPES.gardenSection, x: 0, y: 0 });

    if (gardenSections && gardenSections.length > 0) {
      gardenSection = gardenSections[Math.floor(Math.random() * gardenSections.length)];
    }
  } catch (e) {
    console.error("Caught error in getting arbitrary garden section: ", e);
  }

  let newGarden = null;

  // If the query didn't return any results, it means there are no gardens in the database, so we create the first one.
  if (!gardenSection || gardenSection.length == 0) {
  } else {
    // We do a "random" walk until we find an empty spot
    let visited = {};
    console.log("debug-garden: ", gardenSection);
    while (!newGarden) {
      visited[gardenSection.id] = true;
    }
  }

  // Set up animation properties
  const noTiles = 4;
  const stepsPerTile = 5;

  newGarden.tileProps = [];
  for (let i = 0; i < noTiles; i++) {
    const currTile = [];
    for (let j = 0; j < stepsPerTile; j++) {
      const shapeTypes = getConfig().backgroundTypes;
      const shape = randomElementFromArray(shapeTypes);
      const target =
        shape == DWC_META.tileShapes.TRIANGLE
          ? randomElementFromArray([0.25, 0.4, 0.5, 0.6, 0.75])
          : randomElementFromArray([0.25, 0.3, 0.4, 0.75]);
      currTile.push({
        target: target,
        duration: randomIntInRange(25000, 75000),
        shape: shape,
        anchor: randomElementFromArray([0, 1, 2, 3]),
      });
    }

    newGarden.tileProps.push(currTile);
  }

  newGarden.shaderProps = {
    shaderTimeSeed: Math.random() * 10,
    shaderSpeed: Math.random() * 10 + 1,
  };

  newGarden.userUid = uid;

  try {
    garden = await database.insert(garden); //garden.save()
  } catch (e) {
    console.error("Exception in trying to save garden: ", e);
    return null;
  }

  return garden;
};

exports.clearGardenSection = async (user) => {
  if (!user) return;

  const garden = await gardensService.findOne({ where: { user_id: user.id } });
  if (!garden) return;

  await usersService.removeGarden(user.id);
  await gardensService.update(garden.id, { user_id: null });
};

exports.generateProps = (req, res) => {
  const noTiles = 4;
  const stepsPerTile = 5;
  const tiles = [];
  for (let i = 0; i < noTiles; i++) {
    const currTile = [];
    for (let j = 0; j < stepsPerTile; j++) {
      const shapeTypes = getConfig().backgroundTypes;
      const shape = randomElementFromArray(shapeTypes);
      const target =
        shape == DWC_META.tileShapes.TRIANGLE
          ? randomElementFromArray([0.25, 0.4, 0.5, 0.6, 0.75])
          : randomElementFromArray([0.25, 0.3, 0.4, 0.75]);
      currTile.push({
        target: target,
        duration: randomIntInRange(25000, 75000),
        shape: shape,
        anchor: randomElementFromArray([0, 1, 2, 3]),
      });
    }

    tiles.push(currTile);
  }

  const shader = {
    shaderTimeSeed: Math.random() * 10,
    shaderSpeed: Math.random() * 10 + 1,
  };

  res.json({
    tiles,
    shader,
  });
};

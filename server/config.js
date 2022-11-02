const { DWC_META } = require("../shared-constants.js");

const fullConfig = {
  moss: {
    type: "moss",
    weatherFetchInterval: 10000,
    creatureTypes: [DWC_META.creatures.moss],
    backgroundTypes: [DWC_META.tileShapes.TRIANGLE],
  },
  mushroom: {
    type: "mushroom",
    weatherFetchInterval: -1,
    creatureTypes: [DWC_META.creatures.mushroom],
    backgroundTypes: [DWC_META.tileShapes.CIRCLE],
  },
  lichen: {
    type: "lichen",
    weatherFetchInterval: -1,
    creatureTypes: [DWC_META.creatures.lichen],
    backgroundTypes: [DWC_META.tileShapes.TRIANGLE, DWC_META.tileShapes.CIRCLE],
  },
  all: {
    type: "all",
    weatherFetchInterval: -1,
    creatureTypes: [DWC_META.creatures.moss, DWC_META.creatures.mushroom, DWC_META.creatures.lichen],
    backgroundTypes: [DWC_META.tileShapes.TRIANGLE, DWC_META.tileShapes.CIRCLE],
  },
};

const getConfig = () => {
  return fullConfig[process.env.GARDEN_TYPE] || fullConfig.moss;
};

exports.fullConfig = fullConfig;
exports.getConfig = getConfig;

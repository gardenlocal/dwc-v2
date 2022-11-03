const utils = require("../utils");
const { DWC_META, generateMoss, generateLichen, generateMushroom } = require("../../shared-constants");
const AnimatedProperty = require("../models/AnimatedProperty");
const { getConfig } = require("../config.js");
const constants = require("../constants.js");

const creaturesService = require("../service/creatures.service");
const gardensService = require("../service/gardens.service");

let allCreatures = {};

exports.createCreature = async (garden, user) => {
  //const creatureType = Math.random() < 0.7 ? Object.keys(DWC_META.creaturesNew)[0] : Object.keys(DWC_META.creaturesNew)[1]//utils.randomElementFromArray(Object.keys(DWC_META.creaturesNew))
  const creatureTypes = getConfig().creatureTypes;
  const creatureType = utils.randomElementFromArray(creatureTypes);
  let creatureProps;
  switch (creatureType) {
    case "moss":
      creatureProps = generateMoss();
      break;
    case "lichen":
      creatureProps = generateLichen();
      break;
    case "mushroom":
      creatureProps = generateMushroom();
      break;
  }

  const creature = await creaturesService.save({
    appearance: {
      ...creatureProps,
    },
    animatedProperties: {
      position: await generateCreatureMovement(creatureProps.creatureType, garden),
    },
    user_id: user.id,
  });

  allCreatures[creature.id] = creature;

  return creature;
};

exports.bringCreatureOnline = (creature) => {
  return creaturesService.update(creature.id, { is_online: true });
};

exports.bringCreatureOffline = async (user) => {
  const creature = await creaturesService.findOne({ user_id: user.id });
  return creaturesService.update(creature.id, { is_online: false });
};

exports.moveCreatureToGarden = async (creature, garden) => {
  console.log(garden)
  creature.animatedProperties = {
    position: await generateCreatureMovement(creature.appearance.creatureType, garden),
  };

  return creaturesService.update(creature.id, creature);
};

exports.getAllCreaturesInfo = () => {
  try {
    return creaturesService.find({ is_online: true });
  } catch (e) {
    console.error("Failed to retrieve all creatures");
    return [];
  }
};

// NOTE: deprecated on v3
const getGardensBounds = async () => {
  const bbox = { x1: 100000, y1: 100000, x2: -100000, y2: -100000 };
  const gardens = await gardensService.findCharged()
  console.log("getGardensBounds", gardens)
  for (let g of gardens) {
    bbox.x1 = Math.min(bbox.x1, g.x);
    bbox.y1 = Math.min(bbox.y1, g.y);
    bbox.x2 = Math.max(bbox.x2, g.x);
    bbox.y2 = Math.max(bbox.y2, g.y);
  }

  bbox.x2 += 1000;
  bbox.y2 += 1000;
  return bbox;
};

const generateCreatureMovement = async (type, ownerGarden, fromPosition, teleport) => {
  console.log("generateCreatureMovement", ownerGarden);
  const ownerGardenX = ownerGarden.x * 1000;
  const ownerGardenY = ownerGarden.y * 1000;
  const ownerGardenWidth = constants.GARDEN_WIDTH;
  const ownerGardenHeight = constants.GARDEN_HEIGHT;

  if (!fromPosition) {
    fromPosition = {
      x: utils.randomInRange(ownerGardenX + 250, ownerGardenX + ownerGardenWidth - 250),
      y: utils.randomInRange(ownerGardenY + 250, ownerGardenY + ownerGardenHeight - 250),
    };
  }

  const gardenBoundingBox = await getGardensBounds();
  console.log("gardenBoundingBox",gardenBoundingBox);
  let teleportPosition = teleport
    ? teleport
    : {
        x: utils.randomInRange(ownerGardenX + 250, ownerGardenX + ownerGardenWidth - 250),
        y: utils.randomInRange(ownerGardenY + 250, ownerGardenY + ownerGardenHeight - 250),
      };
  let toPosition;
  let direction;
  console.log("nextPosition", teleportPosition);

  switch (type) {
    case "moss":
      let diagonalY = Math.random() < 0.5 ? 1 : -1;
      let diagonalX = Math.random() < 0.5 ? 1 : -1;
      let y = diagonalY < 0 ? gardenBoundingBox.y2 + 200 : gardenBoundingBox.y1 - 200;
      let x = teleportPosition.x + diagonalX * Math.abs(y - teleportPosition.y);

      if (x < gardenBoundingBox.x1 - 500 || x > gardenBoundingBox.x2 + 500) {
        x = diagonalX < 0 ? gardenBoundingBox.x1 - 200 : gardenBoundingBox.x2 + 200;
        y = teleportPosition.y + diagonalY * Math.abs(x - teleportPosition.x);
      }

      toPosition = {
        x: x,
        y: y,
      };
      break;
    case "mushroom":
      direction = Math.random() < 0.5 ? 1 : -1;
      toPosition = {
        x: direction < 0 ? gardenBoundingBox.x1 - 200 : gardenBoundingBox.x2 + 200,
        y: teleportPosition.y,
      };
      break;
    case "lichen":
      direction = Math.random() < 0.5 ? 1 : -1;
      toPosition = {
        x: teleportPosition.x,
        y: direction < 0 ? gardenBoundingBox.y1 - 200 : gardenBoundingBox.y2 + 200,
      };
      break;
  }

  let duration = utils.randomInRange(0.5, 1) * utils.distance(teleportPosition, toPosition) * 0.05;

  return new AnimatedProperty(
    DWC_META.creaturePropertyTypes.position,
    fromPosition,
    teleportPosition,
    toPosition,
    duration
  );
};

exports.evolveCreature = async (creatureId) => {
  const creature = await creaturesService.findById(creatureId);
  if (!creature) return;
  if (creature.appearance.evolutionIndex != undefined) {
    creature.appearance.evolutionIndex++;
    await creaturesService.update(creatureId, creature);
  }
};

exports.updateSingleCreatureForTap = async (user, newPosition) => {
  const garden = user.gardenSection;
  const creature = await creaturesService.findOne({ user_id: user.id });

  const creatureAnimationParams = await generateCreatureMovement(
    creature.appearance.creatureType,
    garden,
    null,
    {x: -1000, y:-1000}
  );
  creature.animatedProperties.position = creatureAnimationParams;
  console.log("tap", creature.animatedProperties);
  let updated = {};
  updated[creature.id] = { position: creatureAnimationParams };
  await creaturesService.update(creature.id, creature);
  return updated;
};

exports.updateCreatures = async (onlineUserUids, gardensForUid) => {
  //console.log('online users: ', onlineUsers)
  const updated = {};
  if (onlineUserUids.length == 0) return updated;

  const now = new Date().getTime();

  const onlineCreatures = await exports.getAllCreaturesInfo();
  allCreatures = onlineCreatures.reduce((acc, el) => {
    if (onlineUserUids.indexOf(el.user.uid) != -1) acc[el.id] = el;
    return acc;
  }, {});

  for (const [key, creature] of Object.entries(allCreatures)) {
    const { animatedProperties } = creature;

    let updatesForKey = {};
    for (const [animKey, animProp] of Object.entries(animatedProperties)) {
      if (now - animProp.startTime >= animProp.duration * 1000) {
        //const ownerGarden = gardensForUid[creature.owner.uid]
        const ownerGarden = utils.randomElementFromArray(Object.values(gardensForUid));
        const creatureAnimationParams = await generateCreatureMovement(
          creature.appearance.creatureType,
          ownerGarden,
          animProp.to
        );
        animatedProperties[animKey] = updatesForKey[animKey] = creatureAnimationParams;
      }

      if (Object.keys(updatesForKey).length > 0) {
        await creaturesService.update(creature.id, { animatedProperties: creature.animatedProperties });
        updated[key] = updatesForKey;
      }
    }
  }

  return updated;
};

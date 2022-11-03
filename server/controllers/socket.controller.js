const creatureController = require("./creature.controller");
const { getUserInfo, getUsersInfo } = require("./db.controller");
const gardenController = require("./garden.controller");

const creaturesService = require("../service/creatures.service");
const usersService = require("../service/users.service");

const socketMap = {};
const socketIdToUserId = {};
const gardenForUidCache = {};

let animationTimeout;
let io = null;

exports.initialize = (ioInstance) => {
  io = ioInstance;
};

exports.userConnected = async (socket) => {
  const uid = socket.handshake.query.uid;
  const creatureName = socket.handshake.query.creatureName;
  const newCreatureName = creatureName;
  socketIdToUserId[socket.id] = uid;
  socketMap[uid] = socket;

  socket.on("disconnect", onDisconnect(socket));
  socket.on("adminConnect", onAdminConnect(socket));
  socket.on("creatureEvolve", onCreatureEvolve(socket));
  socket.on("gardenTap", onGardenTap(socket));

  // Get or create user for the given uid
  console.log("Fetching user from DB: ", uid);
  let user = await usersService.findByUid(uid);

  if (!user) {
    user = await usersService.create({ uid, creatureName });
  }

  user.creatureName = creatureName;
  // Remove old garden for this user, if one existed.
  await gardenController.clearGardenSection(user);

  // Create a new garden section for the current user
  user = await usersService.assignGarden(user.id);
  const garden = user.gardenSection;

  gardenForUidCache[uid] = garden;

  // Create a new creature for the user if one doesn't exist,
  // or move it in their garden if it does exist
  let creature = await creaturesService.findOne({ user_id: user.id });

  if (creature) {
    await creatureController.moveCreatureToGarden(creature, garden);
  } else {
    creature = await creatureController.createCreature(garden, user);
    console.log(user)
    console.log(creature)
    await usersService.update(user.id, { ...user, creature_id: creature.id });
  }

  await creatureController.bringCreatureOnline(creature);

  io.emit("usersUpdate", await getOnlineUsers());

  const creatures = await getAllCreatures();
  const creaturesString = JSON.stringify(creatures, (key, val) => {
    return val && val.toFixed ? Number(val.toFixed(3)) : val;
  });
  io.emit("creatures", creaturesString);
};

const onAdminConnect = (socket) => async (reason) => {
  console.log("on admin connect");
  io.emit("adminConnectBroadcast", {});
};

const creatureEvolveTimestamps = {};

const onCreatureEvolve = (socket) => async (creature) => {
  console.log("on creature evolve: ", creature.id);
  const now = new Date().getTime();
  if (creatureEvolveTimestamps[creature.id] && now - creatureEvolveTimestamps[creature.id] < 2000) return;
  await creatureController.evolveCreature(creature.id);
  creatureEvolveTimestamps[creature.id] = now;
  io.emit("creatureEvolveBroadcast", creature);
};

onGardenTap = (socket) => async (data) => {
  console.log(data)
  const uid = socketIdToUserId[socket.id];
  const user = await getUserInfo(uid);
  let updates = await creatureController.updateSingleCreatureForTap(user, data);
  io.emit("creaturesUpdate", updates);
};

const onDisconnect = (socket) => async (reason) => {
  console.log("on disconnect: ", socket.id);
  const uid = socketIdToUserId[socket.id];

  delete socketIdToUserId[socket.id];
  delete socketMap[uid];
  delete gardenForUidCache[uid];

  const user = await usersService.findByUid(uid);

  if (user) {
    await gardenController.clearGardenSection(user);
    await creatureController.bringCreatureOffline(user);
  }

  const onlineUsers = await getOnlineUsers();
  io.emit("usersUpdate", onlineUsers);

  const creatures = await getAllCreatures();
  const creaturesString = JSON.stringify(creatures, (key, val) => {
    return val && val.toFixed ? Number(val.toFixed(3)) : val;
  });

  io.emit("creatures", creaturesString);
};

const getOnlineUsers = () => {
  return getUsersInfo(Object.keys(socketMap));
};

const getAllCreatures = () => {
  return creatureController.getAllCreaturesInfo();
};

exports.startAnimatingCreatures = async () => {
  const onlineCreatures = await creatureController.getAllCreaturesInfo();
  allCreatures = onlineCreatures.reduce((acc, el) => {
    acc[el.id] = el;
    return acc;
  }, {});

  animationTimeout = setInterval(async () => {
    const onlineUsers = Object.keys(socketMap);

    if (Object.keys(gardenForUidCache).length) {
      let updated = await creatureController.updateCreatures(onlineUsers, gardenForUidCache);
      if (Object.keys(updated).length > 0) io.emit("creaturesUpdate", updated);
    }
    
  }, 1000);
};

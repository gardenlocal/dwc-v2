const shuffle = require("lodash.shuffle")
const config = require("../config/auth.config");
const constants = require("../constants")
const db = require("../models");
const User = db.user;
const Role = db.role;
const GardenSection = db.gardenSection

var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");

const findEmptyGardenSection = async () => {
  let gardenSection

  // Start from an arbitrary garden section
  try {
    gardenSection = await GardenSection.findOne({}).exec()
  } catch (e) {
    console.error("Caught error in getting all garden sections: ", e)
  }

  let newGarden = null

  // If the query didn't return any results, it means there are no gardens in the database, so we create the first one.
  if (!gardenSection) {
    newGarden = { x: 0, y: 0, width: constants.GARDEN_WIDTH, height: constants.GARDEN_HEIGHT }
  } else {
    // We do a "random" walk until we find an empty spot
    let visited = {}

    while (!newGarden) {
      visited[gardenSection._id] = true

      let sKeys = Object.keys(gardenSection.neighbors)
      sKeys = shuffle(sKeys)

      console.log('Shuffled keys: ', sKeys)

      // Find a neighbor that's not allocated
      let emptyNeighborKey = null      
      for (let key of sKeys) {
        if (!gardenSection.neighbors[key]) {
          emptyNeighborKey = key
        }
      }
      
      if (!emptyNeighborKey) {
        // If all neighbors are busy, keep going to one that wasn't visited.
        let nextId
        for (let key of sKeys) {
          if (!visited[gardenSection.neighbors[key]])
            nextId = gardenSection.neighbors[key]
        }

        try {
          gardenSection = await GardenSection.findById(nextId)
        } catch (e) {
          console.error(e)
          return null
        }
      } else {
        // If we found one free neighbor, create a garden
        console.log('Empty neighbor key: ', emptyNeighborKey)
        switch (emptyNeighborKey) {
          case 'top':
            newGarden = { x: gardenSection.x, y: gardenSection.y - constants.GARDEN_HEIGHT, width: constants.GARDEN_WIDTH, height: constants.GARDEN_HEIGHT }
            break
          case 'right':
            newGarden = { x: gardenSection.x + constants.GARDEN_WIDTH, y: gardenSection.y, width: constants.GARDEN_WIDTH, height: constants.GARDEN_HEIGHT }
            break
          case 'bottom':
            newGarden = { x: gardenSection.x, y: gardenSection.y + constants.GARDEN_HEIGHT, width: constants.GARDEN_WIDTH, height: constants.GARDEN_HEIGHT }
            break
          case 'left':
            newGarden = { x: gardenSection.x - constants.GARDEN_WIDTH, y: gardenSection.y, width: constants.GARDEN_WIDTH, height: constants.GARDEN_HEIGHT }
            break
        }

        console.log('new garden: ', gardenSection, newGarden)
      }
    }
  }

  let garden = new GardenSection({ ...newGarden })

  try {
    await garden.save()
  } catch (e) {
    console.error("Exception in trying to save garden: ", e)
    return null
  }

  let nTop, nRight, nBottom, nLeft

  try {
    nTop = await GardenSection.findOne({x: newGarden.x, y: newGarden.y - constants.GARDEN_HEIGHT })
    nRight = await GardenSection.findOne({x: newGarden.x + constants.GARDEN_WIDTH, y: newGarden.y })
    nBottom = await GardenSection.findOne({x: newGarden.x, y: newGarden.y + constants.GARDEN_HEIGHT })
    nLeft = await GardenSection.findOne({x: newGarden.x - constants.GARDEN_WIDTH, y: newGarden.y })
  } catch (e) {
    console.error('Failed to find neighbors', e)
    return null
  }

  try {
    if (nTop) {
      nTop.neighbors.bottom = garden._id
      garden.neighbors.top = nTop._id
      await nTop.save()
    }
    
    if (nRight) {
      nRight.neighbors.left = garden._id
      garden.neighbors.right = nRight._id
      await nRight.save()
    }

    if (nBottom) {
      nBottom.neighbors.top = garden._id
      garden.neighbors.bottom = nBottom._id
      await nBottom.save()
    }

    if (nLeft) {
      nLeft.neighbors.right = garden._id
      garden.neighbors.left = nLeft._id
      await nLeft.save()
    }
    await garden.save()
  } catch (e) {
    console.error("Caught exception in creating neighbors for garden: ", e)
    return null
  }

  console.log('Created garden: ', garden)
  return garden
}

exports.signup = async (req, res) => {
  const user = new User({
    username: req.body.username,
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, 8)
  });

  let savedUser
  try {
    savedUser = await user.save()
  } catch (e) {
    console.log('Error in saving user: ', e)
    res.status(500).send({ message: e });
    return
  }

  console.log('Saved user', savedUser)
  
  let role

  try {
    role = await Role.findOne({ name: "user" })
  } catch (e) {
    res.status(500).send({ message: e });
    return;
  }

  console.log('Got role: ', role)

  savedUser.roles = [role._id]

  const garden = await findEmptyGardenSection()
  if (garden) {
    user.gardenSection = garden._id
  } else {
    res.status(500).send({ message: "Failed to create garden for user" });
  }

  try {
    await savedUser.save()
  } catch (e) {
    res.status(500).send({ message: e });
    return;
  }

  res.send({ message: "User was registered successfully!" });

  /*
  user.save((err, user) => {
    if (err) {
      res.status(500).send({ message: err });
      return;
    }

    Role.findOne({ name: "user" }, (err, role) => {
      if (err) {
        res.status(500).send({ message: err });
        return;
      }

      user.roles = [role._id];
      user.save(err => {
        if (err) {
          res.status(500).send({ message: err });
          return;
        }

        res.send({ message: "User was registered successfully!" });
      });
    });
  });
  */
};

exports.signin = (req, res) => {
  User.findOne({
    username: req.body.username
  })
    .populate("roles", "-__v")
    .exec((err, user) => {
      if (err) {
        res.status(500).send({ message: err });
        return;
      }

      if (!user) {
        return res.status(404).send({ message: "User Not found." });
      }

      var passwordIsValid = bcrypt.compareSync(
        req.body.password,
        user.password
      );

      if (!passwordIsValid) {
        return res.status(401).send({
          accessToken: null,
          message: "Invalid Password!"
        });
      }

      var token = jwt.sign({ id: user.id }, config.secret, {
        expiresIn: 86400 // 24 hours
      });

      var authorities = [];

      for (let i = 0; i < user.roles.length; i++) {
        authorities.push("ROLE_" + user.roles[i].name.toUpperCase());
      }
      res.status(200).send({
        id: user._id,
        username: user.username,
        email: user.email,
        roles: authorities,
        accessToken: token
      });
    });
};

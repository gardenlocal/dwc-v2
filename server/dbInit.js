const database = require('./db')
const gardenController = require('./controllers/garden.controller')
const creatureController = require('./controllers/creature.controller')
const Role = require('./models/Role')
const User = require('./models/User')
const TYPES = require('./datatypes')
const bcrypt = require("bcryptjs");
const constants = require('./constants')

module.exports = async () => {
  const roleCount = await database.count({ type: TYPES.role })
  console.log('Role count is: ', roleCount)

  // Initialize roles if they don't exist already
  if (roleCount == 0) {
    await database.insert(new Role({ name: 'user' }))
    await database.insert(new Role({ name: 'admin' }))
  } else {
    console.log('Roles already created, skipping creation...')
  }

  // Initialize with admin user if it doesn't exist already
  const adminUser = await database.findOne({ type: TYPES.user, username: 'admin'})
  if (!adminUser) {
    const adminRole = await database.findOne({ type: TYPES.role, name: constants.ROLES.admin })
    let user = await database.insert(new User({ username: 'admin', email: 'admin@cezar.io', password: bcrypt.hashSync(constants.DB_ADMIN_PASSWORD, 8), role: adminRole._id }))

    const garden = await gardenController.createGardenSection()
    if (garden) {
      user.gardenSection = garden._id
    }

    const creature = await creatureController.createCreature(garden, user)
    user.creature = creature._id    

    await database.update({ _id: user._id }, user)

    console.log('Created admin user')
  } else {
    console.log('Admin user already exists, skipping creation...')
  }
}
const Datastore = require('nedb-promises')
const database = Datastore.create('db/main.db')
const Role = require('./models/Role')
const User = require('./models/User')
const TYPES = require('./datatypes')
const bcrypt = require("bcryptjs");
const constants = require('./constants')

console.log('Successfully connected to nedb')

const initializeDB = async () => {
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
  const adminUser = await database.findOne({ type: TYPES.user, name: 'admin'})
  if (!adminUser) {
    await database.insert(new User({ name: 'admin', email: 'admin@cezar.io', password: bcrypt.hashSync(DB_ADMIN_PASSWORD, 8)}))
  } else {
    console.log('Admin user already exists, skipping creation...')
  }
}

initializeDB()

module.exports = database
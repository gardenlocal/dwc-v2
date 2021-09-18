const Datastore = require('nedb-promises')
const database = Datastore.create('db/main.db')
const Role = require('./models/Role')
const TYPES = require('./datatypes')
console.log('Successfully connected to nedb')

const initializeDB = async() => {
  const roleCount = await database.count({ type: TYPES.role })
  console.log('Role count is: ', roleCount)

  if (roleCount == 0) {
    await database.insert(new Role({ name: 'user' }))
    await database.insert(new Role({ name: 'admin' }))
  } else {
    console.log('Roles already created, skipping...')
  }
  /*
  Role.estimatedDocumentCount((err, count) => {
    if (!err && count === 0) {
      new Role({ name: "user" }).save(err => {
        if (err) { console.log("error", err); }
        console.log("added 'user' to roles collection");
      });

      new Role({ name: "admin" }).save(err => {
        if (err) { console.log("error", err); }
        console.log("added 'admin' to roles collection");
      });
    }
  });
  */
}

initializeDB()

module.exports = database
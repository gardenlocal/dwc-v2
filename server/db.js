const Datastore = require('nedb-promises')
const database = Datastore.create('storage/main.db')

console.log('Successfully connected to nedb')

module.exports = database
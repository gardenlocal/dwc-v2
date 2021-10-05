export const globalData = {}
export const globals = {}
export let globalUsers = {}
export let globalCreatures = {}

// const updateCreatures = (newData) => {
//   console.log("update Creatures")
//   console.log(newData)
// }

export const updateGlobalData = (data) => {
  
  console.log('update Global data is: ', globalData)
}

export function updateUsers (users) {
  let onlineUsers = {}
  for (let i = 0; i < users.length; i++) {
    const user = users[i];
    const username = users[i].username;
    const key = username
    const value = user
    onlineUsers[key] = value;
  }
  // globalUsers = onlineUsers
  return onlineUsers
}

export function updateCreatures (creatures, users) {
  let onlineCreatures = {}
  let userNamesCreatureIds = {}
  for (const [key, value] of Object.entries(users)) {
    userNamesCreatureIds[value.creature] = {'username': value.username, 'gardenSection': value.gardenSection }
  }

  // add creature that belongs to onlineUsers
  creatures.forEach(elem => {
    if (Object.keys(userNamesCreatureIds).includes(elem._id)) {
      const c = userNamesCreatureIds[elem._id]
      const value = elem
      value.owner = c.username
      value.gardenSection = c.gardenSection
      onlineCreatures[elem._id] = value
    } 
  })
  // globalCreatures = onlineCreatures;
  return onlineCreatures
}
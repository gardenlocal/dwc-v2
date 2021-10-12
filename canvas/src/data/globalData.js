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
    if(users[i]) {
      const user = users[i];
      const username = users[i].username;
      const key = username
      const value = user
      onlineUsers[key] = value;
    }
  }
  // globalUsers = onlineUsers
  return onlineUsers
}

export function updateCreatures (creatures, users) {
  let onlineCreatures = {}

  const onlineUsers = Object.keys(users);

  for(let i = 0; i < creatures.length; i++){
    const c = creatures[i];

    // check if creature's owner is online
    if(onlineUsers.includes(c.owner.username)) { 
      onlineCreatures[c._id] = c;     
    }
  }

  globalCreatures = onlineCreatures;

  return onlineCreatures
}
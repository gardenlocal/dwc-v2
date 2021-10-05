export const globalData = {}
export const creatures = {}
export const globals = {}

const updateCreatures = (newData) => {
  console.log("update Creatures")
  console.log(newData)
}

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
  return onlineUsers
}
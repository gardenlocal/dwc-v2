import Creature from './creature'

export const globalData = {}
export const creatures = {}
export const globals = {}

const updateCreatures = (newData) => {
  for (let c of newData) {
    if (!creatures[c._id]) {
      creatures[c._id] = new Creature(globals.p5, c)
    } else {
      creatures[c._id].updateState(c)
    }    
  }
}

export const updateGlobalData = (data) => {
  Object.keys(data).forEach(k => {    
    if (k == 'creatures') {
      updateCreatures(data[k])
    } else {
      globalData[k] = data[k]
    }    
  })


  console.log('Global data is: ', globalData)
}
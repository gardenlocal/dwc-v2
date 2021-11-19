import { sleep } from './src/render/utils.js';
import PixiApp from './src/index'
import { uid } from 'uid';
import { io } from 'socket.io-client';
import axios from 'axios';
// import 'regenerator-runtime/runtime'

const WEATHER_API = `http://192.168.0.105:3005/weather`

class App {
  constructor() {
    this.creatureName = window.CREATURE_NAME;
    this.pathname = window.location.pathname
    this.isTest = this.pathname == '/test'
  }

  async setup() {
    // intro html
    const introDiv = document.querySelector('.intro');
    if (introDiv) {
      introDiv.classList.add("hidden")
      setTimeout(() => {
        if (introDiv)
          introDiv.remove()
      }, 2000)
    }

    window.TEMPERATURE = 5
    window.HUMIDITY = 55

    this.user = this.createOrFetchUser()

    this.serverPort = window.location.hostname.includes('iptime') ? '1012' : '3000'
    this.serverUrl = `http://${window.location.hostname}`

    this.pixiApp = new PixiApp({ isAdmin: this.pathname == '/admin' })

    this.fetchWeatherData()
    setInterval(this.fetchWeatherData, 10000)
    
    await this.pixiApp.loadAssets()
    this.pixiApp.resizeAppToWindow()

    this.socket = await io(`${this.serverUrl}:${this.serverPort}`, {
      query: {
        uid: this.user.id,
        creatureName: this.user.creatureName
      }
    })

    // client's UID
    window.UID = this.user.id

    this.socket.on('connect', this.onSocketConnect)
    this.socket.on('connect_error', this.onSocketConnectError)
    this.socket.on('usersUpdate', this.onUsersUpdate)
    this.socket.on('creatures', this.onCreatures)
    this.socket.on('creaturesUpdate', this.onCreaturesUpdate)
    this.socket.on('adminConnectBroadcast', this.onAdminConnect)
    this.socket.on('creatureEvolveBroadcast', this.onCreatureEvolve)
    this.socket.on('disconnect', () => { window.location.reload() })

    this.selfGarden = null
    this.onlineCreatures = {}
    this.onlineUsers = {}
    this.initData = {
      creatures: false,
      users: false,
      firstRender: false
    }

    window.addEventListener('visibilitychange', this.onVisibilityChange)
  }

  onVisibilityChange = (e) => {
    const active = (document.visibilityState == 'visible')
    console.log('is active: ', active)
    if (!active) {
      this.socket.disconnect()
      this.initData.firstRender = false
      this.pixiApp.stop()
      this.onlineCreatures = {}
      this.onlineUsers = {}
    } else {
      this.socket.connect()      
      // this.pixiApp.reset()
    }
  }

  hasAdminSequence() {
    console.log(window.location)
    if (window.location.search.indexOf('sequence') != -1) return true
    return false
  }
  
  getIsAdmin() {
    return (this.pathname == '/admin')
  }

  renderAppIfReady() {
    if (this.initData.creatures && this.initData.users && !this.initData.firstRender) {
      this.pixiApp.render()
      this.initData.firstRender = true
    }
  }

  onSocketConnect = () => {
    console.log('on socket connect')
    if (this.getIsAdmin()) {
      this.socket.emit('adminConnect', {})
    }
  }

  onSocketConnectError = (error) => {
    console.log('on socket connect error: ', error)
  }

  onAdminConnect = () => {
    if (this.getIsAdmin()) return
    this.pixiApp.reset()
  }

  sendEvolveCreature = (_id) => {
    this.socket.emit('creatureEvolve', { _id })
  }

  sendGardenTap = (coords) => {
    this.socket.emit('gardenTap', coords)
  }

  onCreatureEvolve = ({ _id }) => {
    this.pixiApp.evolveCreature(_id)
  }

  onUsersUpdate = (users) => {
    console.log('onUsersUpdate: ', JSON.stringify(users).length, Object.keys(users).length)
    console.log(users)
    // get single user's garden data
    const currUser = users.find((u => (u.uid == this.user.id)))
    this.selfGarden = currUser ? currUser.gardenSection : null
    this.selfUid = currUser ? currUser.uid : null

    // get all online users
    this.onlineUsers = users.reduce((acc, el) => {
      acc[el.uid] = el
      return acc
    }, {})

    this.updateOnlineCreatures()

    this.initData.users = true
    this.renderAppIfReady()
  }

  onCreatures = (creaturesString) => {
    const creatures = JSON.parse(creaturesString)
    console.log('onCreatures: ', JSON.stringify(creatures).length, Object.keys(creatures).length)
    console.log(creatures)

    this.updateOnlineCreatures(creatures)    

    this.initData.creatures = true
    this.renderAppIfReady()
  }

  updateOnlineCreatures = (creatures) => {
    let onlineCreatures = creatures || Object.values(this.onlineCreatures)

    this.onlineCreatures = onlineCreatures.reduce((acc, el) => {
      if (!!this.onlineUsers[el.owner?.uid]) {
        acc[el._id] = el
      }
      return acc
    }, {})

    this.pixiApp.updateOnlineCreatures(this.onlineUsers, this.onlineCreatures)
    return this.onlineCreatures  
  }

  onCreaturesUpdate = (creaturesToUpdate) => {
    this.pixiApp.updateCreatureData(creaturesToUpdate)
  }

  createOrFetchUser() {
    if (this.isTest) {
      return {
        id: uid(),
        name: '',
        creatureName: this.creatureName
      }  
    }

    let user = localStorage.getItem("user")

    // need to update if existing user gives new creature name
    if(user){
      let updateUser =  JSON.parse(user)
      updateUser.creatureName = this.creatureName;
      updateUser = JSON.stringify(updateUser)
      localStorage.setItem("user", updateUser)
      user = updateUser
    }

    if (!user) {
      user = JSON.stringify({
        id: uid(),
        name: '',
        creatureName: this.creatureName
      })
      localStorage.setItem("user", user)
    }
    console.log("app.js createOrFetchUser ------------ user? ", user)

    return JSON.parse(user)
  }

  async fetchWeatherData() {
    let weather
    try {
      weather = await axios.get(WEATHER_API)
      console.log('weather: ', weather)
    } catch (error) {
      console.log("ERROR ------------ ", error)
      return new Promise((res, rej) => res())
    } finally {
      if (weather && weather.data) {
        const weatherData = weather.data;
        console.log("fetchWeatherData -------------", weatherData)
    
        window.TEMPERATURE = weatherData.temperature;
        window.HUMIDITY = weatherData.humidity;  
      }  
    }
  }
}

window.startApp = () => {
  window.APP = new App()
  window.APP.setup()
}

window.submitLogin = (event) => {
  event.preventDefault();

  window.CREATURE_NAME = event.target[0].value;
  
  // Please don't touch this, it's hacky af, but it fixes a weird bug on Android.
  const inputEl = document.getElementById('creatureName')
  inputEl.setAttribute('readonly', 'readonly')
  inputEl.setAttribute('disabled', true)
  setTimeout(() => {
    inputEl.blur()
    inputEl.removeAttribute('readonly')
    inputEl.removeAttribute('disabled')
    setTimeout(() => {
      window.startApp()
    }, 100)
  }, 100) 
}

// ACCESSIBILITY
window.enableAccess = (event) => {
  let btn = document.getElementById("accessBtn");
  let img = document.getElementById("accessImg");
  
  if(window.SCREENREAD_MODE) {
    console.log("비활성화")
    window.SCREENREAD_MODE = false;
    img.alt = "스크린리더 모드를 비활성화했습니다."
    btn.style.backgroundColor = 'rgba(0, 0, 0, 0)';
  } else {
    console.log("활성화")
    window.SCREENREAD_MODE = true;
    img.alt = "스크린리더 모드를 활성화했습니다."
    btn.style.backgroundColor = 'rgba(255, 255, 255, 0.85)';
  }
}

window.addEventListener('online', () => window.location.reload());
window.addEventListener('offline', () => window.location.reload());

window.addEventListener('DOMContentLoaded', () => {
  let userStr = localStorage.getItem("user")
  let user = (userStr) ? JSON.parse(userStr) : ""

  if (window.location.pathname == '/test' || window.location.pathname == '/admin' || (user.creatureName && user.creatureName != "")) {
    window.CREATURE_NAME = user.creatureName
    let el = document.getElementById('introId')
    el.classList.add("hidden")
    setTimeout(() => {
      el.remove()
    }, 2000)    
    
    window.startApp()
  } else {
    document.querySelector(".topWrap").style.opacity = 1;
    document.querySelector(".bottomWrap").style.opacity = 1;
  }

  // window.APP = new App()
  // window.APP.setup()
  window.SCREENREADER = document.getElementById('description')

})
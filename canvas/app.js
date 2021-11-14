import { sleep } from './src/render/utils.js';
import PixiApp from './src/index'
import { uid } from 'uid';
import { io } from 'socket.io-client';
import axios from 'axios';
// import 'regenerator-runtime/runtime'

const WEATHER_API = `http://dwc2-taeyoon-studio.iptime.org:1055/weather`

class App {
  constructor() {
  }

  async setup() {
    window.TEMPERATURE = 5
    window.HUMIDITY = 55

    this.pathname = window.location.pathname
    this.isTest = this.pathname == '/test'
    this.user = this.createOrFetchUser()

    this.serverPort = window.location.hostname.includes('iptime') ? '1012' : '3000'
    this.serverUrl = `http://${window.location.hostname}`

    this.pixiApp = new PixiApp({ isAdmin: this.pathname == '/admin' })

    await this.fetchWeatherData()
    setInterval(this.fetchWeatherData, 10000)
    await this.pixiApp.loadAssets()

    this.socket = await io(`${this.serverUrl}:${this.serverPort}`, {
      query: {
        uid: this.user.id
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

    this.selfGarden = null
    this.onlineCreatures = {}
    this.onlineUsers = {}
    this.initData = {
      creatures: false,
      users: false,
      firstRender: false
    }
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

  onCreatures = (creatures) => {
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

    console.log('Update: ', this.onlineUsers, this.onlineCreatures)
    this.pixiApp.updateOnlineCreatures(this.onlineUsers, this.onlineCreatures)
    return this.onlineCreatures  
  }

  onCreaturesUpdate = (creaturesToUpdate) => {
    console.log('Creatures Update: ', creaturesToUpdate)
    this.pixiApp.updateCreatureData(creaturesToUpdate)
  }

  createOrFetchUser() {
    if (this.isTest) {
      return {
        id: uid(),
        name: ''
      }  
    }

    let user = localStorage.getItem("user")
    if (!user) {
      user = JSON.stringify({
        id: uid(),
        name: ''
      })
      localStorage.setItem("user", user)
    }

    return JSON.parse(user)
  }

  async fetchWeatherData() {
    try {
      const weather = await axios.get(WEATHER_API)
        
      const weatherData = weather.data;
      console.log("fetchWeatherData -------------", weatherData)

      window.TEMPERATURE = weatherData.temperature;
      window.HUMIDITY = weatherData.humidity;
    } catch (error) {
        console.log("ERROR ------------ ", error)
        return
    }
    
  }
}

window.addEventListener('DOMContentLoaded', () => {
  console.log('DOM Content Loaded')
  window.APP = new App()
  window.APP.setup()
})
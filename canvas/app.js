import LOGIN from './src/html/login.js';
import SIGNUP from './src/html/signup.js';
import USER from './src/html/user.js';
import CANVAS from './src/html/canvas.js';
import AuthService from './src/services/auth.service';
import { sleep } from './src/render/utils.js';
import PixiApp from './src/index'
import { uid } from 'uid';
import { io } from 'socket.io-client';

class App {
  constructor() {
  }

  async setup() {
    this.user = this.createOrFetchUser()
    this.pathname = window.location.pathname
    this.serverPort = window.location.hostname.includes('iptime') ? '1012' : '3000'
    this.serverUrl = `http://${window.location.hostname}`

    this.pixiApp = new PixiApp({ isAdmin: this.pathname == '/admin' })
    await this.pixiApp.loadAssets()

    this.socket = io(`${this.serverUrl}:${this.serverPort}`, {
      query: {
        uid: this.user.id
      }
    })

    this.socket.on('connect', this.onSocketConnect)
    this.socket.on('connect_error', this.onSocketConnectError)
    this.socket.on('usersUpdate', this.onUsersUpdate)
    this.socket.on('creatures', this.onCreatures)
    this.socket.on('creaturesUpdate', this.onCreaturesUpdate)    

    this.selfGarden = null
    this.onlineCreatures = {}
    this.onlineUsers = {}
    this.initData = {
      creatures: false,
      users: false,
      firstRender: false
    }
  }

  renderAppIfReady() {
    if (this.initData.creatures && this.initData.users && !this.initData.firstRender) {
      this.pixiApp.render()
      this.initData.firstRender = true
    }
  }

  onSocketConnect = () => {
    console.log('on socket connect')
  }

  onSocketConnectError = (error) => {
    console.log('on socket connect error: ', error)
  }

  onUsersUpdate = (users) => {
    // get single user's garden data
    const currUser = users.find((u => (u.uid == this.user.id)))
    this.selfGarden = currUser ? currUser.gardenSection : null

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
      if (!!this.onlineUsers[el.owner.uid]) {
        acc[el._id] = el
      }
      return acc
    }, {})

    console.log('Update: ', this.onlineUsers, this.onlineCreatures)
    return onlineCreatures  
  }

  onCreaturesUpdate = (creaturesToUpdate) => {
    console.log('Creatures Update: ', creaturesToUpdate)

    /*
    if (!allCreaturesContainer) return

    for (const [key, value] of Object.entries(onlineCreatures)) {
      if (creaturesToUpdate[key]) {
        const creature = allCreaturesContainer.children.find(ele => ele.name === key)
        const newState = creaturesToUpdate[key]

        // Update the target for movement inside of the creature class
        creature?.updateState(newState)        
      }
    }
    */
  }

  createOrFetchUser() {
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
}

window.addEventListener('DOMContentLoaded', () => {
  console.log('DOM Content Loaded')
  window.APP = new App()
  window.APP.setup()
})
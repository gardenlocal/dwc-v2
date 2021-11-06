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

  setup() {
    this.user = this.createOrFetchUser()
    this.pathname = window.location.pathname
    this.serverPort = window.location.hostname.includes('iptime') ? '1012' : '3000'
    this.serverUrl = `http://${window.location.hostname}`

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

    this.pixiApp = new PixiApp({ isAdmin: this.pathname == '/admin' })     
  }

  onSocketConnect = () => {
    console.log('on socket connect')
  }

  onSocketConnectError = (error) => {
    console.log('on socket connect error: ', error)
  }

  onUsersUpdate = (users) => {
    console.log('on users update: ', users)
    /*
    // get single user's garden data
    for(let i = 0; i < users.length; i++) {
      if(users[i] && (users[i]._id === userId)) {
        currentGarden = users[i].gardenSection
      }
    }
    // get all online users
    console.log('Users update: ', users)
    onlineUsers = updateUsers(users)    
    updateOnlineCreatures()
    */
  }

  onCreatures = (creatures) => {
    console.log('on creatures: ', creatures)
    /*
    console.log('socket received creatures', creatures)
    allCreatures = creatures
    updateOnlineCreatures(creatures)
    await setGardens()

    if (!isAppRunning) {
      isAppRunning = true
      render(app)
    }
    */
  }

  onCreaturesUpdate = (creaturesToUpdate) => {
    /*
    // console.log('Creatures Update: ', creaturesToUpdate)

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
import React, { Component } from "react";
import P5Wrapper from "../rendering/p5-wrapper.component"
import UserService from "../services/user.service";

export default class GardenAdmin extends Component {
  constructor(props) {
    super(props);

    this.state = {
      allUsers: [],
      onlineUsers: [],
      users: [],
      creatures: []
    };
  }

  processUsers = (allUsers, onlineUsers) => {
    if (!allUsers || !onlineUsers) return {}
    const onlineUsersMap = onlineUsers.reduce((acc, el) => {
      acc[el._id] = el
      return acc
    }, {})
    const users = allUsers.reduce((acc, el) => {
      acc[el._id] = {
        online: !!onlineUsersMap[el._id],
        data: el
      }

      return acc
    }, {})

    return users
  }  

  async componentDidMount() {
    const allUsers = (await UserService.getAdminGarden()).data

    this.setState({ allUsers, users: this.processUsers(allUsers, this.state.onlineUsers) })

    const { socket } = this.props
    socket.on('usersUpdate', (onlineUsers) => {
      console.log('users update: ', onlineUsers)
      this.setState({ onlineUsers, users: this.processUsers(this.state.allUsers, onlineUsers) })
    })

    socket.on('creatures', (creatures) => {
      // console.log('creatures: ', message)
      this.setState({ creatures })
    })

    socket.on('creaturesUpdate', (creaturesToUpdate) => {
      let newCreatures = []
      let { creatures } = this.state

      for (let i = 0; i < creatures.length; i++) {
        if (creaturesToUpdate[creatures[i]._id]) {
          newCreatures.push(creaturesToUpdate[creatures[i]._id])
        } else {
          newCreatures.push(creatures[i])
        }
      }

      this.setState({ creatures: newCreatures })
    })
  }

  render() {
    const { users, creatures } = this.state
    const { user } = this.props
    return (
      <div className="admin-container">
        <header className="jumbotron">
          <P5Wrapper type="admin" users={users} creatures={creatures} currentUser={user}/>
        </header>
      </div>
    );
  }
}
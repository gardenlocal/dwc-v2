import React, { Component } from "react";
import P5Wrapper from "../rendering/p5-wrapper.component"
import UserService from "../services/user.service";

export default class GardenAdmin extends Component {
  constructor(props) {
    super(props);

    this.state = {
      allUsers: [],
      onlineUsers: []
    };
  }

  async componentDidMount() {
    const adminGarden = (await UserService.getAdminGarden()).data
    console.log(adminGarden)
    this.setState({ allUsers: adminGarden })

    const { socket } = this.props
    socket.on('usersUpdate', (message) => {
      console.log('users update: ', message)
      this.setState({ onlineUsers: message })
    })
  }

  render() {
    const { allUsers, onlineUsers } = this.state
    return (
      <div className="admin-container">
        <header className="jumbotron">
          <P5Wrapper type="admin" onlineUsers={onlineUsers} allUsers={allUsers}/>
        </header>
      </div>
    );
  }
}
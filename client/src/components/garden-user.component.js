import React, { Component } from "react";
import UserService from "../services/user.service";
import P5Wrapper from "../rendering/p5-wrapper.component"
import { connect } from "react-redux";

class GardenUser extends Component {
  constructor(props) {
    super(props);

    this.state = {
      creatures: []
    };
  }

  async componentDidMount() {
    const userGarden = (await UserService.getUserGarden()).data    

    const { socket, user } = this.props

    console.log('user is: ', user)

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
    const { creatures } = this.state
    const { user } = this.props
    return (
      <div className="garden-container">
        <header className="jumbotron">
        </header>
        <P5Wrapper type="user" creatures={creatures} currentUser={user}/>
      </div>
    );
  }
}

function mapStateToProps(state) {
  const { user } = state.auth;
  return {
    user,
  };
}

export default connect(mapStateToProps)(GardenUser);

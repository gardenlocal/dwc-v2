import React, { Component } from "react"
import { connect } from "react-redux"
import GardenUser from "./garden-user.component"
import GardenAdmin from "./garden-admin.component"
import { io } from 'socket.io-client'

class SocketWrapperDef extends Component {
  constructor(props) {
    super(props);
    this.state = {
      content: "",
      socketAuthenticated: false,
      socket: null
    };
  }

  async componentDidMount() {
    const { user } = this.props
    let port = (window.location.hostname == 'localhost' ? '3000' : '330')
    let socket = io(`http://${window.location.hostname}:${port}`, {
      auth: { token: `Bearer ${user.accessToken}` }
    })

    this.setState({ socket }, () => {
      socket.on('connect', () => {
        console.log('socket connect')
        this.setState({ socketAuthenticated: true, socket })
      })
  
      socket.on('connect_error', (error) => {
        console.log('socket connect error', error)
      })  
    })
  }

  render() {
    const { children } = this.props
    const { socket, socketAuthenticated } = this.state
    return (
      <div className="socket-wrapper-container">
        { socket && React.cloneElement(children, { socket, socketAuthenticated }) }
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

export const SocketWrapper = connect(mapStateToProps)(SocketWrapperDef);

export class UserWithSocket extends Component {
  render() {
    return (
      <SocketWrapper>
        <GardenUser/>
      </SocketWrapper>
    )
  }
}

export class AdminWithSocket extends Component {
  render() {
    return (
      <SocketWrapper>
        <GardenAdmin/>
      </SocketWrapper>
    )
  }
}

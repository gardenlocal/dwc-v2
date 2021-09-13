import React, { Component } from "react";
import UserService from "../services/user.service";
import P5Wrapper from "../rendering/p5-wrapper.component"
import { connect } from "react-redux";

class GardenUser extends Component {
  constructor(props) {
    super(props);

    this.state = {
      content: ""      
    };
  }

  componentDidMount() {
    UserService.getUserGarden().then(
      response => {
        this.setState({
          content: response.data
        });
      },
      error => {
        this.setState({
          content:
            (error.response &&
              error.response.data &&
              error.response.data.message) ||
            error.message ||
            error.toString()
        });
      }
    );
  }

  render() {
    return (
      <div className="garden-container">
        <header className="jumbotron">
        </header>
        <P5Wrapper type="user"/>
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

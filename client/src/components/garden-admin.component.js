import React, { Component } from "react";
import P5Wrapper from "../rendering/p5-wrapper.component"
import UserService from "../services/user.service";

export default class GardenAdmin extends Component {
  constructor(props) {
    super(props);

    this.state = {
      data: []
    };
  }

  async componentDidMount() {
    const adminGarden = (await UserService.getAdminGarden()).data
    console.log(adminGarden)
    this.setState({ data: adminGarden })
    /*
    .then(
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
    */
  }

  render() {
    const { data } = this.state
    return (
      <div className="admin-container">
        <header className="jumbotron">
          <P5Wrapper type="admin" data={data}/>
        </header>
      </div>
    );
  }
}

import React, { Component } from "react";
import { connect } from "react-redux";
import { Router, Switch, Route, Link } from "react-router-dom";

import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

import Login from "./components/login.component";
import Register from "./components/register.component";
import Home from "./components/home.component";
import Profile from "./components/profile.component";
// import { UserWithSocket, AdminWithSocket } from './components/socket-wrapper.component'
import P5Sketch from "./components/p5sketch.component";
import ThreeSketch from "./components/threeSketch.component";

import { logout } from "./actions/auth";
import { clearMessage } from "./actions/message";

import { history } from './helpers/history';
import HomeLogo from './images/tylogo.jpg';

class App extends Component {
  constructor(props) {
    super(props);
    this.logOut = this.logOut.bind(this);

    this.state = {
      showModeratorBoard: false,
      showAdminBoard: false,
      currentUser: undefined,
      path: history.location.pathname
    };

    history.listen((location) => {
      props.dispatch(clearMessage()); // clear message when changing location
      this.setState({ path: location.pathname });
    });
  }

  componentDidMount() {
    const user = this.props.user;

    if (user) {
      this.setState({
        currentUser: user,
        showModeratorBoard: user.roles.includes("ROLE_MODERATOR"),
        showAdminBoard: user.roles.includes("ROLE_ADMIN"),
      });
    }
  }

  logOut() {
    this.props.dispatch(logout());
  }

  render() {
    const { currentUser, showAdminBoard, path } = this.state;

    return (
      <Router history={history}>
        <div id="homeLogo">
          <Link to={"/home"}>
            <img src={HomeLogo} style={{ width: '72px' }} alt={'smile'} />
          </Link>
        </div>
        <div>
          <nav
            className="navbar navbar-expand navbar-dark bg-dark" 
            style={{ display: (path === '/p5sketch' || path === '/threejs') && 'none' }}>
            <Link to={"/"} className="navbar-brand">
              DWC Test
            </Link>
            <div className="navbar-nav mr-auto">
              <li className="nav-item">
                <Link to={"/home"} className="nav-link">
                  Home
                </Link>
              </li>
              <li className="nav-item">
                <Link to={"/p5sketch"} className="nav-link">
                    p5
                </Link>
              </li>
              <li className="nav-item">
                <Link to={"/threejs"} className="nav-link">
                    threejs
                </Link>
              </li>
              {showAdminBoard && (
                <li className="nav-item">
                  <Link to={"/admin"} className="nav-link">
                    Admin Garden
                  </Link>
                </li>
              )}

              {currentUser && (
                <li className="nav-item">
                  <Link to={"/user"} className="nav-link">
                    User Garden
                  </Link>
                </li>
              )}
            </div>

            {currentUser ? (
              <div className="navbar-nav ml-auto">
                <li className="nav-item">
                  <Link to={"/profile"} className="nav-link">
                    {currentUser.username}
                  </Link>
                </li>
                <li className="nav-item">
                  <a href="/login" className="nav-link" onClick={this.logOut}>
                    LogOut
                  </a>
                </li>
              </div>
            ) : (
              <div className="navbar-nav ml-auto">
                <li className="nav-item">
                  <Link to={"/login"} className="nav-link">
                    Login
                  </Link>
                </li>

                <li className="nav-item">
                  <Link to={"/register"} className="nav-link">
                    Sign Up
                  </Link>
                </li>
              </div>
            )}
          </nav>

          <div className="route-container">
            <Switch>
              <Route exact path={["/", "/home"]} component={Home} />
              <Route exact path="/login" component={Login} />
              <Route exact path="/register" component={Register} />
              <Route exact path="/profile" component={Profile} />
              {/* <Route path="/user" component={UserWithSocket} /> */}
              {/* <Route path="/admin" component={AdminWithSocket} /> */}
              <Route exact path="/p5sketch" component={P5Sketch} />
              <Route exact path="/threejs" component={ThreeSketch} />
            </Switch>
          </div>
        </div>
      </Router>
    );
  }
}

function mapStateToProps(state) {
  const { user } = state.auth;
  return {
    user,
  };
}

export default connect(mapStateToProps)(App);

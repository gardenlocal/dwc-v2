import LOGIN from './src/html/login.js';
import SIGNUP from './src/html/signup.js';
import USER from './src/html/user.js';
import CANVAS from './src/html/canvas.js';

import UserService from './src/services/user.service';
import AuthService from './src/services/auth.service';

export const LOGGEDIN = localStorage.getItem("user") ? true: false;
export const USERNAME = JSON.parse(localStorage.getItem("user"))?.username;

export const ROUTES = {
 '/signup': SIGNUP,
 '/': LOGGEDIN ? CANVAS : LOGIN,
 '/user': USER,
}

const origin = window.location.origin;
const uri = window.location.pathname;
const userDiv = document.getElementById("sub");
userDiv.innerHTML = ROUTES[uri];
const canvasDiv = document.getElementById("root");

// hide canvas div if not loggedin
if(!LOGGEDIN || (uri !== '/')) {
  canvasDiv.style.display = "none";
  // window.location.replace(window.location.origin)
} else if(LOGGEDIN && (uri === '/')) {
  userDiv.style.display = "none";
}

// login
window.submitLogin = (event) => {
  event.preventDefault();

  const username = event.target['username'].value;
  const password = event.target['password'].value;
 
  AuthService.login(username, password);
}

window.redirectSignupBtn = () => {
  window.location.replace(origin + '/signup');
}

// signup
window.submitSignup = (event) => {
 event.preventDefault();

 const username = event.target['username'].value;
 const email = event.target['email'].value;
 const password = event.target['password'].value;

 AuthService.register(username, email, password);
}

// button - redirect
window.onClickLogoBtn = () => {
  console.log('logo')
  console.log(uri)
  if(uri === '/user') {
    window.location.replace(origin + '/');
  } else if(uri === '/') {
    window.location.replace(origin + '/user');
  }
}

// home - logout
window.onClickLogout = (event) => {
  event.preventDefault();
  AuthService.logout();
}
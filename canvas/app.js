import LOGIN from './src/html/login.js';
import SIGNUP from './src/html/signup.js';
import HOME from './src/html/home.js';
import UserService from './src/services/user.service';
import AuthService from './src/services/auth.service';

export const LOGGEDIN = localStorage.getItem("user") ? true: false;
console.log(LOGGEDIN)

export const ROUTES = {
 '/login': LOGIN,
 '/signup': SIGNUP,
 '/home': LOGGEDIN ? HOME : LOGIN
}

const url = window.location.pathname;
const userDiv = document.getElementById("sub");
userDiv.innerHTML = ROUTES[url];
const canvasDiv = document.getElementById("root");

// hide canvas div if not loggedin
if(!LOGGEDIN) {
  canvasDiv.style.display = "none";
}

// login
window.submitLogin = (event) => {
  console.log('login clicked');
  event.preventDefault();

  const username = event.target['username'].value;
  const password = event.target['password'].value;
 
  AuthService.login(username, password);
}

window.redirectSignupBtn = () => {
  const origin = window.location.origin;
  window.location.replace(origin + '/signup');
  console.log('sign up clicked');
}

// signup
window.submitSignup = (event) => {
 event.preventDefault();

 const username = event.target['username'].value;
 const email = event.target['email'].value;
 const password = event.target['password'].value;

 AuthService.register(username, email, password);
}

window.onload = (event) => {
 console.log(window.history)
 console.log(window.location)
}

// home - logout
window.onClickLogout = (event) => {
  event.preventDefault();
  AuthService.logout();
}
import axios from "axios";

// const API_URL = "http://localhost:8080/api/auth/";
const port = (window.location.hostname == 'localhost' ? '3000' : '330')
const API_URL = `http://${window.location.hostname}:${port}/api/auth/`

function redirect(pathname) {
  window.location.replace(window.location.origin + pathname)
}

class AuthService {
  login(username, password) {
    return axios
      .post(API_URL + "signin", { username, password })
      .then((response) => {
        if (response.data.accessToken) {
          localStorage.setItem("user", JSON.stringify(response.data));
        }
        return response.data;
      }).then(() => {
        // redirect to home if login success
        redirect('/home');
      }).catch((error) => {
        const err = error.response.data.message;
        const errDiv = document.getElementById("errorMessage");
        errDiv.textContent = err;
      })
  }

  logout() {
    localStorage.removeItem("user");
    // redirect to home if logout success
    redirect('/home');
  }

  register(username, email, password) {
    return axios
    .post(API_URL + "signup", {
      username,
      email,
      password,
    })
    .then(() => {
      // redirect to home if register success
      redirect('/home');
    })
    .catch((error) => {
      const err = error.response.data.message;
      const errDiv = document.getElementById("errorMessage");
      errDiv.textContent = err;
    })
  }
}

export default new AuthService();

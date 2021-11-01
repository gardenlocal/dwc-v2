import axios from "axios";

// const API_URL = "http://localhost:8080/api/auth/";
const port = window.location.hostname.includes('iptime') ? '1012' : '3000'
// 192.168.0.xxx 
const API_URL = `http://${window.location.hostname}:${port}/api/auth/`

function redirect(pathname) {
  const uri = pathname || ''
  window.location.replace(window.location.origin + uri)
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
        redirect();
      }).catch((error) => {
        const err = error.response.data.message;
        const errDiv = document.getElementById("errorMessage");
        errDiv.textContent = err;
      })
  }

  logout() {
    localStorage.removeItem("user");
    // redirect to home if logout success
    redirect();
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
      this.login(username, password);
    })
    .catch((error) => {
      const err = error.response.data.message;
      const errDiv = document.getElementById("errorMessage");
      errDiv.textContent = err;
    })
  }
}

export default new AuthService();

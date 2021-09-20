import axios from 'axios';
import authHeader from './auth-header';

// const API_URL = 'http://localhost:8080/api/test/';
const port = (window.location.hostname == 'localhost' ? '3000' : '330')
const API_URL = `http://${window.location.hostname}:${port}/api/test/`

class UserService {
  getPublicContent() {
    return axios.get(API_URL + 'all');
    // return nothing
  }

  getUserGarden() {
    return axios.get(API_URL + 'user', { headers: authHeader() });
    // return nothing
  }

  getAdminGarden() {
    return axios.get(API_URL + 'admin', { headers: authHeader() });
    // return all users array
  }
}

export default new UserService();

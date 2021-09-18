import axios from 'axios';
import authHeader from './auth-header';

// const API_URL = 'http://localhost:8080/api/test/';
const port = (window.location.hostname == 'localhost' ? '3000' : '330')
const API_URL = `http://${window.location.hostname}:${port}/api/test/`
console.log('api url: ', API_URL)
// console.log('location: ', window.location)

class UserService {
  getPublicContent() {
    return axios.get(API_URL + 'all');
  }

  getUserGarden() {
    return axios.get(API_URL + 'user', { headers: authHeader() });
  }

  getAdminGarden() {
    return axios.get(API_URL + 'admin', { headers: authHeader() });
  }
}

export default new UserService();

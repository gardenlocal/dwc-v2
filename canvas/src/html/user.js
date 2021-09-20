import UserData from '../data/userData.js'

const USER = `
<div class="container">
  <div class="box" id="profile">
    <div>${UserData.username}</div>
    <div>${UserData.role}</div>
    <div>${UserData.email}</div>
    <div>${UserData.token}</div>
    <div>${UserData.garden}</div>
    <div><button onclick="onClickLogout(event);" type="button">LOGOUT</button></div>
  </div>
</div>
 `

export default USER;
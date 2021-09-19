const USER = `
  <div class="innerContainer">
    <button onclick="onClickLogout(event);" type="button">LOGOUT</button>
    <div class="box">${JSON.parse(localStorage.getItem("user"))?.username}</div>
  </div>
 `

export default USER;
const USER = `
<div class="container">
  <div class="box">
    <button onclick="onClickLogout(event);" type="button">LOGOUT</button>
    <div>${JSON.parse(localStorage.getItem("user"))?.username}</div>
  </div>
</div>
 `

export default USER;
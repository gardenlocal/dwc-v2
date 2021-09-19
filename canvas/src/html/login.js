const LOGIN = `
<div>
  <ul>
    <li><a href="/">HOME</a></li>
  </ul>
</div>
<div class="container">
  <form onsubmit="submitLogin(event)" class="innerContainer">
    <div class="box">
      <label for="username">Username: </label>
      <input type="text" id="username" name="username" required />
    </div>
    <div class="box">
      <label for="pw">Password: </label>
      <input type="password" id="pw" name="password" required />
    </div>
    <div class="box">
      <input type="submit" id="submit" value="Log In" />
    </div>
    <button onclick="redirectSignupBtn();" type="button">sign up</button>
    <div class="box" id="errorMessage"></div>
  </div>
</div>
`

export default LOGIN;
const SIGNUP = `
<div>
  <ul>
    <li><a href="/">HOME</a></li>
  </ul>
</div>
<div class="container">
  <form onsubmit="submitSignup(event)" class="innerContainer">
    <div class="box">
      <label for="name">Username: </label>
      <input type="text" id="username" name="username"placeholder="something" required />
    </div>
    <div class="box">
      <label for="email">Email: </label>
      <input type="email" id="email" name="email" placeholder="havea@goodtime.com" required />
    </div>
    <div class="box">
      <label for="pw">Password: </label>
      <input type="password" id="pw" name="password" required />
    </div>
    <div class="box">
      <input type="submit" id="submit" value="Sign Up" />
    </div>
    <div class="box" id="errorMessage"></div>
  </form>
</div>
`

export default SIGNUP;
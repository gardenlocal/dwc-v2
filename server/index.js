const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const dbConfig = require("./config/db.config.js")
const db = require("./models");
const Role = db.role;

const app = express();

var corsOptions = {
  origin: "http://localhost:8081"
};

app.use(cors(corsOptions));

// parse requests of content-type - application/json
app.use(bodyParser.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));


db.mongoose
  .connect(`mongodb://${dbConfig.HOST}:${dbConfig.PORT}/${dbConfig.DB}`, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log("Successfully connect to MongoDB.");
    initializeDB();
  })
  .catch(err => {
    console.error("Connection error", err);
    process.exit();
  });

function initializeDB() {
  Role.estimatedDocumentCount((err, count) => {
    if (!err && count === 0) {
      new Role({ name: "user" }).save(err => {
        if (err) { console.log("error", err); }
        console.log("added 'user' to roles collection");
      });

      new Role({ name: "admin" }).save(err => {
        if (err) { console.log("error", err); }
        console.log("added 'admin' to roles collection");
      });
    }
  });
}
  

// simple route
app.get("/", (req, res) => {
  res.json({ message: "Test." });
});

require('./routes/auth.routes')(app);
require('./routes/user.routes')(app);

// set port, listen for requests
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});

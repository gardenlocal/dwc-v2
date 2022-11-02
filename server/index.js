require("dotenv").config();

const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const socketController = require("./controllers/socket.controller");
const database = require("./db");
const initializeDB = require("./dbInit");

const app = express();
const httpServer = require("http").createServer(app);
const { fetchWeather } = require("./weatherService");

const WEATHER_API = "https://garden-local-dev.hoonyland.workers.dev/weather/latest";
const io = require("socket.io")(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

var corsOptions = {
  origin: ["*", "http://localhost:1234", WEATHER_API],
  credential: true,
  allowedHeaders: ["Content-Type"],
};

app.use(cors(corsOptions));
// parse requests of content-type - application/json
app.use(bodyParser.json());
// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

initializeDB();

// simple route
app.get("/", (req, res) => {
  res.json({ message: "Test." });
});

require("./routes/auth.routes")(app);
require("./routes/weather.routes")(app);
require("./routes/user.routes")(app);
require("./routes/socket.routes")(io);

// set port, listen for requests
const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});

socketController.startAnimatingCreatures();

setInterval(() => {
  database.persistence.compactDatafile();
}, 5000);

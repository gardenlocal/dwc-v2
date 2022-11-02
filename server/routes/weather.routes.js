const controller = require("../controllers/weather.controller");

module.exports = function (app) {
  app.use(async function (req, res, next) {
    res.header("Access-Control-Allow-Headers", "x-access-token, Origin, Content-Type, Accept");
    next();
  });

  app.get("/api/weather/latest", controller.fetchLatest);
};

const TYPES = require("../datatypes");

module.exports = class User {
  constructor(props) {
    this.type = TYPES.user;
    this.gardenSection = null;
    this.creature = null;
    this.isOnline = null;

    Object.keys(props).forEach((key) => {
      if (!key in this) {
        console.warn("Appending a key not defined in the User schema", key);
      }
      this[key] = props[key];
    });
  }
};

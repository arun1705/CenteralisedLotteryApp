var mongoose = require('mongoose');

var dbURL = 'mongodb://localhost:27017/webapp'

const options = {
    reconnectTries: Number.MAX_VALUE,
    poolSize: 10
  };


  mongoose.connect(dbURL, options).then(
    () => {
      console.log("Database connection established!");
    },
    err => {
      console.log("Error connecting Database instance due to: ", err);
    }
  );

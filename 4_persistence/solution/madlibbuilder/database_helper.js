"use strict";
module.change_code = 1;
var _ = require("lodash");
var MadlibHelper = require("./madlib_helper");
var MADLIBS_DATA_TABLE_NAME = "madlibsData";
var localUrl = "http://localhost:4000";
var localCredentials = {
  region: "us-east-1",
  accessKeyId: "fake",
  secretAccessKey: "fake"
};
var localDynasty = require("dynasty")(localCredentials, localUrl);
var dynasty = localDynasty;
//comment line 13 and uncomment line 15 for production
//var dynasty = require("dynasty")({});

function DatabaseHelper() {
}
var madlibTable = function() {
  return dynasty.table(MADLIBS_DATA_TABLE_NAME);
};

DatabaseHelper.prototype.createMadlibsTable = function() {
  return dynasty.describe(MADLIBS_DATA_TABLE_NAME)
    .catch(function(error) {
      console.log("createMadlibsTable::error: ", error);
      return dynasty.create(MADLIBS_DATA_TABLE_NAME, {
        key_schema: {
          hash: ["userId", "string"]
        }
      });
    });
};

DatabaseHelper.prototype.storeMadlibData = function(userId, madlibData) {
  console.log("writing madlibdata to database for user " + userId);
  return madlibTable().insert({
    userId: userId,
    data: JSON.stringify(madlibData)
  }).catch(function(error) {
    console.log(error);
  });
};

DatabaseHelper.prototype.readMadlibData = function(userId) {
  console.log("reading madlib with user id of : " + userId);
  return madlibTable().find(userId)
    .then(function(result) {
      var data = (result === undefined ? {} : JSON.parse(result["data"]));
      return new MadlibHelper(data);
    }).catch(function(error) {
    console.log(error);
  });
};

module.exports = DatabaseHelper;

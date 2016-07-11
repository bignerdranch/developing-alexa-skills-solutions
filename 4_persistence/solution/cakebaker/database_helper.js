'use strict';
module.change_code = 1;
var _ = require('lodash');
var MADLIBS_DATA_TABLE_NAME = 'madlibsData';

/** LOCAL SETUP
var localUrl = 'http://localhost:9999';
var localCredentials = {
  region: 'us-east-1',
  accessKeyId: 'fake',
  secretAccessKey: 'fake'
};
var localDynasty = require('dynasty')(localCredentials, localUrl);
var dynasty = localDynasty;
**/

var dynasty = require('dynasty')({});

function DatabaseHelper() {
}
var madlibTable = function() {
  return dynasty.table(MADLIBS_DATA_TABLE_NAME);
};

DatabaseHelper.prototype.createMadlibsTable = function() {
  return dynasty.describe(MADLIBS_DATA_TABLE_NAME)
    .catch(function(error) {
      console.log('createMadlibsTable: describe:', error);
      return dynasty.create(MADLIBS_DATA_TABLE_NAME, {
        key_schema: {
          hash: ['userId',
                 'string']
        }
      });
    });
};

DatabaseHelper.prototype.storeMadlibData = function(userId, madlibData) {
  console.log('writing madlibdata to database for user', userId);
  return madlibTable().insert({
    userId: userId,
    data: madlibData
  }).catch(function(error) {
    console.log(error);
  });
};

DatabaseHelper.prototype.readMadlibData = function(userId) {
  console.log('reading madlib with user id of ', userId);
  return madlibTable().find(userId)
    .then(function(result) {
      return result;
    })
    .catch(function(error) {
      console.log(error);
    });
};

module.exports = DatabaseHelper;

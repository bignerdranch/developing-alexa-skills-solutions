'use strict';
module.change_code = 1;
var _ = require('lodash');
var Alexa = require('alexa-app');
var skill = new Alexa.app('airportinfo');
var FAADataHelper = require('./faa_data_helper');

skill.launch(function(req, res) {
  var prompt = 'For delay information, tell me an Airport code.';
  res.say(prompt).reprompt(prompt).shouldEndSession(false);
});

skill.intent('airportInfoIntent', {
    'slots': {
      'AIRPORTCODE': 'FAACODES'
    },
    'utterances': [
      '{|flight|airport} {|delay|status} {|info} {|for} {-|AIRPORTCODE}'
    ]
  },
  function(req, res) {
    var airportCode = req.slot('AIRPORTCODE');
    var reprompt = 'Tell me an airport code to get delay information.';
    if (_.isEmpty(airportCode)) {
      var prompt =
        'I didn\'t hear an airport code. Tell me an airport code.';
      res.say(prompt).reprompt(reprompt).shouldEndSession(false);
      return true;
    } else {
      var faaHelper = new FAADataHelper();
      console.log(airportCode);
      faaHelper.getAirportStatus(airportCode).then(function(airportStatus) {
        console.log(airportStatus);
        res.say(faaHelper.formatAirportStatus(airportStatus)).send();
      }).catch(function(err) {
        console.log(err.statusCode);
        var prompt = 'I didn\'t have data for an airport code of ' +
          airportCode;
        res.say(prompt).reprompt(reprompt).shouldEndSession(false).send();
      });
      return false;
    }
  }
);
module.exports = skill;

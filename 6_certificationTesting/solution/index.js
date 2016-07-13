'use strict';
module.change_code = 1;
var _ = require('lodash');
var Alexa = require('alexa-app');
var skillService = new Alexa.app('FAA');
var FAADataHelper = require('./faa_data_helper');
var utterancesMethod = skillService.utterances;
skillService.utterances = function() {
  return utterancesMethod().replace(/\{\-\|/g, '{');
};

skillService.launch(function(request, response) {
  var prompt = 'For delay information, tell me an Airport code.';
  response.say(prompt).reprompt(prompt).shouldEndSession(false);
});

skillService.intent('AMAZON.HelpIntent', function(request, response) {
  var speechOutput = 'To request information on an airport, request it by it\'s status code.' +
    'For example, to get information about atlanta hartsfield airport, say airport status for ATL';
  response.say(speechOutput);
});
var exitFunction = function(request, response) {
  var speechOutput = 'Goodbye!';
  response.say(speechOutput);
};

skillService.intent('AMAZON.StopIntent', exitFunction);
skillService.intent('AMAZON.CancelIntent', exitFunction);

skillService.intent('airportInfoIntent', {
  'slots': {
    'AIRPORTCODE': 'FAACODES'
  },
  'utterances': ['{|flight|airport} {|delay|status} {|info|information} {|for|at} {-|AIRPORTCODE}']
},
  function(request, response) {
    var airportCode = request.slot('AIRPORTCODE');
    var reprompt = 'Tell me an airport code to get delay information.';
    if (_.isEmpty(airportCode)) {
      var prompt = 'I didn\'t hear an airport code. Tell me an airport code.';
      response.say(prompt).reprompt(reprompt).shouldEndSession(false);
      return false;
    } else {
      var faaHelper = new FAADataHelper();
      faaHelper.requestAirportStatus(airportCode).then(function(airportStatus) {
        response.say(faaHelper.formatAirportStatus(airportStatus)).shouldEndSession(true).send();
      }).catch(function(err) {
        var prompt = 'I didn\'t have data for an airport code of ' + airportCode;
        // https://github.com/matt-kruse/alexa-skillService/blob/master/index.js#L169
        response.say(prompt).reprompt(reprompt).shouldEndSession(true).send();
      });
      return true;
    }
  }
);
module.exports = skillService;

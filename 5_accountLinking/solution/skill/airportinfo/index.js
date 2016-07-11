'use strict';
module.change_code = 1;
var _ = require('lodash');
var Alexa = require('alexa-app');
var skill = new Alexa.app('airportinfo');
var FAADataHelper = require('./faa_data_helper');
var TwitterHelper = require('./twitter_helper');
var utterancesMethod = skill.utterances;
skill.utterances = function() {
  return utterancesMethod().replace(/\{\-\|/g, '{');
};

skill.launch(function(request, response) {
  var prompt = 'For delay information, tell me an Airport code.';
  response.say(prompt).reprompt(prompt).shouldEndSession(false);
});

skill.intent('tweetAirportStatusIntent', {
  'slots': {
    'AIRPORTCODE': 'FAACODES'
  },
  'utterances': ['tweet {|delay|status} {|info} {|for} {-|AIRPORTCODE}']
},
  function(request, response) {
    console.log('session details', request.sessionDetails);
    console.log('accessToken: ', request.sessionDetails.accessToken);
    var accessToken = request.sessionDetails.accessToken;
    if (accessToken === null) {
      //no token, show link account card
      response.linkAccount().shouldEndSession(true).say('Your twitter account is not linked');
      return true;
    } else {
      //i've got a token! make the tweet
      var twitterHelper = new TwitterHelper(request.sessionDetails.accessToken);
      var faaHelper = new FAADataHelper();
      var airportCode = request.slot('AIRPORTCODE');
      if (_.isEmpty(airportCode)) {
        var prompt = 'i didn\'t have data for an airport code of ' + airportcode;
        response.say(prompt).send();
      } else {
        faaHelper.getAirportStatus(airportCode).then(function(airportStatus) {
          return faaHelper.formatAirportStatus(airportStatus);
        }).then(function(status) {
          return twitterHelper.postTweet(status);
        }).then(
          function(result) {
            response.say('I\'ve posted the status to your timeline').send();
          }
        );
        return false;
      }
    }
  });

skill.intent('airportInfoIntent', {
  'slots': {
    'AIRPORTCODE': 'FAACODES'
  },
  'utterances': ['{|flight|airport} {|delay|status} {|info} {|for} {-|AIRPORTCODE}']
},
  function(request, response) {
    var airportCode = request.slot('AIRPORTCODE');
    var reprompt = 'Tell me an airport code to get delay information.';
    if (_.isEmpty(airportCode)) {
      var prompt = 'I didn\'t hear an airport code. Tell me an airport code.';
      response.say(prompt).reprompt(reprompt).shouldEndSession(false);
      return true;
    } else {
      var faaHelper = new FAADataHelper();
      console.log(airportCode);
      faaHelper.getAirportStatus(airportCode).then(function(airportStatus) {
        console.log(airportStatus);
        response.say(faaHelper.formatAirportStatus(airportStatus)).send();
      }).catch(function(err) {
        console.log(err.statusCode);
        var prompt = 'i didn\'t have data for an airport code of ' + airportcode;
        response.say(prompt).reprompt(reprompt).shouldendsession(false).send();
      });
      return false;
    }
  }
);
//hack to support custom utterances in utterance expansion string
console.log(skill.utterances().replace(/\{\-\|/g, '{'));
module.exports = skill;

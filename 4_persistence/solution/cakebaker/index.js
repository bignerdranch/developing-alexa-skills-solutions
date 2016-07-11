'use strict';
module.change_code = 1;
var _ = require('lodash');
var Skill = require('alexa-app');
var MADLIB_BUILDER_SESSION_KEY = 'madlib_builder';
var skillService = new Skill.app('madlibbuilder');
var MadlibHelper = require('./madlib_helper');
var DatabaseHelper = require('./database_helper');
var databaseHelper = new DatabaseHelper();
var utterancesMethod = skillService.utterances;

skillService.utterances = function() {
  return utterancesMethod().replace(/\{\-\|/g, '{');
};

skillService.pre = function(request, response, type) {
  databaseHelper.createMadlibsTable();
};
var getMadlibHelper = function(madlibHelperData) {
  if (madlibHelperData === undefined) {
    madlibHelperData = {};
  }
  return new MadlibHelper(madlibHelperData);
};
var getMadlibHelperFromRequest = function(request) {
  var madlibHelperData = request.session(MADLIB_BUILDER_SESSION_KEY);
  return getMadlibHelper(madlibHelperData);
};
var madlibIntentFunction = function(madlibHelper, request, response) {
  var stepValue = request.slot('STEPVALUE');
  madlibHelper.started = true;
  if (stepValue !== undefined) {
    madlibHelper.getStep().value = stepValue;
  }
  if (madlibHelper.completed()) {
    var completedMadlib = madlibHelper.buildMadlib();
    response.card(madlibHelper.currentMadlib().title, completedMadlib,
      'your completed madlib');
    response.say('The madlib is complete! I will now read it to you. ' +
        madlibHelper.buildMadlib()),
      response.shouldEndSession(true);
  } else {
    if (stepValue !== undefined) {
      madlibHelper.currentStep++;
    }
    response.say('Give me ' + madlibHelper.getPrompt());
    response.reprompt('I didn\'t hear anything. Give me ' + madlibHelper.getPrompt() +
      ' to continue.');
    response.shouldEndSession(false);
  }
  response.session(MADLIB_BUILDER_SESSION_KEY, madlibHelper);
  response.send();
};

skillService.launch(function(request, response) {
  var prompt = 'Welcome to Madlibbuilder.' +
    'To create a new madlib, say create a madlib';
  response.say(prompt).shouldEndSession(false);
});

skillService.intent('AMAZON.HelpIntent', {},
  function(request, response) {
    var madlibHelper = getMadlibHelper(request);
    var help = 'Welcome to madlibbuilder.' +
      'To start a new madlib, say create a madlib.' +
      'You can also say stop or cancel to exit.';
    if (madlibHelper.started) {
      help = madlibHelper.getStep().help;
    }
    response.say(help).shouldEndSession(false);
  });


skillService.intent('saveMadlibIntent', {
    'utterances': ['{save} {|a|the|my} madlib']
  },
  function(request, response) {
    var userId = request.userId;
    var madlibHelper = getMadlibHelperFromRequest(request);
    databaseHelper.storeMadlibData(userId, JSON.stringify(madlibHelper))
      .then(function(result) {
        return result;
      }).catch(function(error) {
        console.log(error);
      });
    response.say(
      'Your madlib progress has been saved. To resume completing the madlib at a later date, say load the last madlib.'
    );
    response.shouldEndSession(true).send();
    return false;
  }
);

skillService.intent('loadMadlibIntent', {
    'utterances': ['{load|resume} {|a|the} {|last} madlib']
  },
  function(request, response) {
    var userId = request.userId;
    databaseHelper.readMadlibData(userId).then(function(result) {
      return (result === undefined ? {} : JSON.parse(result['data']));
    }).then(function(loadedMadLibHelperData) {
      var madlibHelper = new MadlibHelper(loadedMadLibHelperData);
      return madlibIntentFunction(madlibHelper, request, response);
    });
    return false;
  }
);

skillService.intent('madlibIntent', {
    'slots': {
      'STEPVALUE': 'STEPVALUES'
    },
    'utterances': ['{new|start|create|begin|build} {|a|the} madlib',
      '{-|STEPVALUE}'
    ]
  },
  function(request, response) {
    madlibIntentFunction(getMadlibHelperFromRequest(request), request,
      response);
  }
);
module.exports = skillService;

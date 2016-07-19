"use strict";
module.change_code = 1;
var _ = require("lodash");
var Skill = require("alexa-app");
var skillService = new Skill.app("madlibbuilder");
var MadlibHelper = require("./madlib_helper");
var MADLIB_BUILDER_SESSION_KEY = "madlib_builder";
var getMadlibHelper = function(request) {
  var madlibHelperData = request.session(MADLIB_BUILDER_SESSION_KEY);
  if (madlibHelperData === undefined) {
    madlibHelperData = {};
  }
  return new MadlibHelper(madlibHelperData);
};
var cancelIntentFunction = function(request, response) {
  response.say("Goodbye!").shouldEndSession(true);
};

skillService.intent("AMAZON.CancelIntent", {}, cancelIntentFunction);
skillService.intent("AMAZON.StopIntent", {}, cancelIntentFunction);

skillService.launch(function(request, response) {
  var prompt = "Welcome to Madlibs."
    + "To create a new madlib, say create a madlib";
  response.say(prompt).shouldEndSession(false);
});

skillService.intent("AMAZON.HelpIntent", {},
  function(request, response) {
    var madlibHelper = getMadlibHelper(request);
    var help = "Welcome to madlibbuilder."
      + "To start a new madlib, say create a madlib."
      + "You can also say stop or cancel to exit.";
    if (madlibHelper.started) {
      help = madlibHelper.getStep().help;
    }
    response.say(help).shouldEndSession(false);
  });

skillService.intent("madlibIntent", {
  "slots": {
    "StepValue": "StepValues"
  },
  "utterances": ["{new|start|create|begin|build} {|a|the} madlib", "{-|StepValue}"]
},
  function(request, response) {
    var stepValue = request.slot("StepValue");
    var madlibHelper = getMadlibHelper(request);
    madlibHelper.started = true;
    if (stepValue !== undefined) {
      madlibHelper.getStep().value = stepValue;
    }
    if (madlibHelper.completed()) {
      var completedMadlib = madlibHelper.buildMadlib();
      response.card(madlibHelper.currentMadlib().title, completedMadlib);
      response.say("The madlib is complete! I will now read it to you. " + completedMadlib);
      response.shouldEndSession(true);
    } else {
      if (stepValue !== undefined) {
        madlibHelper.currentStep++;
      }
      response.say("Give me " + madlibHelper.getPrompt());
      response.reprompt("I didn't hear anything. Give me " + madlibHelper.getPrompt() + " to continue.");
      response.shouldEndSession(false);
    }
    response.session(MADLIB_BUILDER_SESSION_KEY, madlibHelper);
  }
);
module.exports = skillService;

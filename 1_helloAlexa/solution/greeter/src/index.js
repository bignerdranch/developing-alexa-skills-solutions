'use strict';
var APP_ID = 'amzn1.echo-sdk-ams.app.36ca5442-e6bf-43e3-9968-6377287aeebb';
var SPEECH_OUTPUT = 'Hello World!';
var AlexaSkill = require('./AlexaSkill');
var GreeterService = function() {
  AlexaSkill.call(this, APP_ID);
};

GreeterService.prototype = Object.create(AlexaSkill.prototype);
var helloResponseFunction = function(intent, session, response) {
  response.tell(SPEECH_OUTPUT);
};

GreeterService.prototype.eventHandlers.onLaunch = helloResponseFunction;

GreeterService.prototype.intentHandlers = {
  'HelloWorldIntent': helloResponseFunction
};

exports.handler = function(event, context) {
  var greeterService = new GreeterService();
  greeterService.execute(event, context);
};

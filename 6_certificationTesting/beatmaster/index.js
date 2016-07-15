'use strict';
module.change_code = 1;
var Alexa = require('alexa-app');
var skill = new Alexa.app('beatmaster');
var ssml = require('ssml');

skill.intent('bizMarkieIntent', {
  'utterances': ['drop {a|the} beat']
},
  (req, res) => {
    var ssmlDoc = new ssml();
    var audioElement = ssmlDoc.audio('https://s3.amazonaws.com/beatmaster-audio-files/alexa-rap.mp3').toString({minimal: true});
    res.say("I've got a rap i will now share. I am gonna turn to my homeboy Biz Markie for some beats. Biz Markie, drop the beat. ").say(audioElement);
  }
);

module.exports = skill;

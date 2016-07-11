'use strict';
module.change_code = 1;
var _ = require('lodash');
var Twitter = require('twit');
var CONSUMER_KEY = 'tveGStP0WONtnGJ6h7ledvMto';
var CONSUMER_SECRET = 'saBxYXWzvIVqAou93JW94MDOCyssOjNRHv5THs2EzkenEoUykw';
function TwitterHelper(accessToken) {
  this.accessToken = accessToken.split(',');
  this.client = new Twitter({
    consumer_key: CONSUMER_KEY,
    consumer_secret: CONSUMER_SECRET,
    access_token: this.accessToken[0],
    access_token_secret: this.accessToken[1]
  });
}

TwitterHelper.prototype.postTweet = function(message) {
  return this.client.post('statuses/update', {
    status: message
  }).catch(function(err) {
      console.log('caught error', err.stack);
    });
};

module.exports = TwitterHelper;

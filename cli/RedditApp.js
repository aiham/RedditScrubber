var RedditApp = function (id, secret, request_buffer) {

  this.id = id;
  this.secret = secret;
  this.request_buffer = request_buffer || 2000;
  this.last_request_time = 0;

};

module.exports = RedditApp;

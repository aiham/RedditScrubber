var request = require('request'),
    Callback = require('./Callback.js'),
    Log = require('./Log.js');

var RedditUser = function (app, username, password) {

  this.app = app;
  this.username = username;
  this.password = password;
  this.access_token = null;
  this.things = [];

};

RedditUser.prototype = {

  constructor: RedditUser,

  auth: function (callback) {

    Log.add('RedditUser.auth()');

    request.post(
      {
        url: 'https://ssl.reddit.com/api/v1/access_token',
        form: {
          grant_type: 'password',
          username: this.username,
          password: this.password
        },
        auth: {
          username: this.app.id,
          password: this.app.secret
        },
        headers: {
          'User-Agent': this.app.user_agent
        }
      },
      (function (user) {

        return function (error, response, body) {

          Log.add('access_token response.statusCode: ' + response.statusCode);

          if (!error && response.statusCode === 200) {
            var data = JSON.parse(body);
            user.access_token = data.access_token;
            if (callback instanceof Callback) {
              callback.call();
            }
          } else {
            Log.add('Error: ' + error);
          }

        };

      })(this)
    );

  },

  authedRequest: function (path, options, callback) {

    Log.add('RedditUser.authedRequest(' + path + ')');

    if (!this.access_token) {
      this.auth(new Callback(function () {

        if (this.access_token) {
          this.authedRequest(path, options, callback);
        } else {
          Log.add('Failed to get access token');
        }

      }, this));
      return;
    }

    var now = (new Date()).getTime();
    var buffer = this.app.last_request_time + this.app.request_buffer;

    if (now < buffer) {
      Log.add('Waiting ' + (buffer - now) + ' miliseconds');
      setTimeout((function (user) {

        return function () {

          user.authedRequest(path, options, callback);

        };

      })(this), buffer - now);
    } else {
      var defaults = {
        method: 'GET',
        url: 'https://oauth.reddit.com' + path,
        headers: {
          'User-Agent': this.app.user_agent,
          Authorization: 'bearer ' + this.access_token
        }
      };

      if (options) {
        for (var key in options) {
          if (options.hasOwnProperty(key)) {
            defaults[key] = options[key];
          }
        }
      }

      request(
        defaults,
        (function (user) {

          return function (error, response, body) {

            user.app.last_request_time = (new Date()).getTime();
            callback.call(this, error, response, body);

          };

        })(this)
      );
    }

  },

  authedGetListing: function (path, callback, listing_so_far, after) {

    Log.add('RedditUser.authedGetListing(' + path + ')');

    if (!listing_so_far) {
      listing_so_far = [];
    }

    this.authedRequest(
      after ? path + '?after=' + after : path,
      {},
      (function (user) {

        return function (error, response, body) {

          Log.add('listing response.statusCode: ' + response.statusCode);

          if (!error && response.statusCode === 200) {
            var data = JSON.parse(body);
            if (data.kind !== 'Listing') {
              Log.add('Response is not a listing');
            } else {
              Log.add('Got ' + data.data.children.length + ' children');
              var listing = listing_so_far.concat(data.data.children);
              Log.add('Total ' + listing.length + ' children');

              if (data.data.after !== null) {
                user.authedGetListing(path, callback, listing, data.data.after);
              } else {
                if (callback instanceof Callback) {
                  callback.call(listing);
                }
              }
            }
          } else {
            Log.add('Error: ' + error);
          }

        };

      })(this)
    );

  },

  updateComments: function (callback) {

    Log.add('RedditUser.updateComments()');

    this.authedGetListing(
      '/user/' + this.username + '/comments',
      new Callback(function (comments) {

        Log.add('Finished getting comments listing');

        this.things = comments;
        if (callback instanceof Callback) {
          callback.call();
        }

      }, this)
    );

  },

  updatePosts: function (callback) {

    Log.add('RedditUser.updatePosts()');

    this.authedGetListing(
      '/user/' + this.username + '/submitted',
      new Callback(function (posts) {

        Log.add('Finished getting posts listing');

        this.things = posts;
        if (callback instanceof Callback) {
          callback.call();
        }

      }, this)
    );
  },

  updatePostsAndComments: function (callback) {

    Log.add('RedditUser.updatePostsAndComments()');

    this.authedGetListing(
      '/user/' + this.username + '/overview',
      new Callback(function (postsAndComments) {

        Log.add('Finished getting posts and comments listing');

        this.things = postsAndComments;
        if (callback instanceof Callback) {
          callback.call();
        }

      }, this)
    );

  },

  removeThing: function (id, callback) {

    Log.add('RedditUser.removeThing(' + id + ')');

    this.authedRequest(
      '/api/del',
      {method: 'POST', form: {id: id}},
      (function (user) {

        return function (error, response, body) {

          Log.add('del response.statusCode: ' + response.statusCode);

          if (!error && response.statusCode === 200) {
            if (callback instanceof Callback) {
              callback.call();
            }
          } else {
            Log.add('Error: ' + error);
          }

        };

      })(this)
    );

  },

  removeAllThings: function (callback, remaining_ids) {

    Log.add('RedditUser.removeAllThings(' + remaining_ids + ')');

    if (!remaining_ids) {
      remaining_ids = this.things.length > 0 ? this.things.map(function (post) {

        return post.data.name;

      }) : [];
    }

    if (remaining_ids.length > 0) {
      var id_to_remove = remaining_ids.pop();
      this.removeThing(
        id_to_remove,
        new Callback(function () {

          this.removeAllThings(callback, remaining_ids);

        }, this)
      );
    } else {
      if (callback instanceof Callback) {
        callback.call();
      }
    }

  },

  removeThingsOfType: function (type, callback) {

    var method;

    if (type === 'posts') {
      method = 'updatePosts';
    } else if (type === 'comments') {
      method = 'updateComments';
    } else if (type === 'all') {
      method = 'updatePostsAndComments';
    } else {
      Log.add('Invalid type: ' + type);
      return;
    }

    this[method](new Callback(function () {

      this.removeAllThings(callback);

    }, this));

  }

};

module.exports = RedditUser;

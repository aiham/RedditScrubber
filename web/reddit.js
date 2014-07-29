var db = require('./models');
var RedditApi = require('reddit-oauth');
var config = require('./config');
var lodash = require('lodash');

module.exports = function (req, res, next) {

  req.reddit = new RedditApi(lodash.extend(config.reddit, {request_buffer: 1000}));

  var redditUserId = req.session.redditUserId;
  if (!redditUserId) {
    next();
    return;
  }

  db.RedditUser.getById(redditUserId, function (user) {

    if (user) {
      req.reddit.access_token = user.access_token;
      req.reddit.refresh_token = user.refresh_token;
      req.redditUser = user;
      next();
    } else {
      req.session.redditUserId = null;
      req.session.save(function (err) {
        if (err) throw err;

        req.reddit.access_token = null;
        req.reddit.refresh_token = null;
        req.redditUser = null;
        next();
      });
    }

  });

};

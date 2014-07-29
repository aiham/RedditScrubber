var express = require('express');
var router = express.Router();
var db = require('../models');
var db_date = require('../db_date');

/* GET authentication. */
router.get('/', function (req, res) {

  var state, reddit = req.reddit;

  if (req.query.error) {
    console.log('Error: Failed to get oAuth code');
    res.redirect('/');
    return;
  }

  if (!req.query.state && !req.query.code) {
    state = 'ok';
    req.session.redditState = state;
    req.session.save(function (err) {

      if (err) throw err;

      var url = reddit.oAuthUrl(state, ['identity', 'history', 'edit']);
      res.redirect(url);

    });
    return;
  }

  state = req.session.redditState;

  if (!state) {
    console.log('Error: Returned from reddit API but state not set');
    res.redirect('/');
    return;
  }

  reddit.oAuthTokens(state, req.query, function (success) {

    req.session.redditState = null;
    req.session.save(function (err) {

      if (err) throw err;

      if (!success) {
        console.log('Error: Failed to get oAuth tokens');
        res.redirect('/');
        return;
      }

      reddit.get('/api/v1/me', null, function (error, response, body) {

        if (error || response.statusCode !== 200) {
          console.log('Error: Failed to get reddit user info');
          res.redirect('/');
          return;
        }

        db.RedditUser.saveUser({
          reddit_id: response.jsonData.id,
          username: response.jsonData.name,
          access_token: reddit.access_token,
          refresh_token: reddit.refresh_token,
          last_login: db_date(new Date())
        }, function (user) {

          if (!user) {
            console.log('Error: Failed to save authed reddit user');
            res.redirect('/');
            return;
          }

          req.session.redditUserId = user.id;
          req.session.save(function (err) {

            if (err) throw err;

            req.redditUser = user;
            res.redirect('/');

          }); // req.session.save()

        }); // db.RedditUser.saveUser()

      }); // reddit.get()

    }); // req.session.save()

  }); // reddit.oAuthTokens()

});

/* GET authentication logout. */
router.get('/out', function (req, res) {

  req.session.redditUserId = null;
  req.session.save(function (err) {

    if (err) throw err;

    req.reddit.access_token = null;
    req.reddit.refresh_token = null;
    req.redditUser = null;
    res.redirect('/');

  });

});

module.exports = router;

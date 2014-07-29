var express = require('express');
var router = express.Router();
var db = require('../models');
var db_date = require('../db_date');

/* GET status */
router.get('/status', function (req, res) {

  var data = {user: null}, user = req.redditUser;

  if (!user) {
    res.json(data);
    return;
  }

  data.user = {
    username: user.username,
    posts_deleted: user.posts_deleted,
    comments_deleted: user.comments_deleted
  };

  user.getLatestIncompleteTask(function (task) {

    data.task = task ? task.jsonData() : null;

    res.json(data);

  });

});

/* POST update */
router.post('/update', function (req, res) {

  var data = {user: null}, user = req.redditUser;

  if (!user) {
    res.json(data);
    return;
  }

  data.user = {
    username: user.username,
    posts_deleted: user.posts_deleted,
    comments_deleted: user.comments_deleted
  };

  var type = req.body.type,
      typeNone = 'none';

  if (!type || (!db.Task.types.hasOwnProperty(type) && type !== typeNone)) {
    data.success = false;
    data.error = !type ? 'Type is required' : 'Invalid type: ' + type;
    res.json(data);
    return;
  }

  user.getLatestIncompleteTask(function (task) {

    if (type === typeNone) {
      if (!task) {
        data.success = true;
        data.task = null;
        res.json(data);
        return;
      }

      task.updateAttributes({
        status: db.Task.statuses.canceled,
        end: db_date(new Date())
      }).success(function () {

        data.success = true;
        data.task = task.jsonData();
        res.json(data);

      });
      return;
    }

    if (!task) {
      db.Task.create({
        type: type,
        status: db.Task.statuses.queued
      }).success(function (task) {

        task.setRedditUser(user).success(function () {

          data.success = true;
          data.task = task.jsonData();
          res.json(data);

        });

      });
      return;
    }

    if (type === task.type) {
      data.success = true;
      data.task = task.jsonData();
      res.json(data);
      return;
    }

    if (task.status === db.Task.statuses.wiping) {
      data.success = false;
      data.error = 'Cannot change type during wipe';
      res.json(data);
      return;
    }

    task.updateAttributes({
      type: type
    }).success(function () {

      data.success = true;
      data.task = task.jsonData();
      res.json(data);

    });

  });

});

/* POST auth out */
router.post('/auth/out', function (req, res) {

  req.session.redditUserId = null;
  req.session.save(function (err) {

    if (err) throw err;

    req.reddit.access_token = null;
    req.reddit.refresh_token = null;
    req.redditUser = null;
    res.json({user: null, success: true});

  });

});

module.exports = router;

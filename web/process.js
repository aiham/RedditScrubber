var db = require('./models');
var RedditApi = require('reddit-oauth');
var config = require('./config');
var lodash = require('lodash');
var db_date = require('./helpers/db_date');

var Process = function () {

  this.name = null;
  this.model = null;
  this.user = null;
  this.task = null;
  this.reddit = new RedditApi(lodash.extend(config.reddit, {request_buffer: 1000}));

};

Process.prototype = {

  constructor: Process,

  begin: function () {

    var that = this;
    this.uniqueName(function (name) {

      db.Process.create({
        name: name
      }).success(function (model) {

        that.name = name;
        that.model = model;
        that.processTasks();

      });

    });

  },

  randomName: function () {

    return Math.random().toString(36).substr(2, 10);

  },

  uniqueName: function (callback) {

    var that = this;
    var name = this.randomName();
    db.Process.count({where: {name: name}}).success(function (count) {

      if (count > 0) {
        that.uniqueName(callback);
      } else {
        callback(name);
      }

    });

  },

  processTasks: function () {

    var that = this;
    this.completeTask(function () {

      that.nextTask(function (task, user) {

        if (!task) {
          that.scheduleCheck();
        } else if (!user) {
          that.processTasks();
        } else {
          that.task = task;
          that.user = user;
          that.deleteThings();
        }

      });

    });

  },

  completeTask: function (callback) {

    if (this.task) {
      var that = this;
      this.task.updateAttributes({
        status: db.Task.statuses.complete,
        end: db_date(new Date())
      }).success(function () {

        that.task = that.user = null;
        callback();

      });
    } else {
      callback();
    }

  },

  nextTask: function (callback) {

    var that = this;
    db.Task.find({
      where: {status: db.Task.statuses.queued},
      order: 'createdAt ASC'
    }).success(function (task) {

      if (task) {
        task.getRedditUser().success(function (user) {

          if (user) {
            task.updateAttributes({
              status: db.Task.statuses.wiping,
              wipe_start: db_date(new Date())
            }).success(function () {

              task.setProcess(that.model).success(function () {

                callback(task, user);

              });

            });
          } else {
            callback(task, null);
          }

        });
      } else {
        callback(null, null);
      }

    });

  },

  scheduleCheck: function () {

    var that = this;
    console.log('Sleeping...');
    setTimeout(function () {

      console.log('Awake.');
      that.processTasks();

    }, 10000);

  },

  deleteThings: function () {

    var that = this;
    var path = '/user/' + this.user.username + '/';
    if (this.task.type === db.Task.types.all) {
      path += 'overview';
    } else if (this.task.type === db.Task.types.posts) {
      path += 'submitted';
    } else if (this.task.type === db.Task.types.comments) {
      path += 'comments';
    } else {
      throw 'Error: Invalid task type = ' + this.task.type;
    }
    this.reddit.access_token = this.user.access_token;
    this.reddit.refresh_token = this.user.refresh_token;
    this.reddit.getListing(path, null, function (error, response, body, next) {

      if (error) throw error;
      if (response.statusCode !== 200) throw 'Invalid response code: ' + response.statusCode;

      var things = response.jsonData.data.children.map(function (thing) {

        return {id: thing.data.name, type: thing.kind === 't1' ? 'comment' : 'post'};

      });
      if (things.length > 0) {
        that.deleteThing(things, next);
      } else {
        that.processTasks();
      }

    });

  },

  deleteThing: function (things, next) {

    var that = this;
    var thing = things.shift();
    this.reddit.post('/api/del', {id: thing.id}, function (error, response, body) {

      if (error) throw error;
      if (response.statusCode !== 200) throw 'Invalid response code: ' + response.statusCode;

      console.log('Deleted ' + thing.id + ' for user ' + that.user.username);
      that.deletedThing(thing.type, function () {

        if (things.length > 0) {
          that.deleteThing(things, next);
        } else if (next) {
          that.deleteThings();
        } else {
          that.processTasks();
        }

      });

    });

  },

  deletedThing: function (type, callback) {

    if (type === 'post') {
      this.task.posts_deleted++;
      this.user.posts_deleted++;
    } else {
      this.task.comments_deleted++;
      this.user.comments_deleted++;
    }

    var that = this;
    this.task.save().success(function () {

      that.user.save().success(function () {

        callback();

      });

    });

  }
};

db.sequelize.authenticate().complete(function (err) {

  if (err) {
    throw err;
  } else {
    var process = new Process();
    process.begin();
  }

});

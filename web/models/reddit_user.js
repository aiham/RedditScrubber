module.exports = function (sequelize, DataTypes) {

  var RedditUser = sequelize.define('RedditUser', {
    reddit_id: DataTypes.STRING,
    username: DataTypes.STRING,
    access_token: DataTypes.TEXT,
    refresh_token: DataTypes.TEXT,
    posts_deleted: {type: DataTypes.INTEGER, defaultValue: 0},
    comments_deleted: {type: DataTypes.INTEGER, defaultValue: 0},
    last_login: DataTypes.DATE
  }, {
    associate: function (models) {

      RedditUser.hasMany(models.Task)

    },
    classMethods: {
      getBy: function (where, callback) {

        RedditUser.find({where: where}).success(function (user) {

          callback(user);

        });

      },
      getById: function (id, callback) {

        RedditUser.getBy({id: id}, callback);

      },
      getByUsername: function (username, callback) {

        RedditUser.getBy({username: username}, callback);

      },
      saveUser: function (data, callback) {

        RedditUser.getByUsername(data.username, function (user) {

          if (user) {
            user.updateAttributes(data).success(function () {

              callback(user);

            });
          } else {
            RedditUser.create(data).success(function (user) {

              callback(user);

            });
          }

        });

      }
    },
    instanceMethods: {
      getIncompleteTasks: function (callback) {

        this.getTasks({
          where: ['status != "complete" AND status != "canceled"'],
          order: 'createdAt DESC'
        }).success(function (tasks) {

          callback(tasks);

        });

      },
      getLatestIncompleteTask: function (callback) {

        this.getIncompleteTasks((function (user) {

          return function (tasks) {

            if (tasks.length > 1) {
              console.log('Notice: Got more than 1 incomplete task for user: ' + user.username);
            }

            callback(tasks.length > 0 ? tasks[0] : null);

          };

        })(this));

      }
    }
  });

  return RedditUser;

};

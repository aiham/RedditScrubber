module.exports = function (sequelize, DataTypes) {

  var types = {
    all: 'all',
    posts: 'posts',
    comments: 'comments'
  };

  var statuses = {
    queued: 'queued',
    wiping: 'wiping',
    complete: 'complete',
    canceled: 'canceled'
  };

  var Task = sequelize.define('Task', {
    type: DataTypes.ENUM(
      types.all,
      types.posts,
      types.comments
    ),
    status: DataTypes.ENUM(
      statuses.queued,
      statuses.wiping,
      statuses.complete,
      statuses.canceled
    ),
    posts_deleted: {type: DataTypes.INTEGER, defaultValue: 0},
    comments_deleted: {type: DataTypes.INTEGER, defaultValue: 0},
    wipe_start: DataTypes.DATE,
    end: DataTypes.DATE
  }, {
    associate: function (models) {

      Task.belongsTo(models.RedditUser);
      Task.belongsTo(models.Process);

    },
    instanceMethods: {
      jsonData: function () {

        return {
          type: this.type,
          status: this.status,
          posts_deleted: this.posts_deleted,
          comments_deleted: this.comments_deleted,
          createdAt: this.createdAt,
          wipe_start: this.wipe_start,
          end: this.end
        };

      }
    }
  });

  Task.types = types;
  Task.statuses = statuses;

  return Task;

};

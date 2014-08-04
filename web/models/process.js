module.exports = function(sequelize, DataTypes) {

  var Process = sequelize.define('Process', {
    name: DataTypes.STRING,
    ping: DataTypes.DATE
  }, {
    associate: function(models) {

      Process.hasMany(models.Task)

    }
  });

  return Process;

};

module.exports = function(sequelize, DataTypes) {

  var Process = sequelize.define('Process', {
    name: DataTypes.STRING
  }, {
    associate: function(models) {

      Process.hasMany(models.Task)

    }
  });

  return Process;

};

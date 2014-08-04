module.exports = {
  up: function(migration, DataTypes, done) {
    migration.addColumn('Processes', 'ping', DataTypes.DATE);
    done()
  },
  down: function(migration, DataTypes, done) {
    migration.removeColumn('Processes', 'ping');
    done()
  }
}

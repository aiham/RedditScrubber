var db = require('../models');

db.sequelize.authenticate().complete(function (err) {

  if (err) {
    throw err;
  } else {
    db.Process.findAll().success(function (processes) {

      for (var i = 0, l = processes.length; i < l; i++) {
        console.log('%s - Last ping: %s', processes[i].name, processes[i].ping);
      }

    });
  }

});

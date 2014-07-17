var config = require('./config.json'),
    Callback = require('./Callback.js'),
    Log = require('./Log.js'),
    RedditApp = require('./RedditApp.js'),
    RedditUser = require('./RedditUser.js');

Log.debug = config.debug;
console.log('Deleting all ' + (config.type === 'all' ? 'posts and comments' : config.type) + '...');

var user = new RedditUser(
  new RedditApp(config.client_id, config.client_secret),
  config.username,
  config.password
);

user.removeThingsOfType(
  config.type,
  new Callback(function () {

    console.log('Done');

  })
);

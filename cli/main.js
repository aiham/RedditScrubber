var RedditApi = require('reddit-oauth'),
    config = require('./config.json');

console.log('Deleting all ' + (config.type === 'all' ? 'posts and comments' : config.type) + '...');

console.log('Authenticating ' + config.username + '...');
var reddit = new RedditApi(config);
reddit.passAuth(config.username, config.password, function (success) {

  if (!success) throw 'Error: Failed to authenticate using username/password';

  console.log('Authenticated.');

  var path = '/user/' + config.username;
  if (config.type === 'all') {
    path += '/overview';
  } else if (config.type === 'posts') {
    path += '/submitted';
  } else if (config.type === 'comments') {
    path += '/comments';
  } else {
    throw 'Error: Invalid type = ' + config.type;
  }

  var processThings = function () {

    console.log('Getting listing from: ' + path);
    reddit.getListing(path, null, function (error, response, body, next) {

      if (error) throw error;
      if (response.statusCode !== 200) throw 'Invalid response code: ' + response.statusCode;
      console.log('Got response with ' + response.jsonData.data.children.length + ' things');

      var ids = response.jsonData.data.children.map(function (thing) {

        return thing.data.name;

      });

      var deleteThing = function () {

        var id = ids.shift();
        console.log('Deleting ' + id + '...');
        reddit.post('/api/del', {id: id}, function (error, response, body) {

          if (error) throw error;
          if (response.statusCode !== 200) throw 'Invalid response code: ' + response.statusCode;
          console.log('Deleted:  ' + id);

          if (ids.length > 0) {
            deleteThing();
          } else if (next) {
            processThings();
          } else {
            console.log('Done.');
          }

        }); // reddit.post()

      }; // deleteThing
      deleteThing();

    }); // reddit.getListing()

  }; // processThings
  processThings();

}); // reddit.passAuth()

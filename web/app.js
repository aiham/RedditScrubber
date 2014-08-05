var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var session = require('express-session');
var SequelizeStore = require('connect-session-sequelize')(session.Store);
var debug = require('debug')('server');
var db = require('./models');
var reddit = require('./helpers/reddit');
var sessionConfig = require('./config/session');

var routes = require('./routes/index');
var auth = require('./routes/auth');
var api = require('./routes/api');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// default express middleware
app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());

// static files
app.use(express.static(path.join(__dirname, 'public')));

// use sequelize as session store
app.use(session({
  secret: sessionConfig.secret,
  store: new SequelizeStore({
    db: db.sequelize
  })
}));

// attach reddit api to request
app.use(reddit);

// routes
app.use('/', routes);
app.use('/auth', auth);
app.use('/api', api);

/// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

app.set('port', process.env.PORT || 3000);

db.sequelize.authenticate().complete(function (err) {
  if (err) {
    throw err;
  } else {
    var server = app.listen(app.get('port'), function() {
      debug('Express server listening on port ' + server.address().port);
    });
  }
});

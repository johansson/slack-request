var config = require('./config.js')

var express = require('express');
var auth = require('basic-auth');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var validator = require('express-validator');
var db = require('monk')(config.mongo_db);

var index = require('./routes/index');
var signup = require('./routes/signup');
var success = require('./routes/success');
var admin = require('./routes/admin');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

if (app.get('env') === 'development') {
    app.locals.pretty = true;
}

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(validator());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(function (req, res, next) {
    req.db = db;
    next();
});

app.use('/', index);
app.use('/signup', signup);
app.use('/success', success);

app.use('/admin', function (req, res, next) {
    var user = auth(req);

    if (!user || !config.admins[user.name] || config.admins[user.name].password !== user.pass) {
        res.set('WWW-Authenticate', 'Basic realm="slack-invite"');
        return res.status(401).send('Wrong username or password.');
    }

    return next();
}, admin);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

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


module.exports = app;

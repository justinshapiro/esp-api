const express =      require('express');
const path =         require('path');
const favicon =      require('serve-favicon');
const logger =       require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser =   require('body-parser');
const routes =       require('./routes/index');
const session =      require('express-session');
const passport =     require('passport');

const app = express();


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


// Initialize Passport and restore authentication state, if any, from the
// session.
const expireDate = new Date(Date.now() + 60 * 60 * 10000);
app.set('trust proxy', 1);
app.use(session({
	name: "session",
	keys: ["key1", "key2"],
	secret: "cats",
	resave: true,
	saveUninitialized: false,
	cookie: {
		secure: true,
		httpOnly: false,
		domain: "espmobile.org",
		expires: expireDate
	}
}));
app.use(passport.initialize());
app.use(passport.session());

app.use('/', routes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
	let err = new Error('Not Found');
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

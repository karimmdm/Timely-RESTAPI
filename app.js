//imports 
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const User = require('./models/user_model');

var testRoutes = require("./routes/testRoute.js");
var authRoutes = require("./routes/auth-routes.js");
var projectRoutes = require("./routes/project-routes");
var taskRoutes = require("./routes/task-routes.js");

var app = express();

app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(session( {
  secret: 'macbook pro', 
  maxAge: null,
  resave: true,
  saveUninitialized: false,
  cookie: {secure: false}
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//Configure bodyparser to handle post requests
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

/*_______Connect to Mongoose and set connection variable_______*/
mongoose.connect('mongodb://localhost:27017/timely', {
  useNewUrlParser: true, 
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: false
}).then(() => {
  console.log('Database connection successful')
})
.catch(err => {
  console.error('Database connection error')
})

/*____________________________ROUTES____________________________*/
app.get('/', (req, res) => res.send('Timely API'));
//route middleware
app.use('/test', testRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/project', projectRoutes);
app.use('/api/tasks', taskRoutes);

// error handling 
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

/*________________________Error Handling________________________*/
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.json({error: err});
});

module.exports = app;

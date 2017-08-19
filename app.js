/**
 *  cigem-admin
 */
var ejs = require('ejs');
var express = require("express");
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');

var config = require("./cigem/config");
var proxy = require('./cigem/proxy');
var apiRoutes = require('./server/apiRoutes');

var app = express();

var session = require("express-session");
var morgan = require('morgan');
var fs = require('fs');
var path = require('path');
var accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), {flags: 'a'});

// model
app.set('views', __dirname + config.static_dir);
app.engine('.html', ejs.__express);
app.set('view engine', 'html');

// middlewares 
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(morgan('short', {stream: accessLogStream}));

// session
app.use(session({
  secret: '47a9cfd6d027b28ec69febaa01252f00',
  name: 'cigem.userToken',   //这里的name值得是cookie的name，默认cookie的name是：connect.sid
  cookie: { maxAge: 1000 * 60 * 60 * 24 * 7 },
  resave: false,
  saveUninitialized: true,
}));

app.use('/api', apiRoutes)

app.use('/upload/images', express.static('server/upload/images'));


app.use('/', express.static(__dirname + config.static_dir));
app.listen(config.port, function(){
    console.log("listening on port:" + config.port);
});

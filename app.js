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

// model
app.set('views', __dirname + config.static_dir);
app.engine('.html', ejs.__express);
app.set('view engine', 'html');

// middlewares 
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/api', apiRoutes)

app.use('/upload/images', express.static('server/upload/images'));


app.use('/', express.static(__dirname + config.static_dir));
app.listen(config.port, function(){
    console.log("listening on port:" + config.port);
});

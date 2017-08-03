/**
 *  Zaih-ZhiPanel  apis proxy
 */
var config = require('./config');
var request = require("request");
var cookieSecret = require('./cookie-secret');
var bodyParser = require('body-parser');
var session = require('express-session');
var cookieParser = require('cookie-parser');

// api hosts 映射
var hosts = {
  "api": {requireApi: true, host: config.host},
  "auth_api": {requireApi: true, host: config.auth_host},
  "wanted_api": {requireApi: false, host: config.wanted_host},
  "board_api": {requireApi: true, host: config.board_host},
  "speech_api": {requireApi: true, host: config.speech_host},
  "feed_api": {requireApi: true, host: config.feed_host},
  "censor_api": {requireApi: false, host: config.censor_host},
  "headline_api": {requireApi: false, host:config.headline_host},
  "column_api": {requireApi: false, host:config.column_host},
  "bank_api": {requireApi: false, host:config.bank_host},
  "push_api": {requireApi: false, host:config.push_host}
}

var proxy = function(app){
  app.use(cookieParser(config.cookie_secret));
  app.use('/panel/*api', function (req, res, next) {
    var apiUrl = req.originalUrl.split('/panel/')[1]
    var path = (hosts[apiUrl].requireApi ? '/apis' : '') + req.originalUrl.split(req.baseUrl)[1];
    var api = hosts[apiUrl].host + path;
    var token;
    if(!req.cookies.user_token){
      console.log(req.method + ' ' + req.originalUrl + ' ' + 403);
      res.status(403).send();
    } else {
      token = config.user_token_type + ' ' + cookieSecret.decrypt(req.cookies.user_token, config.cookie_secret);
      var opts = {
        url: api,
        encoding: 'utf-8',
        method: req.method,
        headers: {
          Authorization: token,
          App: 'fenda'
        }
      };
      console.log(token, api)
      if(req.method.toLowerCase() === 'post' || req.method.toLowerCase() === 'put'){
        opts.body = req.body;
        opts.json = true;
      }

      request(opts, function(error, response, body){
        if(error){
          console.log('************ error ************');
          console.log(req.originalUrl + '   error');
          console.log(error);
          console.log('*******************************');
          res.status(500).send(error);
          return;
        }

        if(typeof response.headers === 'object'){
          var hds = {};
          for(var key in response.headers){
            hds[key] = response.headers[key];
          }
          res.set(hds);
        }

        if(typeof body === 'string'){
          if (body.indexOf('])}while(1);</x>') !== 0) {
            body = '])}while(1);</x>' + body;
          };
        } else {
          try{
            body = '])}while(1);</x>' + JSON.stringify(body);
          } catch(e){}
        }
        console.log(req.method + ' ' + req.originalUrl + ' ' + response.statusCode);
        res.status(response.statusCode).send(body);
      });
    }
  })
  //panel login
  app.use(config.login_path, function(req, res, next){
    var path = req.originalUrl.split('/login')[1];
    var api = config.host + path;
    var opts = {
      url: api,
      encoding: 'utf-8',
      method: req.method,
      headers: {
        Authorization: config.base_token_type + ' ' + config.base_token
      }
    };

    if(req.method.toLowerCase() === 'post' || req.method.toLowerCase() === 'put'){
      opts.body = req.body;
      opts.json = true;
    }

    request(opts, function(error, response, body){
      if(error){
        console.log('************ error ************');
        console.log(req.originalUrl + '   error');
        console.log(error);
        console.log('*******************************');
        res.status(500).send(error);
        return;
      }

      if(typeof response.headers === 'object'){
        var hds = {};
        for(var key in response.headers){
          hds[key] = response.headers[key];
        }
        res.set(hds);
      }

      if (body.access_token) {
        res.clearCookie('user_token');
        res.cookie('user_token', cookieSecret.encrypt(body.access_token, config.cookie_secret));
      }

      console.log(req.method + ' ' + req.originalUrl + ' ' + response.statusCode);
      res.status(response.statusCode).send(body);
    });
  });
  // logout
  app.use(config.logout_path, function(req, res, next){
    res.clearCookie('user_token');
    console.log(req.method + ' ' + req.originalUrl + ' ' + 403);
    res.status(403).send();
  });
  // qiniu data
  app.use(config.v1_path, function(req, res, next){
    var path = '/v1' + req.originalUrl.split('/v1')[1];
    var api = config.host + path;
    var token;

    if(!req.cookies.user_token){
      console.log(req.method + ' ' + req.originalUrl + ' ' + 403);
      res.status(403).send();
    } else {
      token = config.user_token_type + ' ' + cookieSecret.decrypt(req.cookies.user_token, config.cookie_secret);
      var opts = {
        url: api,
        encoding: 'utf-8',
        method: req.method,
        headers: {
          Authorization: token
        }
      };

      if(req.method.toLowerCase() === 'post' || req.method.toLowerCase() === 'put'){
        opts.body = req.body;
        opts.json = true;
      }

      request(opts, function(error, response, body){
        if(error){
          console.log('************ error ************');
          console.log(req.originalUrl + '   error');
          console.log(error);
          console.log('*******************************');
          res.status(500).send(error);
          return;
        }

        if(typeof response.headers === 'object'){
          var hds = {};
          for(var key in response.headers){
            hds[key] = response.headers[key];
          }
          res.set(hds);
        }

        if(typeof body === 'string'){
          if (body.indexOf('])}while(1);</x>') !== 0) {
            body = '])}while(1);</x>' + body;
          };
        } else {
          try{
            body = '])}while(1);</x>' + JSON.stringify(body);
          } catch(e){}
        }

        console.log(req.method + ' ' + req.originalUrl + ' ' + response.statusCode);
        res.status(response.statusCode).send(body);
      });
    }
  });
  // bank export data
  app.use(config.bank_export_path, function(req, res, next){
    var path = req.originalUrl.split('/bank_export')[1];
    var api = config.bank_host + path;
    var token;

    if(!req.cookies.user_token){
      console.log(req.method + ' ' + req.originalUrl + ' ' + 403);
      res.status(403).send();
    } else {
      token = config.user_token_type + ' ' + cookieSecret.decrypt(req.cookies.user_token, config.cookie_secret);
      var opts = {
        url: api,
        encoding: 'utf-8',
        method: req.method,
        headers: {
          Authorization: token
        }
      };

      if(req.method.toLowerCase() === 'post' || req.method.toLowerCase() === 'put'){
        opts.body = req.body;
        opts.json = true;
      }

      request(opts, function(error, response, body){
        if(error){
          console.log('************ error ************');
          console.log(req.originalUrl + '   error');
          console.log(error);
          console.log('*******************************');
          res.status(500).send(error);
          return;
        }

        if(typeof response.headers === 'object'){
          var hds = {};
          for(var key in response.headers){
            hds[key] = response.headers[key];
          }
          res.set(hds);
        }

        if(typeof body !== 'string'){
          try{
            body = JSON.stringify(body);
          } catch(e){}
        }

        console.log(req.method + ' ' + req.originalUrl + ' ' + response.statusCode);
        res.status(response.statusCode).send(body);
      });
    }
  });
}
module.exports = function(app){
   return proxy(app);
}



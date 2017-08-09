
'use strict';
var cigemApi = angular.module('cigemApi', ['ngResource']);

cigemApi.factory('Login', ['$resource', function($resource){
  return $resource('/api/login', {}, {
    create: {method: 'POST', isArray: false, transformResponse: function(data){
      return cigemUtils.transformResponse(data);
    }}
  });
}]);

cigemApi.factory('Permission', ['$resource', function($resource){
  return $resource('/api/permission', {}, {
    get: {method: 'GET', isArray: false, transformResponse: function(data){
      return cigemUtils.transformResponse(data);
    }}
  });
}]);


cigemApi.factory('Logout', ['$resource', function($resource){
  return $resource('/api/logout', {}, {
    create: {method: 'POST', isArray: false, transformResponse: function(data){
      return cigemUtils.transformResponse(data);
    }}
  });
}]);


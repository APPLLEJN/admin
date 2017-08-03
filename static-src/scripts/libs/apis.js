
'use strict';
var cigemApi = angular.module('cigemApi', ['ngResource']);


cigemApi.factory('Login', ['$resource', function($resource){
  return $resource('/api/login', {}, {
    create: {method: 'POST', isArray: false, transformResponse: function(data){
      return panelUtils.transformResponse(data);
    }}
  });
}]);


cigemApi.factory('Logout', ['$resource', function($resource){
  return $resource('/panel/logout', {}, {
    create: {method: 'POST', isArray: false, transformResponse: function(data){
      return panelUtils.transformResponse(data);
    }}
  });
}]);


cigemApi.factory('ImageToken', ['$resource', function($resource){
	return $resource('/panel/v1/qiniu/config?bucket=public', {}, {
		get: {method: 'GET', isArray: false, transformResponse: function(data){
			return panelUtils.transformResponse(data);
		}}
	});
}]);


cigemApi.factory('VoiceToken', ['$resource', function($resource){
	return $resource('/panel/v1/qiniu/config?bucket=private', {}, {
		get: {method: 'GET', isArray: false, transformResponse: function(data){
			return panelUtils.transformResponse(data);
		}}
	});
}]);





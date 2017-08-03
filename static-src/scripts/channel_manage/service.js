/* speech services */
var channelServices = angular.module('channelServices', ['ngResource']);
channelServices.factory('Channel', ['$resource', function($resource){
  return{
    news : $resource('/api/news/:id', {id: '@id'}, {
      get : {method: 'GET', isArray: false, transformResponse: function(data, headersGetter, status){
        return panelUtils.transformResponse(data);
      }},
      create : {method: 'POST', isArray: false, transformResponse: function(data, headersGetter, status){
        return panelUtils.transformResponse(data);
      }},
      update : {method: 'PUT', isArray: false, transformResponse: function(data, headersGetter, status){
        return panelUtils.transformResponse(data);
      }},
      delete : {method: 'DELETE', isArray: false, transformResponse: function(data, headersGetter, status){
        return panelUtils.transformResponse(data);
      }},
    }),
    recommend : $resource('/api/recommends/:id', {id: '@id'}, {
      get : {method: 'GET', isArray: false, transformResponse: function(data, headersGetter, status){
        return panelUtils.transformResponse(data);
      }},
      create : {method: 'POST', isArray: false, transformResponse: function(data, headersGetter, status){
        return panelUtils.transformResponse(data);
      }},
      update : {method: 'PUT', isArray: false, transformResponse: function(data, headersGetter, status){
        return panelUtils.transformResponse(data);
      }},
      delete : {method: 'DELETE', isArray: false, transformResponse: function(data, headersGetter, status){
        return panelUtils.transformResponse(data);
      }},
    }),
    unique : $resource('/api/unique/:id', {id: '@id'}, {
      get : {method: 'GET', isArray: false, transformResponse: function(data, headersGetter, status){
        return panelUtils.transformResponse(data);
      }},
      create : {method: 'POST', isArray: false, transformResponse: function(data, headersGetter, status){
        return panelUtils.transformResponse(data);
      }},
      update : {method: 'PUT', isArray: false, transformResponse: function(data, headersGetter, status){
        return panelUtils.transformResponse(data);
      }},
      delete : {method: 'DELETE', isArray: false, transformResponse: function(data, headersGetter, status){
        return panelUtils.transformResponse(data);
      }},
    }),
    design : $resource('/api/design/:id', {id: '@id'}, {
      get : {method: 'GET', isArray: false, transformResponse: function(data, headersGetter, status){
        return panelUtils.transformResponse(data);
      }},
      create : {method: 'POST', isArray: false, transformResponse: function(data, headersGetter, status){
        return panelUtils.transformResponse(data);
      }},
      update : {method: 'PUT', isArray: false, transformResponse: function(data, headersGetter, status){
        return panelUtils.transformResponse(data);
      }},
      delete : {method: 'DELETE', isArray: false, transformResponse: function(data, headersGetter, status){
        return panelUtils.transformResponse(data);
      }},
    }),
  }
}]);
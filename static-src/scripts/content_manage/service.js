/* speech services */
var contentServices = angular.module('contentServices', ['ngResource']);
contentServices.factory('Content', ['$resource', function($resource){
  return{
    classifies : $resource('/api/classifies/:id', {id: '@id'}, {
      get : {method: 'GET', isArray: false, transformResponse: function(data, headersGetter, status){
        return cigemUtils.transformResponse(data);
      }},
      create : {method: 'POST', isArray: false, transformResponse: function(data, headersGetter, status){
        return cigemUtils.transformResponse(data);
      }},
      update : {method: 'PUT', isArray: false, transformResponse: function(data, headersGetter, status){
        return cigemUtils.transformResponse(data);
      }},
      delete : {method: 'DELETE', isArray: false, transformResponse: function(data, headersGetter, status){
        return cigemUtils.transformResponse(data);
      }},
    }),
    series : $resource('/api/series/:id', {id: '@id'}, {
      get : {method: 'GET', isArray: false, transformResponse: function(data, headersGetter, status){
        return cigemUtils.transformResponse(data);
      }},
      create : {method: 'POST', isArray: false, transformResponse: function(data, headersGetter, status){
        return cigemUtils.transformResponse(data);
      }},
      update : {method: 'PUT', isArray: false, transformResponse: function(data, headersGetter, status){
        return cigemUtils.transformResponse(data);
      }},
      delete : {method: 'DELETE', isArray: false, transformResponse: function(data, headersGetter, status){
        return cigemUtils.transformResponse(data);
      }},
    }),
    products : $resource('/api/products/:id', {id: '@id'}, {
      get : {method: 'GET', isArray: false, transformResponse: function(data, headersGetter, status){
        return cigemUtils.transformResponse(data);
      }},
      create : {method: 'POST', isArray: false, transformResponse: function(data, headersGetter, status){
        return cigemUtils.transformResponse(data);
      }},
      update : {method: 'PUT', isArray: false, transformResponse: function(data, headersGetter, status){
        return cigemUtils.transformResponse(data);
      }},
      delete : {method: 'DELETE', isArray: false, transformResponse: function(data, headersGetter, status){
        return cigemUtils.transformResponse(data);
      }},
    }),
    child_series : $resource('/api/child_series/:id', {id: '@id'}, {
        get : {method: 'GET', isArray: false, transformResponse: function(data, headersGetter, status){
                return cigemUtils.transformResponse(data);
            }},
        create : {method: 'POST', isArray: false, transformResponse: function(data, headersGetter, status){
                return cigemUtils.transformResponse(data);
            }},
        update : {method: 'PUT', isArray: false, transformResponse: function(data, headersGetter, status){
                return cigemUtils.transformResponse(data);
            }},
        delete : {method: 'DELETE', isArray: false, transformResponse: function(data, headersGetter, status){
                return cigemUtils.transformResponse(data);
            }},
    }),
  }
}]);
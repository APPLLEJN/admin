/* speech services */
var orderServices = angular.module('orderServices', ['ngResource']);
orderServices.factory('Order', ['$resource', function($resource){
    return{
      order : $resource('/api/order/:id', {id: '@id'}, {
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
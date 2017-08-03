/****** panelAlert ********/
var panelAlert = angular.module('panelAlert', []);

panelAlert.factory('PanelAlert',['$rootScope', function( $rootScope ){

	$rootScope.alerts = [];

	var errorType = {
		'Unprocessable Entity': '参数错误',
		'Expectation Failed': '服务器出错',
		'You don\'t have the permission to access the requested resource. It is either read-protected or not readable by the server.': '对不起，您没有操作权限'
	};

	$rootScope.closeAlert = function(index) {
		$rootScope.alerts.splice(index, 1);
	};

	return {
		addError: function(data){
			$rootScope.alerts = [];

			var msg = typeof data === 'string' ? data : '发生了未知错误';
			if (data.type && data.msg) {
				$rootScope.alerts.push(data);
			} else if(data.text) {
				msg = data.text || '发生了未知错误';
				$rootScope.alerts.push({
					type: 'danger',
					msg: msg
				});
			} else if(data.message) {
				msg = errorType[data.message] || data.message || '发生了未知错误';
				$rootScope.alerts.push({
					type: 'danger',
					msg: msg
				});
			} else {
				$rootScope.alerts.push({
					type: 'danger',
					msg: msg
				});
			}

		},

		clearAlert: function(){
			$rootScope.alerts = [];
		}
	}
}])

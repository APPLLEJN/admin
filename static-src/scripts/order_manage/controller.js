'use strict';
var orderController = angular.module('orderController',['ui.bootstrap']);

orderController.controller('orderListController',['$scope', '$location', '$stateParams', 'CigemAlert', 'Order', '$modal', '$filter',
	function($scope, $location, $stateParams, CigemAlert, Order, $modal, $filter){
		CigemAlert.clearAlert();

    /* init */
    dateInit();

    var search = $location.search();
    $scope.search = {},
    $scope.maxSize = 5,
    $scope.bigCurrentPage = search.page;

    function getOrders(param, success, error){
      NProgress.start();
      Order.order.get(param, function(data, getResponseHeaders){
        NProgress.done();
        var totalNumber = getResponseHeaders()['total-count'];
        success && success(data, totalNumber);
      }, function(err){
        NProgress.done();
        error && error(err);
      });
    }

    function dateInit() {
      $scope.open_start = function ($event) {
        $event.preventDefault();
        $event.stopPropagation();
        $scope.opened_start = true;
      };
      $scope.dateOptions = {
        formatYear: 'yy',
        startingDay: 1
      };
    }

    getOrders(search, function(data, total){
      $scope.time_obj = {
        '1': '10:00 - 12:00',
        '2': '14:00 - 17:00'
      }
      $scope.orders = data.list || [];
      $scope.bigTotalItems = total;
    }, function(err){
      CigemAlert.addError(err.data);
    });
    $scope.creatOrderTime = function(order) {
      if (order) $scope.orderEdit = order;
      var modalInstance = $modal.open({
        templateUrl: 'createOrderTime.html',
        controller: 'createOrderTimeController',
        scope: $scope
      });
    }
    
    $scope.deleteOrderTime = function (id) {
      if (confirm('确认删除？')) {
        Order.order.delete({id: id}, function(data){
          CigemAlert.addError({
            type: 'success',
            msg: '删除成功'
          });
          $scope.orders = $scope.orders.filter(function (item) {
            return item.id !== id
          })
        }, function(err){
          CigemAlert.addError(err.data);
        });
      }
    }
    
    $scope.searchOrders = function () {
      CigemAlert.clearAlert();
      var searchKey = ['username', 'phone']
      var param = cigemUtils.searchCondition(searchKey, $scope.search);
      if($scope.search.date) {
        param.date = $filter('date')($scope.search.date, 'yyyy-MM-dd');
      }
      $location.search(param);
      getOrders(param, function(data, total){
        $scope.orders = data.list;
        $scope.bigTotalItems = total;
        console.log(total)
      }, function(err){
        CigemAlert.addError(err.data);
      });
    }

    $scope.pageChanged = function () {
      $location.search('page', $scope.bigCurrentPage);
      getOrders($location.search(), function (data, total) {
        $scope.orders = data.list;
        $scope.bigTotalItems = total;
        console.log(total)

      }, function (err) {
        CigemAlert.addError(err.data);
      });
    }

}]);

orderController.controller('createOrderTimeController', ['$scope', '$modalInstance', 'CigemAlert', 'Order',  '$filter', '$stateParams',
  function ($scope, $modalInstance, CigemAlert, Order, $filter, $stateParams){
    CigemAlert.clearAlert();
    $scope.order = $scope.orderEdit || {}
    if ($scope.order.time_type){
      $scope.order.onetime = $scope.order.time_type.indexOf(1)>-1
      $scope.order.twotime = $scope.order.time_type.indexOf(2)>-1
    }
    $scope.time_obj = {
      '1': '10:00 - 12:00',
      '2': '14:00 - 17:00'
    }
    /* init */
    function dateInit() {
      $scope.executed_date = function ($event) {
        $event.preventDefault();
        $event.stopPropagation();
        $scope.opened_date = true;
      };
      $scope.dateOptions = {
        formatYear: 'yy',
        startingDay: 1
      };
    }
    dateInit();

    $scope.submit = function () {
      var time_type = []
      if ($scope.order.onetime) {
        time_type.push(1)
      }
      if ($scope.order.twotime) {
        time_type.push(2)
      }
      if (!time_type.length) {
        alert('请选择时间段')
        return
      }

      console.log(!$scope.order.username || !$scope.order.phone)
      var confirmRes = true
      if (!$scope.order.username || !$scope.order.phone) {
        confirmRes = confirm('确认不填写姓名，电话么？')
      }


      if (confirmRes)  {
        var param={
          username: $scope.order.username || 'admin',
          phone: $scope.order.phone || 'admin',
          date:  $filter('date')($scope.order.date, 'yyyy-MM-dd'),
          time_type: time_type,
        }

        if ($scope.order.id) {
          param.id = $scope.order.id
          Order.order.update(param, function(data){
            CigemAlert.addError({
              type: 'success',
              msg: '修改成功'
            });
            $scope.$parent.orders = $scope.$parent.orders.map(function (item) {
              if(item.id == param.id){
                item = param
              }
              return item
            })
            $modalInstance.dismiss('cancel');
          }, function(err){
            var timeMsg = ''
            err.data.time.map(function (item) {
              timeMsg += $scope.time_obj[item]
            })
            alert(err.data.msg + timeMsg);
          });
        } else {
          Order.order.create(param, function(data){
            CigemAlert.addError({
              type: 'success',
              msg: '发布成功'
            });
            $scope.orders.unshift(param)
            $modalInstance.dismiss('cancel');
          }, function(err){
            var timeMsg = ''
            err.data.time.map(function (item) {
              timeMsg += $scope.time_obj[item]
            })
            alert(err.data.msg + timeMsg);
          });
        }
      }
    };

    $scope.close = function () {
      $modalInstance.dismiss('cancel');
    };
}]);


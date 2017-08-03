'use strict';
var channelController = angular.module('channelController',['ui.bootstrap']);

channelController.factory('changeSort',['Channel', 'PanelAlert', function(Channel, PanelAlert){
  return function($scope, type, id, sort, index, scopeData, service){
    var before = $scope[scopeData][index-1]
    var after = $scope[scopeData][index+1]
    var current = $scope[scopeData][index]
    if(type === 'up') {
      Channel[service].update({id: id, sort: before.sort}, function(data){
        Channel[service].update({id: before.id, sort: sort}, function (data) {
          current.sort = before.sort
          before.sort = sort
          $scope[scopeData][index-1] = current
          $scope[scopeData][index] = before
        })
      }, function(err){
        PanelAlert.addError(err.data);
      });
    } else {
      Channel[service].update({id: id, sort: after.sort}, function(data){
        Channel[service].update({id: after.id, sort: sort}, function (data) {
          current.sort = after.sort
          after.sort = sort
          $scope[scopeData][index+1] = current
          $scope[scopeData][index] = after
        })
      }, function(err){
        PanelAlert.addError(err.data);
      });
    }
  }
}])

channelController.controller('newsController',['$scope', '$location', '$stateParams', '$window', 'PanelAlert', 'Channel', '$filter', 'changeSort', 
	function($scope, $location, $stateParams, $window, PanelAlert, Channel, $filter, changeSort){
		PanelAlert.clearAlert();

    /* init */
    var search = $location.search();
    $scope.search = {},
    $scope.maxSize = 5,
    $scope.bigCurrentPage = search.page;
    
    function getNews(param, success, error){
      NProgress.start();
      Channel.news.get(param, function(data, getResponseHeaders){
        NProgress.done();
        var totalNumber = getResponseHeaders()['total-count'];
        success && success(data, totalNumber);
      }, function(err){
        NProgress.done();
        error && error(err);
      });
    }

    getNews(search, function(data, total){
      $scope.newsList = data.list || [];
      $scope.bigTotalItems = total;
    }, function(err){
      PanelAlert.addError(err.data);
    });

    $scope.deleteNews = function (id) {
      if (confirm('确认删除？')) {
        Channel.news.delete({id: id}, function(data){
          PanelAlert.addError({
            type: 'success',
            msg: '删除成功'
          });
          $scope.news = $scope.news.filter(function (item) {
            return item.id !== id
          })
        }, function(err){
          PanelAlert.addError(err.data);
        });
      }
    }

    $scope.searchNews = function () {
      PanelAlert.clearAlert();
      var searchKey = ['title', 'en_title']
      var param = panelUtils.searchCondition(searchKey, $scope.search);
      $location.search(param);
      getNews(param, function(data, total){
        $scope.newsList = data.list;
        $scope.bigTotalItems = total;
      }, function(err){
        PanelAlert.addError(err.data);
      });
    }

    $scope.pageChanged = function () {
      $location.search('page', $scope.bigCurrentPage);
      getNews($location.search(), function (data, total) {
        $scope.newsList = data.list;
        $scope.bigTotalItems = total;
      }, function (err) {
        PanelAlert.addError(err.data);
      });
    }

    $scope.changeSort = function(type, id, sort, index) {
      changeSort($scope, type, id, sort, index, 'newsList', 'news')
    }
}]);

channelController.controller('newsDetailController', ['$scope', '$location', '$stateParams', '$upload', 'PanelAlert', 'Channel', '$filter', '$modal',
  function ($scope, $location, $stateParams, $upload, PanelAlert, Channel, $filter, $modal) {
    PanelAlert.clearAlert();

    /* init */
    var news_id = $stateParams.id;

    /* parameter */
    $scope.isEdit = news_id !== 'new';

    /* common function */
    function dateInit() {
      $scope.news = {}
      $scope.executed_start_time = function ($event) {
        $event.preventDefault();
        $event.stopPropagation();
        $scope.opened_start_time = true;
      };
      $scope.executed_end_time = function ($event) {
        $event.preventDefault();
        $event.stopPropagation();
        $scope.opened_end_time = true;
      };
      $scope.dateOptions = {
        formatYear: 'yy',
        startingDay: 1
      };
    }

    dateInit();

    if ($scope.isEdit) {
      Channel.news.get({id: news_id}, function (data) {
        $scope.news = data;
        NProgress.done();
      }, function (err) {
        NProgress.done();
        PanelAlert.addError(err.data);
      });
    }

    $scope.updateNews = function () {
      if ($scope.isEdit) {
        delete $scope.news.create_time
        delete $scope.news.update_time
        Channel.news.update($scope.news, function (data) {
          NProgress.done();
          PanelAlert.addError({
            type: 'success',
            msg: '修改成功'
          });
        }, function (err) {
          NProgress.done();
          PanelAlert.addError(err.data);
        });
      } else {
        Channel.news.create($scope.news, function (data) {
          NProgress.done();
          PanelAlert.addError({
            type: 'success',
            msg: '创建成功'
          });
          location.href = '#/news';
        }, function (err) {
          NProgress.done();
          PanelAlert.addError(err.data);
        });
      }
    }

    $scope.onFileUpload = function ($files, type) {
      if (!$scope.news) {
        $scope.news = {};
      }

      $scope.upload = $upload.upload({
        url: '/api/upload',
        file: $files
      }).success(function(data, status, headers, config) {
        PanelAlert.addError({
          type: 'success',
          msg: '上传成功'
        });
        if (type === 'mini') {
          $scope.news.image_url_mini = data.image_url
        } else {
          $scope.news.image_url = data.image_url
        }
      }).error(function(data){
        PanelAlert.addError({
          type: 'danger',
          msg: '上传失败'
        });
      });
    };
  }
]);

channelController.controller('recommendsController',['$scope', '$location', '$stateParams', '$window', 'PanelAlert', 'Channel', '$filter', '$modal', 'changeSort',
  function($scope, $location, $stateParams, $window, PanelAlert, Channel, $filter, $modal, changeSort){
    PanelAlert.clearAlert();
    
    /* init */
    var search = $location.search();
    $scope.search = {},
    $scope.maxSize = 5,
    $scope.bigCurrentPage = search.page;

    function getRecommends(param, success, error){
      NProgress.start();
      Channel.recommend.get(param, function(data, getResponseHeaders){
        NProgress.done();
        var totalNumber = getResponseHeaders()['total-count'];
        success && success(data, totalNumber);
      }, function(err){
        NProgress.done();
        error && error(err);
      });
    }

    getRecommends(search, function(data, total){
      $scope.recommends = data.list || [];
      $scope.bigTotalItems = total;
    }, function(err){
      PanelAlert.addError(err.data);
    });

    $scope.deleteRecommend = function (id) {
      if (confirm('确认删除？')) {
        Channel.recommend.delete({id: id}, function(data){
          PanelAlert.addError({
            type: 'success',
            msg: '删除成功'
          });
          $scope.recommends = $scope.recommends.filter(function (item) {
            return item.id !== id
          })
        }, function(err){
          PanelAlert.addError(err.data);
        });
      }
    }

    $scope.searchRecommends = function () {
      PanelAlert.clearAlert();
      var searchKey = ['id', 'product_id']
      var param = panelUtils.searchCondition(searchKey, $scope.search);
      $location.search(param);
      getRecommends(param, function(data, total){
        $scope.recommends = data.list;
        $scope.bigTotalItems = total;
      }, function(err){
        PanelAlert.addError(err.data);
      });
    }

    $scope.pageChanged = function () {
      $location.search('page', $scope.bigCurrentPage);
      getRecommends($location.search(), function (data, total) {
        $scope.recommends = data.list;
        $scope.bigTotalItems = total;
      }, function (err) {
        PanelAlert.addError(err.data);
      });
    }

    $scope.addProduct = function() {
      $scope.modalType = 'recommend'
      var modalInstance = $modal.open({
        templateUrl: 'addProduct.html',
        controller: 'addProductController',
        scope: $scope
      });
    }

    $scope.changeSort = function(type, id, sort, index) {
      changeSort($scope, type, id, sort, index, 'recommends', 'recommend')
    }

}]);

channelController.controller('uniqueController',['$scope', '$location', '$stateParams', '$window', 'PanelAlert', 'Channel', '$filter', '$modal', 'changeSort',
  function($scope, $location, $stateParams, $window, PanelAlert, Channel, $filter, $modal, changeSort){
    PanelAlert.clearAlert();
    /* init */
    var search = $location.search();
    $scope.search = {},
    $scope.maxSize = 5,
    $scope.bigCurrentPage = search.page;

    function getUnique(param, success, error){
      NProgress.start();
      Channel.unique.get(param, function(data, getResponseHeaders){
        NProgress.done();
        var totalNumber = getResponseHeaders()['total-count'];
        success && success(data, totalNumber);
      }, function(err){
        NProgress.done();
        error && error(err);
      });
    }

    getUnique(search, function(data, total){
      $scope.uniqueList = data.list || [];
      $scope.bigTotalItems = total;
    }, function(err){
      PanelAlert.addError(err.data);
    });

    $scope.deleteUnique = function (id) {
      if (confirm('确认删除？')) {
        Channel.unique.delete({id: id}, function(data){
          PanelAlert.addError({
            type: 'success',
            msg: '删除成功'
          });
          $scope.uniqueList = $scope.uniqueList.filter(function (item) {
            return item.id !== id
          })
        }, function(err){
          PanelAlert.addError(err.data);
        });
      }
    }

    $scope.searchUnique = function () {
      PanelAlert.clearAlert();
      var searchKey = ['id', 'product_id']
      var param = panelUtils.searchCondition(searchKey, $scope.search);
      $location.search(param);
      getUnique(param, function(data, total){
        $scope.uniqueList = data.list;
        $scope.bigTotalItems = total;
      }, function(err){
        PanelAlert.addError(err.data);
      });
    }

    $scope.pageChanged = function () {
      $location.search('page', $scope.bigCurrentPage);
      getUnique($location.search(), function (data, total) {
        $scope.uniqueList = data.list;
        $scope.bigTotalItems = total;
      }, function (err) {
        PanelAlert.addError(err.data);
      });
    }


    $scope.addProduct = function() {
      $scope.modalType = 'unique'
      var modalInstance = $modal.open({
        templateUrl: 'addProduct.html',
        controller: 'addProductController',
        scope: $scope
      });
    }

    $scope.changeSort = function(type, id, sort, index) {
      changeSort($scope, type, id, sort, index, 'uniqueList', 'unique')
    }

  }]);

channelController.controller('designController',['$scope', '$location', '$stateParams', '$window', 'PanelAlert', 'Channel', '$filter', '$modal', 'changeSort',
  function($scope, $location, $stateParams, $window, PanelAlert, Channel, $filter, $modal, changeSort){
    PanelAlert.clearAlert();
    /* init */
    var search = $location.search();
    $scope.search = {},
    $scope.maxSize = 5,
    $scope.bigCurrentPage = search.page;

    function getDesign(param, success, error){
      NProgress.start();
      Channel.design.get(param, function(data, getResponseHeaders){
        NProgress.done();
        var totalNumber = getResponseHeaders()['total-count'];
        success && success(data, totalNumber);
      }, function(err){
        NProgress.done();
        error && error(err);
      });
    }

    getDesign(search, function(data, total){
      $scope.designList = data.list || [];
      $scope.bigTotalItems = total;
    }, function(err){
      PanelAlert.addError(err.data);
    });

    $scope.deleteDesign = function (id) {
      if (confirm('确认删除？')) {
        Channel.design.delete({id: id}, function(data){
          PanelAlert.addError({
            type: 'success',
            msg: '删除成功'
          });
          $scope.classifies = $scope.classifies.filter(function (item) {
            return item.id !== id
          })
        }, function(err){
          PanelAlert.addError(err.data);
        });
      }
    }

    $scope.searchDesign = function () {
      PanelAlert.clearAlert();
      var searchKey = ['id', 'product_id']
      var param = panelUtils.searchCondition(searchKey, $scope.search);
      $location.search(param);
      getDesign(param, function(data, total){
        $scope.designList = data.list;
        $scope.bigTotalItems = total;
      }, function(err){
        PanelAlert.addError(err.data);
      });
    }

    $scope.pageChanged = function () {
      $location.search('page', $scope.bigCurrentPage);
      getDesign($location.search(), function (data, total) {
        $scope.designList = data.list;
        $scope.bigTotalItems = total;
      }, function (err) {
        PanelAlert.addError(err.data);
      });
    }


    $scope.addProduct = function() {
      $scope.modalType = 'design'
      var modalInstance = $modal.open({
        templateUrl: 'addProduct.html',
        controller: 'addProductController',
        scope: $scope
      });
    }

    $scope.changeSort = function(type, id, sort, index) {
      changeSort($scope, type, id, sort, index, 'designList', 'design')
    }

}]);

channelController.controller('addProductController', ['$scope', '$modalInstance', 'PanelAlert', 'Channel',  '$filter', '$stateParams',
  function ($scope, $modalInstance, PanelAlert, Channel, $filter, $stateParams){
    PanelAlert.clearAlert();
    $scope[$scope.modalType] = {}
    $scope.submit = function () {
      if ($scope[$scope.modalType].id) {
        Channel[$scope.modalType].update($scope[$scope.modalType], function(data){
          PanelAlert.addError({
            type: 'success',
            msg: '修改成功'
          });
          $modalInstance.dismiss('cancel');
        }, function(err){
          PanelAlert.addError(err.data);
        });
      } else {
        Channel[$scope.modalType].create($scope[$scope.modalType], function(data){
          PanelAlert.addError({
            type: 'success',
            msg: '发布成功'
          });
          $modalInstance.dismiss('cancel');
        }, function(err){
          PanelAlert.addError(err.data);
        });
      }
    };
    $scope.close = function () {
      $modalInstance.dismiss('cancel');
    };
  }]);




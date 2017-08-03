'use strict';
var contentController = angular.module('contentController',['ui.bootstrap']);

contentController.factory('changeSort',['Content', 'PanelAlert', function(Content, PanelAlert){
  return function($scope, type, id, sort, index, scopeData, service){
    var before = $scope[scopeData][index-1]
    var after = $scope[scopeData][index+1]
    var current = $scope[scopeData][index]
    if(type === 'up') {
      Content[service].update({id: id, sort: before.sort}, function(data){
        Content[service].update({id: before.id, sort: sort}, function (data) {
          current.sort = before.sort
          before.sort = sort
          $scope[scopeData][index-1] = current
          $scope[scopeData][index] = before
        })
      }, function(err){
        PanelAlert.addError(err.data);
      });
    } else {
      Content[service].update({id: id, sort: after.sort}, function(data){
        Content[service].update({id: after.id, sort: sort}, function (data) {
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

contentController.controller('classifyController',['$scope', '$location', '$stateParams', '$window', 'PanelAlert', 'Content', '$filter', 'changeSort',
	function($scope, $location, $stateParams, $window, PanelAlert, Content, $filter, changeSort){
		PanelAlert.clearAlert();

		/* init */
    var search = $location.search();
    $scope.search = {},
    $scope.maxSize = 5,
    $scope.bigCurrentPage = search.page;
    
    function getClassifies(param, success, error){
      NProgress.start();
      Content.classifies.get(param, function(data, getResponseHeaders){
        NProgress.done();
        var totalNumber = getResponseHeaders()['total-count'];
        success && success(data, totalNumber);
      }, function(err){
        NProgress.done();
        error && error(err);
      });
    }

    getClassifies(search, function(data, total){
      $scope.classifies = data.list || [];
      $scope.bigTotalItems = total;
    }, function(err){
      PanelAlert.addError(err.data);
    });

    $scope.deleteClassify = function (id) {
      if (confirm('确认删除？')) {
        Content.classifies.delete({id: id}, function(data){
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

    $scope.searchClassifies = function () {
      PanelAlert.clearAlert();
      var searchKey = ['name', 'en_name']
      var param = panelUtils.searchCondition(searchKey, $scope.search);
      $location.search(param);
      getClassifies(param, function(data, total){
        $scope.classifies = data.list;
        $scope.bigTotalItems = total;
      }, function(err){
        PanelAlert.addError(err.data);
      });
    }

    $scope.pageChanged = function () {
      $location.search('page', $scope.bigCurrentPage);
      getClassifies($location.search(), function (data, total) {
        $scope.classifies = data.list;
        $scope.bigTotalItems = total;
      }, function (err) {
        PanelAlert.addError(err.data);
      });
    }

    $scope.changeSort = function(type, id, sort, index) {
      changeSort($scope, type, id, sort, index, 'classifies', 'classifies')
    }
  }]);

contentController.controller('classifyDetailController', ['$scope', '$location', '$stateParams', '$upload', 'PanelAlert', 'Content', '$filter', '$modal',
  function ($scope, $location, $stateParams, $upload, PanelAlert, Content, $filter, $modal) {
    PanelAlert.clearAlert();

		/* init */
    var classify_id = $stateParams.id;
    $scope.classify = {}

		/* parameter */
    $scope.isEdit = classify_id !== 'new';

    if ($scope.isEdit) {
      Content.classifies.get({id: classify_id}, function (data) {
        $scope.classify = data;
        NProgress.done();
      }, function (err) {
        NProgress.done();
        PanelAlert.addError(err.data);
      });
    }

    $scope.updateContent = function () {
      if ($scope.isEdit) {
        delete $scope.classify.create_time
        delete $scope.classify.update_time
        Content.classifies.update($scope.classify, function (data) {
          NProgress.done();
          PanelAlert.addError({
            type: 'success',
            msg: '修改成功'
          });
          location.href = '#/classifies';
        }, function (err) {
          NProgress.done();
          PanelAlert.addError(err.data);
        });
      } else {
        Content.classifies.create($scope.classify, function (data) {
          NProgress.done();
          PanelAlert.addError({
            type: 'success',
            msg: '创建成功'
          });
          location.href = '#/classifies';
        }, function (err) {
          NProgress.done();
          PanelAlert.addError(err.data);
        });
      }
    }

    $scope.onFileUpload = function ($files) {
      if (!$scope.content) {
        $scope.content = {};
      }
      $scope.content.image = "正在上传...";

      $scope.upload = $upload.upload({
        url: '/api/upload',
        file: $files
      }).success(function(data, status, headers, config) {
        PanelAlert.addError({
          type: 'success',
          msg: '上传成功'
        });
        $scope.classify.image_url = data.image_url
      }).error(function(data){
        PanelAlert.addError({
          type: 'danger',
          msg: '上传失败'
        });
      });
    };
  }
]);

contentController.controller('seriesController',['$scope', '$location', '$stateParams', '$window', 'PanelAlert', 'Content', '$filter', 'changeSort',
  function($scope, $location, $stateParams, $window, PanelAlert, Content, $filter, changeSort){
    PanelAlert.clearAlert();

    /* init */
    var search = $location.search();
    $scope.search = {},
    $scope.maxSize = 5,
    $scope.bigCurrentPage = search.page;

    function getSeries(param, success, error){
      NProgress.start();
      Content.series.get(param, function(data, getResponseHeaders){
        NProgress.done();
        var totalNumber = getResponseHeaders()['total-count'];
        success && success(data, totalNumber);
      }, function(err){
        NProgress.done();
        error && error(err);
      });
    }

    getSeries(search, function(data, total){
      $scope.seriesList = data.list || [];
      $scope.bigTotalItems = total;
    }, function(err){
      PanelAlert.addError(err.data);
    });

    $scope.deleteSeries = function (id) {
      if (confirm('确认删除？')) {
        Content.series.delete({id: id}, function(data){
          PanelAlert.addError({
            type: 'success',
            msg: '删除成功'
          });
          $scope.seriesList = $scope.seriesList.filter(function (item) {
            return item.id !== id
          })
        }, function(err){
          PanelAlert.addError(err.data);
        });
      }
    }

    $scope.searchSeries = function () {
      PanelAlert.clearAlert();
      var searchKey = ['name', 'en_name']
      var param = panelUtils.searchCondition(searchKey, $scope.search);
      $location.search(param);
      getSeries(param, function(data, total){
        $scope.seriesList = data.list;
        $scope.bigTotalItems = total;
      }, function(err){
        PanelAlert.addError(err.data);
      });
    }

    $scope.pageChanged = function () {
      $location.search('page', $scope.bigCurrentPage);
      getSeries($location.search(), function (data, total) {
        $scope.seriesList = data.list;
        $scope.bigTotalItems = total;
      }, function (err) {
        PanelAlert.addError(err.data);
      });
    }

    $scope.changeSort = function(type, id, sort, index) {
      changeSort($scope, type, id, sort, index, 'seriesList', 'series')
    }
}]);

contentController.controller('seriesDetailController', ['$scope', '$location', '$stateParams', '$upload', 'PanelAlert', 'Content', '$filter', '$modal',
  function ($scope, $location, $stateParams, $upload, PanelAlert, Content, $filter, $modal) {
    PanelAlert.clearAlert();

    /* init */
    var series_id = $stateParams.id;

    /* parameter */
    $scope.isEdit = series_id !== 'new';

    if ($scope.isEdit) {
      Content.classifies.get({id: series_id}, function (data) {
        $scope.series = data;
        NProgress.done();
      }, function (err) {
        NProgress.done();
        PanelAlert.addError(err.data);
      });
    }

    $scope.updateContent = function () {
      if ($scope.isEdit) {
        delete $scope.series.create_time
        delete $scope.series.update_time
        Content.series.update($scope.series, function (data) {
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
        Content.series.create($scope.series, function (data) {
          NProgress.done();
          PanelAlert.addError({
            type: 'success',
            msg: '创建成功'
          });
          location.href = '#/series';
        }, function (err) {
          NProgress.done();
          PanelAlert.addError(err.data);
        });
      }
    }

    $scope.onFileUpload = function ($files) {
      if (!$scope.series) {
        $scope.series = {};
      }
      $scope.upload = $upload.upload({
        url: '/api/upload',
        file: $files
      }).success(function(data, status, headers, config) {
        PanelAlert.addError({
          type: 'success',
          msg: '上传成功'
        });
        $scope.series.image_url = data.image_url
      }).error(function(data){
        PanelAlert.addError({
          type: 'danger',
          msg: '上传失败'
        });
      });
    };
  }
]);

contentController.controller('productsController',['$scope', '$location', '$stateParams', '$window', 'PanelAlert', 'Content', '$filter',
  function($scope, $location, $stateParams, $window, PanelAlert, Content, $filter){
    PanelAlert.clearAlert();

    /* init */
    var search = $location.search();
    $scope.search = {},
    $scope.maxSize = 5,
    $scope.bigCurrentPage = search.page;

    function getProducts(param, success, error){
      NProgress.start();
      Content.products.get(param, function(data, getResponseHeaders){
        NProgress.done();
        var totalNumber = getResponseHeaders()['total-count'];
        success && success(data, totalNumber);
      }, function(err){
        NProgress.done();
        error && error(err);
      });
    }

    getProducts(search, function(data, total){
      $scope.products = data.list || [];
      $scope.bigTotalItems = total;
    }, function(err){
      PanelAlert.addError(err.data);
    });

    $scope.deleteProduct = function (id) {
      if (confirm('确认删除？')) {
        Content.products.delete({id: id}, function(data){
          PanelAlert.addError({
            type: 'success',
            msg: '删除成功'
          });
          $scope.products = $scope.products.filter(function (item) {
            return item.id !== id
          })
        }, function(err){
          PanelAlert.addError(err.data);
        });
      }
    }

    $scope.searchProducts = function () {
      PanelAlert.clearAlert();
      var searchKey = ['name', 'en_name']
      var param = panelUtils.searchCondition(searchKey, $scope.search);
      $location.search(param);
      getProducts(param, function(data, total){
        $scope.products = data.list;
        $scope.bigTotalItems = total;
      }, function(err){
        PanelAlert.addError(err.data);
      });
    }

    $scope.pageChanged = function () {
      $location.search('page', $scope.bigCurrentPage);
      getProducts($location.search(), function (data, total) {
        $scope.products = data.list;
        $scope.bigTotalItems = total;
      }, function (err) {
        PanelAlert.addError(err.data);
      });
    }
}]);

contentController.controller('productDetailController', ['$scope', '$location', '$stateParams', '$upload', 'PanelAlert', 'Content', '$filter', '$modal',
  function ($scope, $location, $stateParams, $upload, PanelAlert, Content, $filter, $modal) {
    PanelAlert.clearAlert();

    /* init */
    var product_id = $stateParams.id;

    /* parameter */
    $scope.isEdit = product_id !== 'new';

    /* common function */
    productInit();
    
    
    function productInit() {
      Content.series.get({}, function (data) {
        $scope.series = data.list
      })
      Content.classifies.get({}, function (data) {
        $scope.classifies = data.list
      })
    }

    if ($scope.isEdit) {
      Content.products.get({id: product_id}, function (data) {
        $scope.product = data;
        NProgress.done();
      }, function (err) {
        NProgress.done();
        PanelAlert.addError(err.data);
      });
    }

    $scope.updateContent = function () {
      if ($scope.isEdit) {
        delete $scope.product.create_time
        delete $scope.product.update_time
        Content.products.update($scope.product, function (data) {
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
        Content.products.create($scope.product, function (data) {
          NProgress.done();
          PanelAlert.addError({
            type: 'success',
            msg: '创建成功'
          });
          location.href = '#/products';
        }, function (err) {
          NProgress.done();
          PanelAlert.addError(err.data);
        });
      }
    }

    $scope.onFileUpload = function ($files, type) {
      if (!$scope.product) {
        $scope.product = {};
      }

      $scope.upload = $upload.upload({
        url: '/api/upload',
        file: $files
      }).success(function(data, status, headers, config) {
        PanelAlert.addError({
          type: 'success',
          msg: '上传成功'
        });
        if(type === 'mini') {
          $scope.product.image_url_mini = data.image_url
        } else {
          $scope.product.image_url = data.image_url
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

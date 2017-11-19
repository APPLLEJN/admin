'use strict';
var contentController = angular.module('contentController',['ui.bootstrap']);

contentController.factory('handleSort',['Content', 'CigemAlert', function(Content, CigemAlert){
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
        CigemAlert.addError(err.data);
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
        CigemAlert.addError(err.data);
      });
    }
  }
}])

contentController.controller('classifyController',['$scope', '$location', '$stateParams', '$window', 'CigemAlert', 'Content', '$filter', 'handleSort',
	function($scope, $location, $stateParams, $window, CigemAlert, Content, $filter, handleSort){
		CigemAlert.clearAlert();

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
      CigemAlert.addError(err.data);
    });

    $scope.deleteClassify = function (id) {
      if (confirm('确认删除？')) {
        Content.classifies.delete({id: id}, function(data){
          CigemAlert.addError({
            type: 'success',
            msg: '删除成功'
          });
          $scope.classifies = $scope.classifies.filter(function (item) {
            return item.id !== id
          })
        }, function(err){
          CigemAlert.addError(err.data);
        });
      }
    }

    $scope.searchClassifies = function () {
      CigemAlert.clearAlert();
      var searchKey = ['name', 'en_name']
      var param = cigemUtils.searchCondition(searchKey, $scope.search);
      $location.search(param);
      getClassifies(param, function(data, total){
        $scope.classifies = data.list;
        $scope.bigTotalItems = total;
      }, function(err){
        CigemAlert.addError(err.data);
      });
    }

    $scope.pageChanged = function () {
      $location.search('page', $scope.bigCurrentPage);
      getClassifies($location.search(), function (data, total) {
        $scope.classifies = data.list;
        $scope.bigTotalItems = total;
      }, function (err) {
        CigemAlert.addError(err.data);
      });
    }

    $scope.handleSort = function(type, id, sort, index) {
      handleSort($scope, type, id, sort, index, 'classifies', 'classifies')
    }
  }]);

contentController.controller('classifyDetailController', ['$scope', '$location', '$stateParams', '$upload', 'CigemAlert', 'Content', '$filter', '$modal',
  function ($scope, $location, $stateParams, $upload, CigemAlert, Content, $filter, $modal) {
    CigemAlert.clearAlert();

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
        CigemAlert.addError(err.data);
      });
    }

    $scope.updateContent = function () {
      if ($scope.isEdit) {
        delete $scope.classify.create_time
        delete $scope.classify.update_time
        Content.classifies.update($scope.classify, function (data) {
          NProgress.done();
          CigemAlert.addError({
            type: 'success',
            msg: '修改成功'
          });
          location.href = '#/classifies';
        }, function (err) {
          NProgress.done();
          CigemAlert.addError(err.data);
        });
      } else {
        Content.classifies.create($scope.classify, function (data) {
          NProgress.done();
          CigemAlert.addError({
            type: 'success',
            msg: '创建成功'
          });
          location.href = '#/classifies';
        }, function (err) {
          NProgress.done();
          CigemAlert.addError(err.data);
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
        CigemAlert.addError({
          type: 'success',
          msg: '上传成功'
        });
        $scope.classify.image_url = data.image_url
      }).error(function(data){
        CigemAlert.addError({
          type: 'danger',
          msg: '上传失败'
        });
      });
    };
  }
]);

contentController.controller('seriesController',['$scope', '$location', '$stateParams', '$window', 'CigemAlert', 'Content', '$filter', 'handleSort',
  function($scope, $location, $stateParams, $window, CigemAlert, Content, $filter, handleSort){
    CigemAlert.clearAlert();

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
      CigemAlert.addError(err.data);
    });

    $scope.deleteSeries = function (id) {
      if (confirm('确认删除？')) {
        Content.series.delete({id: id}, function(data){
          CigemAlert.addError({
            type: 'success',
            msg: '删除成功'
          });
          $scope.seriesList = $scope.seriesList.filter(function (item) {
            return item.id !== id
          })
        }, function(err){
          CigemAlert.addError(err.data);
        });
      }
    }

    $scope.searchSeries = function () {
      CigemAlert.clearAlert();
      var searchKey = ['name', 'en_name']
      var param = cigemUtils.searchCondition(searchKey, $scope.search);
      $location.search(param);
      getSeries(param, function(data, total){
        $scope.seriesList = data.list;
        $scope.bigTotalItems = total;
      }, function(err){
        CigemAlert.addError(err.data);
      });
    }

    $scope.pageChanged = function () {
      $location.search('page', $scope.bigCurrentPage);
      getSeries($location.search(), function (data, total) {
        $scope.seriesList = data.list;
        $scope.bigTotalItems = total;
      }, function (err) {
        CigemAlert.addError(err.data);
      });
    }

    $scope.handleSort = function(type, id, sort, index) {
      handleSort($scope, type, id, sort, index, 'seriesList', 'series')
    }
}]);

contentController.controller('seriesDetailController', ['$scope', '$location', '$stateParams', '$upload', 'CigemAlert', 'Content', '$filter', '$modal',
  function ($scope, $location, $stateParams, $upload, CigemAlert, Content, $filter, $modal) {
    CigemAlert.clearAlert();

    /* init */
    var series_id = $stateParams.id;

    /* parameter */
    $scope.isEdit = series_id !== 'new';

    if ($scope.isEdit) {
      Content.series.get({id: series_id}, function (data) {
        $scope.series = data;
        NProgress.done();
      }, function (err) {
        NProgress.done();
        CigemAlert.addError(err.data);
      });
    }

    $scope.updateContent = function () {
      if ($scope.isEdit) {
        delete $scope.series.create_time
        delete $scope.series.update_time
        Content.series.update($scope.series, function (data) {
          NProgress.done();
          CigemAlert.addError({
            type: 'success',
            msg: '修改成功'
          });
        }, function (err) {
          NProgress.done();
          CigemAlert.addError(err.data);
        });
      } else {
        Content.series.create($scope.series, function (data) {
          NProgress.done();
          CigemAlert.addError({
            type: 'success',
            msg: '创建成功'
          });
          location.href = '#/series';
        }, function (err) {
          NProgress.done();
          CigemAlert.addError(err.data);
        });
      }
    }

    $scope.onFileUpload = function ($files, type) {
      if (!$scope.series) {
        $scope.series = {};
      }
      $scope.upload = $upload.upload({
        url: '/api/upload',
        file: $files
      }).success(function(data, status, headers, config) {
        CigemAlert.addError({
          type: 'success',
          msg: '上传成功'
        });
        if(type === 'mini') {
            $scope.product.image_url_mini = data.image_url
        } else {
            $scope.product.image_url = data.image_url
        }
      }).error(function(data){
        CigemAlert.addError({
          type: 'danger',
          msg: '上传失败'
        });
      });
    };
  }
]);

contentController.controller('productsController',['$scope', '$location', '$stateParams', '$window', 'CigemAlert', 'Content', '$filter',
  function($scope, $location, $stateParams, $window, CigemAlert, Content, $filter){
    CigemAlert.clearAlert();

    /* init */
    var search = $location.search();
    $scope.search = {},
    $scope.maxSize = 5,
    $scope.bigCurrentPage = search.page;
    $scope.wearing = [
      {name: '戒指', en_name: 'ring', id: 10},
      {name: '对戒', en_name: 'twin ring', id: 11},
      {name: '项链', en_name: 'choker necklace', id: 20},
      {name: '锁骨链', en_name: 'princess necklace', id: 21},
      {name: '手镯', en_name: 'bangle', id: 30},
      {name: '手链', en_name: 'bracelet', id: 31},
      {name: '耳钉', en_name: 'stud', id: 40},
      {name: '耳环', en_name: 'earring', id: 41},
      {name: '胸针', en_name: 'brooch', id: 50},
      {name: '领针', en_name: 'collar pin', id: 51},
      {name: '其他', en_name: 'other', id: 90},
    ]
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
      $scope.products.forEach(function (item) {
        $scope.wearing.map(function (_item) {
          if(item.wearing_method == _item.id){
            item.wearingName = _item.name
          }
          return item
        })
      })
      $scope.bigTotalItems = total;
    }, function(err){
      CigemAlert.addError(err.data);
    });

    $scope.deleteProduct = function (id) {
      if (confirm('确认删除？')) {
        Content.products.delete({id: id}, function(data){
          CigemAlert.addError({
            type: 'success',
            msg: '删除成功'
          });
          $scope.products = $scope.products.filter(function (item) {
            return item.id !== id
          })
        }, function(err){
          CigemAlert.addError(err.data);
        });
      }
    }

    $scope.searchProducts = function () {
      CigemAlert.clearAlert();
      var searchKey = ['name', 'en_name']
      var param = cigemUtils.searchCondition(searchKey, $scope.search);
      $location.search(param);
      getProducts(param, function(data, total){
        $scope.products = data.list;
        $scope.bigTotalItems = total;
      }, function(err){
        CigemAlert.addError(err.data);
      });
    }

    $scope.pageChanged = function () {
      $location.search('page', $scope.bigCurrentPage);
      getProducts($location.search(), function (data, total) {
        $scope.products = data.list;
        $scope.bigTotalItems = total;
      }, function (err) {
        CigemAlert.addError(err.data);
      });
    }
    

}]);

contentController.controller('productDetailController', ['$scope', '$location', '$stateParams', '$upload', 'CigemAlert', 'Content', '$filter', '$modal',
  function ($scope, $location, $stateParams, $upload, CigemAlert, Content, $filter, $modal) {
    CigemAlert.clearAlert();

    /* init */
    var product_id = $stateParams.id;

    /* parameter */
    $scope.isEdit = product_id !== 'new';
    $scope.wearing = [
      {name: '戒指', en_name: 'ring', id: 10},
      {name: '对戒', en_name: 'twin ring', id: 11},
      {name: '项链', en_name: 'choker necklace', id: 20},
      {name: '锁骨链', en_name: 'princess necklace', id: 21},
      {name: '手镯', en_name: 'bangle', id: 30},
      {name: '手链', en_name: 'bracelet', id: 31},
      {name: '耳钉', en_name: 'stud', id: 40},
      {name: '耳环', en_name: 'earring', id: 41},
      {name: '胸针', en_name: 'brooch', id: 50},
      {name: '领针', en_name: 'collar pin', id: 51},
      {name: '其他', en_name: 'other', id: 90},
    ]

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
        CigemAlert.addError(err.data);
      });
    }

    $scope.updateContent = function () {
      if ($scope.isEdit) {
        delete $scope.product.create_time
        delete $scope.product.update_time
        delete $scope.product.design_id
        Content.products.update($scope.product, function (data) {
          NProgress.done();
          CigemAlert.addError({
            type: 'success',
            msg: '修改成功'
          });
        }, function (err) {
          NProgress.done();
          CigemAlert.addError(err.data);
        });
      } else {
        Content.products.create($scope.product, function (data) {
          NProgress.done();
          CigemAlert.addError({
            type: 'success',
            msg: '创建成功'
          });
          location.href = '#/products';
        }, function (err) {
          NProgress.done();
          CigemAlert.addError(err.data);
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
        CigemAlert.addError({
          type: 'success',
          msg: '上传成功'
        });
        if(type === 'mini') {
          $scope.product.image_url_mini = data.image_url
        } else {
          $scope.product.image_url = data.image_url
        }
      }).error(function(data){
        CigemAlert.addError({
          type: 'danger',
          msg: '上传失败'
        });
      });
    };
  }
]);

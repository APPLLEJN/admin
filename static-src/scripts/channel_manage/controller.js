'use strict';
var channelController = angular.module('channelController',['ui.bootstrap']);

channelController.directive('contenteditable', function() {
  return {
    restrict: 'A' ,
    require: 'ngModel',
    link: function(scope, element, attrs, ctrl) {
      // 创建编辑器
      var editor = scope.editor = new wangEditor('editor-trigger');
      editor.config.menus = [
        'source',
        '|',     // '|' 是菜单组的分割线
        'head',
        'bold',
        'underline',
        'italic',
        'forecolor',
        'link',
        'unlink',
        '|',     // '|' 是菜单组的分割线
        'img',
      ];
      editor.config.uploadImgUrl = '/api/upload';
      editor.config.uploadImgFns.onload = function (resultText, xhr) {
        console.log(resultText, 'resultText')
        // 上传图片时，已经将图片的名字存在 editor.uploadImgOriginalName
        var originalName = editor.uploadImgOriginalName || '';
        // 如果 resultText 是图片的url地址，可以这样插入图片：
        editor.command(null, 'insertHtml', '<img src="' + JSON.parse(resultText).image_url + '" alt="' + originalName + '" style="max-width:100%;"/>');
      };
      editor.onchange = function () {
        // 从 onchange 函数中更新数据
        scope.$apply(function () {
          var html = editor.$txt.html();
          ctrl.$setViewValue(html);
        });
      };
      editor.create();
    }
  };
});

angular.module('channelController').directive('scrollToBottom', function() {
  return {
    restrict: 'A',
    link: function(scope, elm, attr) {
      elm.bind('scroll', function() {
        if (elm[0].scrollHeight - elm[0].scrollTop < parseInt(elm[0].style.height) + 5) {
          scope.$apply(function() {
            scope.isBottom = true;
          });
        }
      });
    }
  };
});

channelController.factory('changeSort',['Channel', 'CigemAlert', function(Channel, CigemAlert){
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
        CigemAlert.addError(err.data);
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
        CigemAlert.addError(err.data);
      });
    }
  }
}])

channelController.controller('newsController',['$scope', '$location', '$stateParams', '$window', 'CigemAlert', 'Channel', '$filter', 'changeSort',
	function($scope, $location, $stateParams, $window, CigemAlert, Channel, $filter, changeSort){
		CigemAlert.clearAlert();

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
      CigemAlert.addError(err.data);
    });

    $scope.deleteNews = function (id) {
      if (confirm('确认删除？')) {
        Channel.news.delete({id: id}, function(data){
          CigemAlert.addError({
            type: 'success',
            msg: '删除成功'
          });
          $scope.news = $scope.news.filter(function (item) {
            return item.id !== id
          })
        }, function(err){
          CigemAlert.addError(err.data);
        });
      }
    }

    $scope.searchNews = function () {
      CigemAlert.clearAlert();
      var searchKey = ['title', 'en_title']
      var param = cigemUtils.searchCondition(searchKey, $scope.search);
      $location.search(param);
      getNews(param, function(data, total){
        $scope.newsList = data.list;
        $scope.bigTotalItems = total;
      }, function(err){
        CigemAlert.addError(err.data);
      });
    }

    $scope.pageChanged = function () {
      $location.search('page', $scope.bigCurrentPage);
      getNews($location.search(), function (data, total) {
        $scope.newsList = data.list;
        $scope.bigTotalItems = total;
      }, function (err) {
        CigemAlert.addError(err.data);
      });
    }

    $scope.changeSort = function(type, id, sort, index) {
      changeSort($scope, type, id, sort, index, 'newsList', 'news')
    }
}]);

channelController.controller('newsDetailController', ['$scope', '$location', '$stateParams', '$upload', 'CigemAlert', 'Channel', '$filter', '$modal',
  function ($scope, $location, $stateParams, $upload, CigemAlert, Channel, $filter, $modal) {
    CigemAlert.clearAlert();

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
        $scope.editor.$txt.html(data.content);
        NProgress.done();
      }, function (err) {
        NProgress.done();
        CigemAlert.addError(err.data);
      });
    }

    $scope.updateNews = function () {
      if ($scope.isEdit) {
        delete $scope.news.create_time
        delete $scope.news.update_time
        Channel.news.update($scope.news, function (data) {
          NProgress.done();
          CigemAlert.addError({
            type: 'success',
            msg: '修改成功'
          });
          $scope.editor.destroy();
        }, function (err) {
          NProgress.done();
          CigemAlert.addError(err.data);
        });
      } else {
        Channel.news.create($scope.news, function (data) {
          NProgress.done();
          CigemAlert.addError({
            type: 'success',
            msg: '创建成功'
          });
          location.href = '#/news';
          $scope.editor.destroy();

        }, function (err) {
          NProgress.done();
          CigemAlert.addError(err.data);
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
        CigemAlert.addError({
          type: 'success',
          msg: '上传成功'
        });
        if (type === 'mini') {
          $scope.news.image_url_mini = data.image_url
        } else {
          $scope.news.image_url = data.image_url
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

channelController.controller('recommendsController',['$scope', '$location', '$stateParams', '$window', 'CigemAlert', 'Channel', '$filter', '$modal', 'changeSort',
  function($scope, $location, $stateParams, $window, CigemAlert, Channel, $filter, $modal, changeSort){
    CigemAlert.clearAlert();
    
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
      CigemAlert.addError(err.data);
    });

    $scope.deleteRecommend = function (id) {
      if (confirm('确认删除？')) {
        Channel.recommend.delete({id: id}, function(data){
          CigemAlert.addError({
            type: 'success',
            msg: '删除成功'
          });
          $scope.recommends = $scope.recommends.filter(function (item) {
            return item.id !== id
          })
        }, function(err){
          CigemAlert.addError(err.data);
        });
      }
    }

    $scope.searchRecommends = function () {
      CigemAlert.clearAlert();
      var searchKey = ['id', 'product_id']
      var param = cigemUtils.searchCondition(searchKey, $scope.search);
      $location.search(param);
      getRecommends(param, function(data, total){
        $scope.recommends = data.list;
        $scope.bigTotalItems = total;
      }, function(err){
        CigemAlert.addError(err.data);
      });
    }

    $scope.pageChanged = function () {
      $location.search('page', $scope.bigCurrentPage);
      getRecommends($location.search(), function (data, total) {
        $scope.recommends = data.list;
        $scope.bigTotalItems = total;
      }, function (err) {
        CigemAlert.addError(err.data);
      });
    }

    $scope.addProduct = function(obj) {
      $scope.modalType = 'recommend'
      if (obj){
        obj.image_url_mini = obj.image_url
        $scope.isEdit = true
      }
      $scope.products = obj ? [obj] : [];
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

channelController.controller('uniqueController',['$scope', '$location', '$stateParams', '$window', 'CigemAlert', 'Channel', '$filter', '$modal', 'changeSort',
  function($scope, $location, $stateParams, $window, CigemAlert, Channel, $filter, $modal, changeSort){
    CigemAlert.clearAlert();
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
      CigemAlert.addError(err.data);
    });

    $scope.deleteUnique = function (id) {
      if (confirm('确认删除？')) {
        Channel.unique.delete({id: id}, function(data){
          CigemAlert.addError({
            type: 'success',
            msg: '删除成功'
          });
          $scope.uniqueList = $scope.uniqueList.filter(function (item) {
            return item.id !== id
          })
        }, function(err){
          CigemAlert.addError(err.data);
        });
      }
    }

    $scope.searchUnique = function () {
      CigemAlert.clearAlert();
      var searchKey = ['id', 'product_id']
      var param = cigemUtils.searchCondition(searchKey, $scope.search);
      $location.search(param);
      getUnique(param, function(data, total){
        $scope.uniqueList = data.list;
        $scope.bigTotalItems = total;
      }, function(err){
        CigemAlert.addError(err.data);
      });
    }

    $scope.pageChanged = function () {
      $location.search('page', $scope.bigCurrentPage);
      getUnique($location.search(), function (data, total) {
        $scope.uniqueList = data.list;
        $scope.bigTotalItems = total;
      }, function (err) {
        CigemAlert.addError(err.data);
      });
    }


    $scope.addProduct = function(obj) {
      $scope.modalType = 'unique'
      if (obj){
        obj.image_url_mini = obj.image_url
        $scope.isEdit = true
      }
      $scope.products = obj ? [obj] : [];
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

channelController.controller('designController',['$scope', '$location', '$stateParams', '$window', 'CigemAlert', 'Channel', '$filter', '$modal', 'changeSort',
  function($scope, $location, $stateParams, $window, CigemAlert, Channel, $filter, $modal, changeSort){
    CigemAlert.clearAlert();
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
      CigemAlert.addError(err.data);
    });

    $scope.deleteDesign = function (id) {
      if (confirm('确认删除？')) {
        Channel.design.delete({id: id}, function(data){
          CigemAlert.addError({
            type: 'success',
            msg: '删除成功'
          });
          $scope.designList = $scope.designList.filter(function (item) {
            return item.id !== id
          })
        }, function(err){
          CigemAlert.addError(err.data);
        });
      }
    }

    $scope.searchDesign = function () {
      CigemAlert.clearAlert();
      var searchKey = ['id', 'product_id']
      var param = cigemUtils.searchCondition(searchKey, $scope.search);
      $location.search(param);
      getDesign(param, function(data, total){
        $scope.designList = data.list;
        $scope.bigTotalItems = total;
      }, function(err){
        CigemAlert.addError(err.data);
      });
    }

    $scope.pageChanged = function () {
      $location.search('page', $scope.bigCurrentPage);
      getDesign($location.search(), function (data, total) {
        $scope.designList = data.list;
        $scope.bigTotalItems = total;
      }, function (err) {
        CigemAlert.addError(err.data);
      });
    }


    $scope.addProduct = function(obj) {
      $scope.modalType = 'design'
      if (obj){
        obj.image_url_mini = obj.image_url
        $scope.isEdit = true
      }
      $scope.products = obj ? [obj] : [];
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

channelController.controller('addProductController', ['$scope', '$modalInstance', 'CigemAlert', 'Channel', 'Content', '$filter', '$stateParams', '$upload', '$timeout',
  function ($scope, $modalInstance, CigemAlert, Channel, Content, $filter, $stateParams, $upload, $timeout){
    CigemAlert.clearAlert();
    $scope[$scope.modalType] = {}
    $scope.page = 1
    $scope.seriesPage = 1
    $scope.uniquePage = 1
    $scope.addProducts = []

    if(!$scope.isEdit) {
      getProducts({page: $scope.page, seriesPage: $scope.seriesPage, uniquePage: $scope.uniquePage, type: $scope.modalType}, function(data, total){
        if ($scope.modalType === 'recommend') {
          $scope.seriesList = data.seriesList;
          $scope.uniqueList = data.uniqueList;
          $scope.seriesPage = $scope.seriesPage + 1
          $scope.uniquePage = $scope.uniquePage + 1
        } else {
          $scope.products = data.list;
          $scope.page = $scope.page + 1
        }
      }, function(err){
        CigemAlert.addError(err.data);
      });
    }

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

    $scope.submit = function () {
      if ($scope.isEdit) {
        var data = {
          id: $scope.products[0].id,
          name: $scope.products[0].name,
          image_url: $scope.products[0].image_url,
        }
        Channel[$scope.modalType].update(data, function(data){
          CigemAlert.addError({
            type: 'success',
            msg: '修改成功'
          });
          $modalInstance.dismiss('cancel');
        }, function(err){
          CigemAlert.addError(err.data);
        });
      } else {
        var list
        if ($scope.modalType !== 'recommend') {
          list = $scope.products.filter(function (item) { return item.checked})
          list = list.map(function (item, index) {
            return {product_id: item.id, sort:   $scope[$scope.modalType + 'List'][0].sort + 1}
          })
        } else if ($scope.modalType == 'recommend') {
          var seriesList = $scope.seriesList.filter(function (item) { return item.checked})
          var uniqueList = $scope.uniqueList.filter(function (item) { return item.checked})
          seriesList = seriesList.map(function (item, index) {
            var newItem = {}
            newItem.sort = $scope.recommends[0].sort + 1
            newItem.name = item.name
            newItem.product_id = item.id
            newItem.image_url = item.image_url_mini
            newItem.type = 'series'
            return newItem
          })
          uniqueList = uniqueList.map(function (item, index) {
            var newItem = {}
            newItem.sort = $scope.recommends[0].sort + 1
            newItem.name = item.name
            newItem.product_id = item.id
            newItem.image_url = item.image_url_mini
            newItem.type = 'unique'
            return newItem
          })
          list = seriesList.concat(uniqueList)
        }
        Channel[$scope.modalType].create({list: list}, function(data){
          $modalInstance.dismiss('cancel');
          CigemAlert.addError({
            type: 'success',
            msg: '发布成功'
          });
          //$timeout(function () {
          //  location.reload()
          //}, 500)
        }, function(err){
          CigemAlert.addError(err.data);
        });
      }
    };
    $scope.close = function () {
      $modalInstance.dismiss('cancel');
    };

    $scope.selectProduction = function (product) {
      if($scope.addProducts.indexOf(product.id) > -1) {
        var index = $scope.addProducts.indexOf(product.id)
        $scope.addProducts.splice(index, 1)
        product.checked = false
      } else {
        $scope.addProducts.push(product.id)
        product.checked = true
      }
    }


    $scope.onFileUpload = function ($files, product) {
      $scope.upload = $upload.upload({
        url: '/api/upload',
        file: $files
      }).success(function(data, status, headers, config) {
        CigemAlert.addError({
          type: 'success',
          msg: '上传成功'
        });
        if ($scope.isEdit) {
          product.image_url = data.image_url
        }
        product.image_url_mini = data.image_url
      }).error(function(data){
        CigemAlert.addError({
          type: 'danger',
          msg: '上传失败'
        });
      });
    };

    $scope.$watch('isBottom', function (value) {
      if (value) {
        getProducts({page: $scope.page, seriesPage: $scope.seriesPage, uniquePage: $scope.uniquePage, type: $scope.modalType}, function(data, total){
          if ($scope.modalType === 'recommend') {
            $scope.seriesList = $scope.seriesList.concat(data.seriesList);
            $scope.uniqueList =  $scope.uniqueList.concat(data.uniqueList);
            $scope.seriesPage = $scope.seriesPage + 1
            $scope.uniquePage = $scope.uniquePage + 1
          } else {
            $scope.products = $scope.products.concat(data.list);
            $scope.page = $scope.page + 1
          }
        }, function(err){
          CigemAlert.addError(err.data);
        });
      }
    })

}]);




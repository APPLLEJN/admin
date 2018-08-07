'use strict';
var contentController = angular.module('contentController',['ui.bootstrap']);

contentController.directive('deseditable', function() {
    return {
        restrict: 'A' ,
        require: 'ngModel',
        link: function(scope, element, attrs, ctrl) {
            // 创建编辑器
            var editor = scope.editor = new wangEditor('content-editor-trigger');
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
                'indent'
            ];
            editor.config.uploadImgUrl = '/api/upload';
            editor.config.uploadImgFns.onload = function (resultText, xhr) {
                // 上传图片时，已经将图片的名字存在 editor.uploadImgOriginalName
                var originalName = editor.uploadImgOriginalName || '';
                // 如果 resultText 是图片的url地址，可以这样插入图片：
                editor.command(null, 'insertHtml', '<img src="http://admin.cigem.com.cn' +  JSON.parse(resultText).image_url + '" alt="' + originalName + '" style="max-width:100%;"/>');
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
            $scope.series.image_url_mini = data.image_url
        } else {
            $scope.series.image_url = data.image_url
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

contentController.controller('seriesDetailAllController',['$scope', '$location', '$stateParams', '$window', 'CigemAlert', 'Content', '$filter', 'handleSort',
    function($scope, $location, $stateParams, $window, CigemAlert, Content, $filter, handleSort){
        CigemAlert.clearAlert();

        /* init */
        var search = $location.search();
        $scope.search = {},
        $scope.maxSize = 5,
        $scope.bigCurrentPage = search.page;
        search.isAll = true
        search.id = $stateParams.id
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
            var before = $scope.seriesList[index-1]
            var after = $scope.seriesList[index+1]
            var current = $scope.seriesList[index]
            if(type === 'up') {
                Content[current.type].update({id: id, sort: before.sort}, function(data){
                    Content[before.type].update({id: before.id, sort: sort}, function (data) {
                        current.sort = before.sort
                        before.sort = sort
                        $scope.seriesList[index-1] = current
                        $scope.seriesList[index] = before
                    })
                }, function(err){
                    CigemAlert.addError(err.data);
                });
            } else {
                Content[current.type].update({id: id, sort: after.sort}, function(data){
                    Content[after.type].update({id: after.id, sort: sort}, function (data) {
                        current.sort = after.sort
                        after.sort = sort
                        $scope.seriesList[index+1] = current
                        $scope.seriesList[index] = after
                    })
                }, function(err){
                    CigemAlert.addError(err.data);
                });
            }
        }
    }]);

contentController.controller('childSeriesController',['$scope', '$location', '$stateParams', '$window', 'CigemAlert', 'Content', '$filter', 'handleSort',
    function($scope, $location, $stateParams, $window, CigemAlert, Content, $filter, handleSort){
        CigemAlert.clearAlert();

        /* init */
        var search = $location.search();
        $scope.search = {},
        $scope.maxSize = 5,
        $scope.bigCurrentPage = search.page;
        search.parent_id = $scope.series_id = $stateParams.id;

        function getSeries(param, success, error){
            NProgress.start();
            Content.child_series.get(param, function(data, getResponseHeaders){
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
                Content.child_series.delete({id: id}, function(data){
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
            param.parent_id = $scope.series_id
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
            var param = $location.search()
            param.parent_id = $scope.series_id
            getSeries(param, function (data, total) {
                $scope.seriesList = data.list;
                $scope.bigTotalItems = total;
            }, function (err) {
                CigemAlert.addError(err.data);
            });
        }

        $scope.handleSort = function(type, id, sort, index) {
            handleSort($scope, type, id, sort, index, 'seriesList', 'child_series')
        }
    }]);

contentController.controller('childSeriesDetailController', ['$scope', '$location', '$stateParams', '$upload', 'CigemAlert', 'Content', '$filter', '$modal',
    function ($scope, $location, $stateParams, $upload, CigemAlert, Content, $filter, $modal) {
        CigemAlert.clearAlert();

        /* init */
        var search = $location.search();
        var series_id = $stateParams.id;
        search.parent_id = $scope.parent_id = $stateParams.sid;
        /* parameter */
        $scope.isEdit = series_id !== 'new';
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
        ];
        if ($scope.isEdit) {
            Content.child_series.get({id: series_id}, function (data) {
                $scope.series = data;
                $scope.editor.$txt.html(data.description);
                $scope.series.image_url = data.image_url ? data.image_url.split(',').map(function (item) {
                    return {image_url: item}
                }) : []
                NProgress.done();
            }, function (err) {
                NProgress.done();
                CigemAlert.addError(err.data);
            });
        } else {
            $scope.series = {}
            $scope.series.image_url = []
        }

        $scope.updateContent = function () {
            if($scope.series.image_url.length) {
                $scope.series.image_url = $scope.series.image_url.map(function (item) {
                    return item.image_url
                }).join(',')
            } else {
                $scope.series.image_url = ''
            }
            if (!$scope.series.wearing_method) delete $scope.series.wearing_method
            $scope.series.parent_id = $scope.parent_id
            $scope.series.unit = $scope.series.unit || '件'
            if ($scope.isEdit) {
                delete $scope.series.create_time
                delete $scope.series.update_time
                Content.child_series.update($scope.series, function (data) {
                    NProgress.done();
                    CigemAlert.addError({
                        type: 'success',
                        msg: '修改成功'
                    });
                    location.href = '#/series/'+$scope.parent_id+'/child';
                }, function (err) {
                    NProgress.done();
                    CigemAlert.addError(err.data);
                });
            } else {
                Content.child_series.create($scope.series, function (data) {
                    NProgress.done();
                    CigemAlert.addError({
                        type: 'success',
                        msg: '创建成功'
                    });
                    location.href = '#/series/'+$scope.parent_id+'/child';
                }, function (err) {
                    NProgress.done();
                    CigemAlert.addError(err.data);
                });
            }
        }

        $scope.onFileUpload = function ($files, type, index) {
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
                    $scope.series.image_url_mini = data.image_url
                } else if (type === 'banner'){
                    $scope.series.image_url[index].image_url = data.image_url
                } else {
                    $scope.series.image_url = data.image_url
                }
            }).error(function(data){
                CigemAlert.addError({
                    type: 'danger',
                    msg: '上传失败'
                });
            });
        };

        $scope.addImage = function () {
            $scope.series.image_url.push({image_url: ''})
        }

        $scope.deleteImage = function (index) {
            $scope.series.image_url.splice(index, 1)
        }
    }
]);

contentController.controller('childSeriesProductionController',['$scope', '$location', '$stateParams', '$window', 'CigemAlert', 'Content', '$filter', 'handleSort',
    function($scope, $location, $stateParams, $window, CigemAlert, Content, $filter, handleSort){
        CigemAlert.clearAlert();

        /* init */
        var search = $location.search();
        $scope.search = {},
        $scope.maxSize = 5,
        $scope.bigCurrentPage = search.page;
        search.parent_id = $stateParams.id;

        function getSeries(param, success, error){
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

        getSeries(search, function(data, total){
            $scope.seriesList = data.list || [];
            $scope.bigTotalItems = total;
        }, function(err){
            CigemAlert.addError(err.data);
        });

        $scope.deleteSeries = function (id) {
            if (confirm('确认删除？')) {
                Content.child_series.delete({id: id}, function(data){
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
            param.parent_id = $scope.series_id
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
            var param = $location.search()
            param.parent_id = $scope.series_id
            getSeries(param, function (data, total) {
                $scope.seriesList = data.list;
                $scope.bigTotalItems = total;
            }, function (err) {
                CigemAlert.addError(err.data);
            });
        }

        $scope.handleSort = function(type, id, sort, index) {
            handleSort($scope, type, id, sort, index, 'seriesList', 'products')
        }
    }]);

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
    ];

    /* common function */
    productInit();

    function productInit() {
      Content.series.get({}, function (data) {
        $scope.series = data.list
        if (!$scope.product) getProductInfo()
      })
      Content.classifies.get({}, function (data) {
        $scope.classifies = data.list
        if (!$scope.product) getProductInfo()
      })
      Content.child_series.get({}, function (data) {
        $scope.child_series = data.list
        if (!$scope.product) getProductInfo()
      })
    }

    function getProductInfo() {
        if ($scope.isEdit) {
            Content.products.get({id: product_id}, function (data) {
                console.log($scope.editor)
                $scope.product = data;
                $scope.editor.$txt.html(data.description);
                $scope.product.seriesType = data.series ? 0 : 1
                $scope.product.image_url = data.image_url ? data.image_url.split(',').map(function (item) {
                    return {image_url: item}
                }) : []
                NProgress.done();
            }, function (err) {
                NProgress.done();
                CigemAlert.addError(err.data);
            });
        } else {
            $scope.product = {}
            $scope.product.image_url = []
        }
    }

    $scope.updateContent = function () {
        if($scope.product.image_url.length) {
            $scope.product.image_url = $scope.product.image_url.map(function (item) {
              return item.image_url
            }).join(',')
        } else {
            $scope.product.image_url = ''
        }
        if ($scope.product.seriesType === 1) {
            $scope.product.series = null
        } else {
            $scope.product.parent_id = null
        }
        $scope.product.unit = $scope.product.unit || '件'
        delete $scope.product.seriesType
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
          location.href = '#/products';
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

    $scope.onFileUpload = function ($files, type, index) {
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
        } else if (type === 'banner'){
          $scope.product.image_url[index].image_url = data.image_url
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
    
    $scope.addImage = function () {
        $scope.product.image_url.push({image_url: ''})
    }

    $scope.deleteImage = function (index) {
      $scope.product.image_url.splice(index, 1)
    }
  }
]);

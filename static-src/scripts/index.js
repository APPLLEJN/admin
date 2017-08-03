'use strict';

var cigem = angular.module('cigem', [
    'ui.router',
    'cigemApi',
    'ngCkeditor',
    'ngClipboard',
    'ngCookies',
    'angularFileUpload',
    'panelAlert',
    'mapInfo',
    'ui.select',
    'ngSanitize',
    'filter',
    'contentController',
    'contentServices',
    'orderController',
    'orderServices',
    'channelController',
    'channelServices',
]);

cigem.run(['$rootScope', 'Logout', function ($rootScope, Logout) {
    $rootScope.logout = function () {
        Logout.create({}, function (data) {
            $rootScope.judgeIsAdmin = false;
            location.href = '#/index';
        }, function (err) {
            $rootScope.judgeIsAdmin = false;
            location.href = '#/index';
        });
    }
}]);


cigem.config(function ($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise('index');
    $stateProvider
        .state('index', {
            url: '/index',
            templateUrl: 'login.html',
            controller: 'loginController'
        })
        .state('classifies', {
            url: '/classifies',
            templateUrl: 'scripts/content_manage/view/classifies.html',
            controller: 'classifyController',
        })
        .state('classify/:id', {
          url: '/classify/:id',
          templateUrl: 'scripts/content_manage/view/classify_detail.html',
          controller: 'classifyDetailController',
        })
        .state('series', {
          url: '/series',
          templateUrl: 'scripts/content_manage/view/series.html',
          controller: 'seriesController',
        })
        .state('series/:id', {
          url: '/series/:id',
          templateUrl: 'scripts/content_manage/view/series_detail.html',
          controller: 'seriesDetailController',
        })
        .state('products', {
          url: '/products',
          templateUrl: 'scripts/content_manage/view/products.html',
          controller: 'productsController',
        })
        .state('product/:id', {
          url: '/product/:id',
          templateUrl: 'scripts/content_manage/view/product_detail.html',
          controller: 'productDetailController',
        })
        .state('recommends', {
          url: '/recommends',
          templateUrl: 'scripts/channel_manage/view/recommends.html',
          controller: 'recommendsController',
        })
        .state('unique', {
          url: '/unique',
          templateUrl: 'scripts/channel_manage/view/unique.html',
          controller: 'uniqueController',
        })
        .state('design', {
          url: '/design',
          templateUrl: 'scripts/channel_manage/view/design.html',
          controller: 'designController',
        })
        .state('news', {
          url: '/news',
          templateUrl: 'scripts/channel_manage/view/news.html',
          controller: 'newsController',
        })
        .state('news/:id', {
          url: '/news/:id',
          templateUrl: 'scripts/channel_manage/view/news_detail.html',
          controller: 'newsDetailController',
        })
        .state('order', {
          url: '/order',
          templateUrl: 'scripts/order_manage/view/list.html',
          controller: 'orderListController',
        })
});


cigem.config(['ngClipProvider', function (ngClipProvider) {
    ngClipProvider.setPath("scripts/clip/ZeroClipboard.swf");
}]);


cigem.controller('sideBarController', ['$scope', '$location', '$rootScope', '$window', function ($scope, $location, $rootScope, $window) {
  //var pageWrapper = angular.element( document.querySelector( '#page-wrapper' ) )
  //$window.content = pageWrapper[0]
  //var locationChangeSuccessOff = $rootScope.$on('$locationChangeSuccess', locationChangeSuccess)
  //function locationChangeSuccess(event) {
  //  if(arguments[1] !== arguments[2]){
  //    $window.content.scrollTop = 0;
  //  }
  //}

  //function judePermisson(permisson) {
  //      return $rootScope.userPermisson.indexOf(permisson) > -1;
  //  }

    //$scope.navFilter = function (e) {
    //    var permissons = e.permissons || [];
    //
    //    e.items && e.items.forEach(function (item) {
    //        permissons = permissons.concat(item.permissons);
    //    });
    //
    //    return ($rootScope.userPermisson.indexOf('superman') > -1 && permissons.indexOf('unsuperman') < 0) || permissons.some(judePermisson);
    //}

    $scope.navTabs = [{
          label: ' 分类管理',
          link: 'classifies',
          icon: 'th-list',
          isCollapse: true,
          collapsed: true,
          items: [],
        },{
          label: ' 系列管理',
          link: 'series',
          icon: 'th-list',
          isCollapse: true,
          collapsed: true,
          items: [],
        },{
          label: ' 产品管理',
          link: 'products',
          icon: 'th-list',
          isCollapse: true,
          collapsed: true,
          items: [],

        },{
          label: ' 频道管理',
          icon: 'th-list',
          isCollapse: true,
          collapsed: true,
          items: [{
            label: ' 当季推荐',
            link: 'recommends',
          },{
            label: ' 单品',
            link: 'unique',
          },{
            label: ' 私人定制',
            link: 'design',
          },{
            label: ' 新闻',
            link: 'news',
          }],

        },{
          label: ' 预约管理',
          link: 'order',
          icon: 'user',
          isCollapse: true,
          collapsed: true,
          permissons: [],
          items: []
        }];

    $scope.isActive = function (tab) {
        return $location.path().split('/')[1] === tab.link;
    }

    $scope.isItemActive = function (item) {
        var path = $location.path().split('/');
        if (path.length > 2) {
            return (path[1] + '/' + path[2]) === item.link;
        } else {
            return path[1] === item.link;
        }
    }
}]);


cigem.controller('imgsUploadController', ['$scope', '$modal',
    function ($scope, $modal) {
        $scope.openUpload = function () {
            var modalInstance = $modal.open({
                templateUrl: 'imgUpload.html',
                controller: 'ImageUploadCtrl'
            });
        }
    }
]);


cigem.controller('ImageUploadCtrl', ['$scope', '$modalInstance', '$upload', 'ImageToken', 'PanelAlert',
    function ($scope, $modalInstance, $upload, ImageToken, PanelAlert) {
        var token, uploadUrl,
            imagePerfix = '';

        $scope.btnMessage = '';

        ImageToken.get(function (d) {
            token = d.token;
            uploadUrl = d.upload_url;
            var _domain = d.domain.indexOf('https://') == 0 ? d.domain : 'https://' + d.domain
            imagePerfix += _domain;
        });

        $scope.onFileUpload = function ($files) {
            $scope.lastImgUrl = "正在上传...";

            var file = $files[0];
            $scope.upload = $upload.upload({
                url: uploadUrl,
                data: {
                    token: token
                },
                file: file
            }).success(function (data, status, headers, config) {
                $scope.lastImgUrl = imagePerfix + '/' + data.key;
            }).error(function (data) {

                PanelAlert.addError({
                    type: 'danger',
                    msg: '上传图片失败'
                });
            });

        }

        $scope.closeUpload = function () {
            $modalInstance.dismiss('cancel');
        };

        $scope.changeMessage = function () {
            $scope.btnMessage = '复制成功';
        };
        $scope.fallback = function (copy) {
            window.prompt('系统不支持自动复制，请按 cmd+c 复制', copy);
        }
    }
]);


cigem.controller('loginController', ['$scope', '$rootScope', 'Login', '$cookieStore', function ($scope, $rootScope, Login, $cookieStore) {
    $scope.login = {},
    $scope.isWrong = false;
    $scope.loginPanel = function () {
        $scope.isWrong = false;
        Login.create($scope.login, function (data) {
            $rootScope.judgeIsAdmin = true;
            var expireDate = new Date();
            expireDate.setDate(expireDate.getDate() + 30);
            $cookieStore.put("judgeIsAdmin", 'true', {'expires': expireDate.toUTCString()});
        }, function (err) {
            $rootScope.judgeIsAdmin = false;
            $scope.isWrong = true;
        });
    }
}]);

cigem.controller('bodyController', ['$scope', '$rootScope', '$cookieStore', function ($scope, $rootScope, $cookieStore) {
  $scope.init = function () {
    if ($cookieStore.get("judgeIsAdmin")==='true') {
      $rootScope.judgeIsAdmin = true;
    }
  }
}])








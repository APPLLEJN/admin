'use strict';

var cigem = angular.module('cigem', [
    'ui.router',
    'cigemApi',
    'ngClipboard',
    'ngCookies',
    'angularFileUpload',
    'cigemAlert',
    'mapInfo',
    'ngSanitize',
    'filter',
    'contentController',
    'contentServices',
    'orderController',
    'orderServices',
    'channelController',
    'channelServices',
]);


cigem.run(['$rootScope', '$location', 'Permission', 'Logout', function ($rootScope, $location, Permission, Logout) {
  $rootScope.logout = function () {
    Logout.create({}, function (data) {}, function (err) {});
    $rootScope.judgeIsAdmin = false;
    $location.path('/#/index');
  }
  $rootScope.$on('$stateChangeStart', function () {
    Permission.get({}, function(data) {
      $rootScope.judgeIsAdmin = true;
    }, function(err) {
      $location.path('/#/index');
      $rootScope.judgeIsAdmin = false;
    });
  })
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


cigem.controller('sideBarController', ['$scope', '$location', '$rootScope', '$window', '$cookieStore', function ($scope, $location, $rootScope, $window, $cookieStore) {


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

cigem.controller('loginController', ['$scope', '$rootScope', 'Login', '$cookieStore', function ($scope, $rootScope, Login, $cookieStore) {
    $scope.login = {},
    $scope.isWrong = false;
    $scope.loginPanel = function () {
        $scope.isWrong = false;
        Login.create($scope.login, function (data) {
            $rootScope.judgeIsAdmin = true;
        }, function (err) {
            $rootScope.judgeIsAdmin = false;
            $scope.isWrong = true;
        });
    }
}]);

cigem.controller('bodyController', ['$scope', '$rootScope', '$cookieStore', '$location', function ($scope, $rootScope, $cookieStore, $location) {
  $scope.init = function () {
    console.log('-=-=', '1111')

    //try {
    //  if ($cookieStore.get("userToken")) {
    //    $rootScope.judgeIsAdmin = true;
    //  } else {
    //    $location.path('/index')
    //  }
    //} catch (err) {
    //  console.log(err, 'err')
    //}

  }
}])








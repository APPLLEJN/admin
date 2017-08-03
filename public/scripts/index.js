
'use strict';
var cigemApi = angular.module('cigemApi', ['ngResource']);


cigemApi.factory('Login', ['$resource', function($resource){
  return $resource('/api/login', {}, {
    create: {method: 'POST', isArray: false, transformResponse: function(data){
      return panelUtils.transformResponse(data);
    }}
  });
}]);


cigemApi.factory('Logout', ['$resource', function($resource){
  return $resource('/panel/logout', {}, {
    create: {method: 'POST', isArray: false, transformResponse: function(data){
      return panelUtils.transformResponse(data);
    }}
  });
}]);


cigemApi.factory('ImageToken', ['$resource', function($resource){
	return $resource('/panel/v1/qiniu/config?bucket=public', {}, {
		get: {method: 'GET', isArray: false, transformResponse: function(data){
			return panelUtils.transformResponse(data);
		}}
	});
}]);


cigemApi.factory('VoiceToken', ['$resource', function($resource){
	return $resource('/panel/v1/qiniu/config?bucket=private', {}, {
		get: {method: 'GET', isArray: false, transformResponse: function(data){
			return panelUtils.transformResponse(data);
		}}
	});
}]);





/**
 * Created by jiangnan on 17/4/6.
 */
angular.module('filter', []).filter('propsFilter', function() {
  return function(items, props) {
    var out = [];

    if (angular.isArray(items)) {
      var keys = Object.keys(props);

      items.forEach(function(item) {
        var itemMatches = false;

        for (var i = 0; i < keys.length; i++) {
          var prop = keys[i];
          var text = props[prop].toLowerCase();
          if (item[prop].toString().toLowerCase().indexOf(text) !== -1) {
            itemMatches = true;
            break;
          }
        }

        if (itemMatches) {
          out.push(item);
        }
      });
    } else {
      // Let the output be the input untouched
      out = items;
    }

    return out;
  };
});
/****** map ********/
angular.module('mapInfo', []).factory('MapInfo', function(){

	var mapInfo = [{
	    "province":"北京",
	    "citys": ["北京"]
	},{
		"province": "上海",
		"citys": ["上海"]
	},{
		"province": "广东",
		"citys": ["深圳","广州"]
	},{
		"province": "浙江",
		"citys": ["杭州","宁波"]
	},{
		"province": "四川",
		"citys": ["成都"]
	},{
		"province": "陕西",
		"citys": ["西安"]
	},{
		"province": "湖北",
		"citys": ["武汉"]
	}]

	return mapInfo;
});

/* commonjs package manager support (eg componentjs) */
if (typeof module !== "undefined" && typeof exports !== "undefined" && module.exports === exports){
  module.exports = 'treeControl';
}
(function ( angular ) {
    'use strict';
    angular.module( 'treeControl', [] )
        .constant('treeConfig', {
            templateUrl: null
        })
        .directive( 'treecontrol', ['$compile', function( $compile ) {
            /**
             * @param cssClass - the css class
             * @param addClassProperty - should we wrap the class name with class=""
             */
            
            function ensureDefault(obj, prop, value) {
                if (!obj.hasOwnProperty(prop))
                    obj[prop] = value;
            }
            
            return {
                restrict: 'EA',
                require: "treecontrol",
                transclude: true,
                scope: {
                    treeModel: "=",
                    selectedNode: "=?",
                    selectedNodes: "=?",
                    expandedNodes: "=?",
                    onSelection: "&",
                    onNodeToggle: "&",
                    options: "=?",
                    orderBy: "@",
                    reverseOrder: "@",
                    filterExpression: "=?",
                    filterComparator: "=?"
                },
                controller: ['$scope', '$templateCache', '$interpolate', 'treeConfig', function( $scope, $templateCache, $interpolate, treeConfig ) {

                    function defaultIsLeaf(node) {
                        return node.is_leaf || (node.children && node.children.length === 0);
                    }

                    function shallowCopy(src, dst) {
                        if (angular.isArray(src)) {
                            dst = dst || [];

                            for ( var i = 0; i < src.length; i++) {
                                dst[i] = src[i];
                            }
                        } else if (angular.isObject(src)) {
                            dst = dst || {};

                            for (var key in src) {
                                if (hasOwnProperty.call(src, key) && !(key.charAt(0) === '$' && key.charAt(1) === '$')) {
                                    dst[key] = src[key];
                                }
                            }
                        }
                        return dst || src;
                    }

                    function defaultEquality(a, b) {
                        if (a === undefined || b === undefined)
                            return false;
                        a = shallowCopy(a);
                        a[$scope.options.nodeChildren] = [];
                        b = shallowCopy(b);
                        b[$scope.options.nodeChildren] = [];
                        return angular.equals(a, b);
                    }

                    function defaultIsSelectable() {
                        return true;
                    }

                    $scope.options = $scope.options || {};
                    ensureDefault($scope.options, "multiSelection", false);
                    ensureDefault($scope.options, "nodeChildren", "children");
                    ensureDefault($scope.options, "dirSelectable", true);
                    ensureDefault($scope.options, "equality", defaultEquality);
                    ensureDefault($scope.options, "isLeaf", defaultIsLeaf);
                    ensureDefault($scope.options, "allowDeselect", true);
                    ensureDefault($scope.options, "isSelectable", defaultIsSelectable);
                    ensureDefault($scope.options, "getChildren", function(param, success, error){
                        
                    });

                    $scope.selectedNodes = $scope.selectedNodes || [];
                    $scope.expandedNodes = $scope.expandedNodes || [];
                    $scope.expandedNodesMap = {};
                    for (var i=0; i < $scope.expandedNodes.length; i++) {
                        $scope.expandedNodesMap[""+i] = $scope.expandedNodes[i];
                    }
                    $scope.parentScopeOfTree = $scope.$parent;

                    function isSelectedNode(node) {
                        if (!$scope.options.multiSelection && ($scope.options.equality(node, $scope.selectedNode)))
                            return true;
                        else if ($scope.options.multiSelection && $scope.selectedNodes) {
                            for (var i = 0; (i < $scope.selectedNodes.length); i++) {
                                if ($scope.options.equality(node, $scope.selectedNodes[i])) {
                                    return true;
                                }
                            }
                            return false;
                        }
                    }

                    $scope.headClass = function(node) {
                        if ($scope.options.isLeaf(node))
                            return "tree-leaf";
                        if ($scope.expandedNodesMap[this.$id])
                            return "tree-expanded";
                        else
                            return "tree-collapsed";
                    };

                    $scope.nodeExpanded = function() {
                        return !!$scope.expandedNodesMap[this.$id];
                    };

                    $scope.selectNodeHead = function(selectedNode) {
                        var transcludedScope = this;
                        var expanding = $scope.expandedNodesMap[transcludedScope.$id] === undefined;
                        if (expanding) {
                            $scope.options.getChildren({id: selectedNode.id}, function(data){
                                selectedNode.children = data;
                                $scope.expandedNodesMap[transcludedScope.$id] = (expanding ? transcludedScope.node : undefined);
                                $scope.expandedNodes.push(transcludedScope.node);
                            }, function(err){

                            });
                        }else{
                            var index;
                            for (var i=0; (i < $scope.expandedNodes.length) && !index; i++) {
                                if ($scope.options.equality($scope.expandedNodes[i], transcludedScope.node)) {
                                    index = i;
                                }
                            }
                            if (index !== undefined)
                                $scope.expandedNodes.splice(index, 1);
                        }
                        if ($scope.onNodeToggle) {
                            var parentNode = (transcludedScope.$parent.node === transcludedScope.synteticRoot)?null:transcludedScope.$parent.node;
                            $scope.onNodeToggle({node: transcludedScope.node, $parentNode: parentNode,
                            $index: transcludedScope.$index, $first: transcludedScope.$first, $middle: transcludedScope.$middle,
                            $last: transcludedScope.$last, $odd: transcludedScope.$odd, $even: transcludedScope.$even, expanded: expanding});
                        };
                    };

                    $scope.selectNodeLabel = function(selectedNode){
                        var transcludedScope = this;
                        if(!$scope.options.isLeaf(selectedNode) && (!$scope.options.dirSelectable || !$scope.options.isSelectable(selectedNode))) {
                            // Branch node is not selectable, expand
                            this.selectNodeHead(selectedNode);
                        }
                        else if($scope.options.isLeaf(selectedNode) && (!$scope.options.isSelectable(selectedNode))) {
                            // Leaf node is not selectable
                            return;
                        }
                        else {
                            var selected = false;
                            if ($scope.options.multiSelection) {
                                var pos = -1;
                                for (var i=0; i < $scope.selectedNodes.length; i++) {
                                    if($scope.options.equality(selectedNode, $scope.selectedNodes[i])) {
                                        pos = i;
                                        break;
                                    }
                                }
                                if (pos === -1) {
                                    $scope.selectedNodes.push(selectedNode);
                                    selected = true;
                                } else {
                                    $scope.selectedNodes.splice(pos, 1);
                                }
                            } else {
                                if (!$scope.options.equality(selectedNode, $scope.selectedNode)) {
                                    $scope.selectedNode = selectedNode;
                                    selected = true;
                                }
                                else {
                                    if ($scope.options.allowDeselect) {
                                        $scope.selectedNode = undefined;
                                    } else {
                                        $scope.selectedNode = selectedNode;
                                        selected = true;
                                    }
                                }
                            }
                            if ($scope.onSelection) {
                                var parentNode = (transcludedScope.$parent.node === transcludedScope.synteticRoot)?null:transcludedScope.$parent.node;
                                $scope.onSelection({node: selectedNode, selected: selected, $parentNode: parentNode,
                                  $index: transcludedScope.$index, $first: transcludedScope.$first, $middle: transcludedScope.$middle,
                                  $last: transcludedScope.$last, $odd: transcludedScope.$odd, $even: transcludedScope.$even});
                            }
                        }
                    };

                    $scope.selectedClass = function() {
                        var isThisNodeSelected = isSelectedNode(this.node);
                        if (isThisNodeSelected) {
                            this.node.operational = true;
                            return "tree-selected";
                        }else{
                            this.node.operational = false;
                            return "";
                        };
                    };

                    $scope.unselectableClass = function() {
                        var isThisNodeUnselectable = !$scope.options.isSelectable(this.node);
                        return isThisNodeUnselectable ? "tree-unselectable " : "";
                    };

                    //tree template
                    $scope.isReverse = function() {
                      return !($scope.reverseOrder === 'false' || $scope.reverseOrder === 'False' || $scope.reverseOrder === '' || $scope.reverseOrder === false);
                    };

                    $scope.orderByFunc = function() {
                      return "'" + $scope.orderBy + "'";
                    };

                    var templateOptions = {
                        orderBy: $scope.orderBy ? " | orderBy:orderByFunc():isReverse()" : '',
                        nodeChildren:  $scope.options.nodeChildren
                    };

                    var template;
                    var templateUrl = $scope.options.templateUrl || treeConfig.templateUrl;

                    if(templateUrl) {
                        template = $templateCache.get(templateUrl);
                    }

                    if(!template) {
                        template =
                            '<ul>' +
                            '<li ng-if="!node.is_delete" ng-repeat="node in node.{{options.nodeChildren}} | filter:filterExpression:filterComparator {{options.orderBy}}" ng-class="headClass(node)"' +
                            'set-node-to-data>' +
                            '<span class="tree-branch-head" ng-click="selectNodeHead(node)"></span>' +
                            '<span class="tree-leaf-head"></span>' +
                            '<div id="{{node.id}}" class="tree-label" ng-class="[selectedClass(), unselectableClass()]" ng-click="selectNodeLabel(node)" tree-transclude></div>' +
                            '<treeitem ng-if="nodeExpanded()"></treeitem>' +
                            '</li>' +
                            '</ul>';
                    }

                    this.template = $compile($interpolate(template)({options: templateOptions}));
                }],
                compile: function(element, attrs, childTranscludeFn) {
                    return function ( scope, element, attrs, treemodelCntr ) {
                        scope.$watch("treeModel", function updateNodeOnRootScope(newValue) {
                            if (angular.isArray(newValue)) {
                                if (angular.isDefined(scope.node) && angular.equals(scope.node[scope.options.nodeChildren], newValue))
                                    return;
                                scope.node = {};
                                scope.synteticRoot = scope.node;
                                scope.node[scope.options.nodeChildren] = newValue;
                            }
                            else {
                                if (angular.equals(scope.node, newValue))
                                    return;
                                scope.node = newValue;
                            }
                        });

                        scope.$watchCollection('expandedNodes', function(newValue, oldValue) {
                            var notFoundIds = 0;
                            var newExpandedNodesMap = {};
                            var $liElements = element.find('li');
                            var existingScopes = [];
                            // find all nodes visible on the tree and the scope $id of the scopes including them
                            angular.forEach($liElements, function(liElement) {
                                var $liElement = angular.element(liElement);
                                var liScope = {
                                    $id: $liElement.data('scope-id'),
                                    node: $liElement.data('node')
                                };
                                existingScopes.push(liScope);
                            });
                            // iterate over the newValue, the new expanded nodes, and for each find it in the existingNodesAndScopes
                            // if found, add the mapping $id -> node into newExpandedNodesMap
                            // if not found, add the mapping num -> node into newExpandedNodesMap
                            angular.forEach(newValue, function(newExNode) {
                                var found = false;
                                for (var i=0; (i < existingScopes.length) && !found; i++) {
                                    var existingScope = existingScopes[i];
                                    if (scope.options.equality(newExNode, existingScope.node)) {
                                        newExpandedNodesMap[existingScope.$id] = existingScope.node;
                                        found = true;
                                    }
                                }
                                if (!found)
                                    newExpandedNodesMap[notFoundIds++] = newExNode;
                            });
                            scope.expandedNodesMap = newExpandedNodesMap;
                        });

                        //Rendering template for a root node
                        treemodelCntr.template( scope, function(clone) {
                            element.html('').append( clone );
                        });
                        // save the transclude function from compile (which is not bound to a scope as apposed to the one from link)
                        // we can fix this to work with the link transclude function with angular 1.2.6. as for angular 1.2.0 we need
                        // to keep using the compile function
                        scope.$treeTransclude = childTranscludeFn;
                    };
                }
            };
        }])
        .directive("setNodeToData", ['$parse', function($parse) {
            return {
                restrict: 'A',
                link: function($scope, $element, $attrs) {
                    $element.data('node', $scope.node);
                    $element.data('scope-id', $scope.$id);
                }
            };
        }])
        .directive("treeitem", function() {
            return {
                restrict: 'E',
                require: "^treecontrol",
                link: function( scope, element, attrs, treemodelCntr) {
                    // Rendering template for the current node
                    treemodelCntr.template(scope, function(clone) {
                        element.html('').append(clone);
                    });
                }
            };
        })
        .directive("treeTransclude", function() {
            return {
                link: function(scope, element, attrs, controller) {
                    if (!scope.options.isLeaf(scope.node)) {
                        angular.forEach(scope.expandedNodesMap, function (node, id) {
                            if (scope.options.equality(node, scope.node)) {
                                scope.expandedNodesMap[scope.$id] = scope.node;
                                scope.expandedNodesMap[id] = undefined;
                            }
                        });
                    }
                    if (!scope.options.multiSelection && scope.options.equality(scope.node, scope.selectedNode)) {
                        scope.selectedNode = scope.node;
                    } else if (scope.options.multiSelection) {
                        var newSelectedNodes = [];
                        for (var i = 0; (i < scope.selectedNodes.length); i++) {
                            if (scope.options.equality(scope.node, scope.selectedNodes[i])) {
                                newSelectedNodes.push(scope.node);
                            }
                        }
                        scope.selectedNodes = newSelectedNodes;
                    }

                    // create a scope for the transclusion, whos parent is the parent of the tree control
                    scope.transcludeScope = scope.parentScopeOfTree.$new();
                    scope.transcludeScope.node = scope.node;
                    scope.transcludeScope.$parentNode = (scope.$parent.node === scope.synteticRoot)?null:scope.$parent.node;
                    scope.transcludeScope.$index = scope.$index;
                    scope.transcludeScope.$first = scope.$first;
                    scope.transcludeScope.$middle = scope.$middle;
                    scope.transcludeScope.$last = scope.$last;
                    scope.transcludeScope.$odd = scope.$odd;
                    scope.transcludeScope.$even = scope.$even;
                    scope.$on('$destroy', function() {
                        scope.transcludeScope.$destroy();
                    });

                    scope.$treeTransclude(scope.transcludeScope, function(clone) {
                        element.empty();
                        element.append(clone);
                    });
                }
            };
        });
})( angular );
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

'use strict';
var panelUtils = {
    transformResponse: function (data) {
        var data;
        try {
            data = JSON.parse(data.substring(16));
        } catch (e) {
            data = JSON.parse(data);
        }

        return data;
    },
    judgeAdminPermission: function (status) {
        if (status === 403) {
            location.href = '#/';
        }
    },
    filterSelect: function (arr, key, value) {
        try {
            if (Object.prototype.toString.call(arr) !== "[object Array]") {
                throw new TypeError('first param must be array');
            }
            var filterArrByCondition = arr.filter(function (item) {
                return item[key] === value
            })
            return filterArrByCondition.map(function (item) {
                return item.value || item
            })
        } catch (err) {
            console.log(err)
        }
    },
    /**
     *
     * @param {[]} searchCondition 需要搜索的字段
     * @param scopeData 搜索的数据对象，如：{nickname:'ygz'}
     * @returns {{}}
     */
    searchCondition: function (searchCondition, scopeData) {
        var param = {};
        if (arguments.length === 1) {
            var searchData = arguments[0];
            for (var key in searchData) {
                if (searchData.hasOwnProperty(key)
                    && (searchData[key] || +searchData[key] !== 0 )) {
                    param[key] = dataTransform(searchData[key]);
                }
            }
            return param;
        } else {
            searchCondition.map(function (item) {
                if (scopeData[item]) param[item] = scopeData[item];
            });
            return param
        }

        function dataTransform(data) {
            if (data instanceof Date) {
                return data.toLocaleDateString().replace(/\//g, '-');
            } else
                return data;
        }
    },
    isEmptyObject: function (e) {
        var t;
        for (t in e)
            return !1;
        return !0
    }
}

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




/* speech services */
var channelServices = angular.module('channelServices', ['ngResource']);
channelServices.factory('Channel', ['$resource', function($resource){
  return{
    news : $resource('/api/news/:id', {id: '@id'}, {
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
    recommend : $resource('/api/recommends/:id', {id: '@id'}, {
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
    unique : $resource('/api/unique/:id', {id: '@id'}, {
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
    design : $resource('/api/design/:id', {id: '@id'}, {
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

/* speech services */
var contentServices = angular.module('contentServices', ['ngResource']);
contentServices.factory('Content', ['$resource', function($resource){
  return{
    classifies : $resource('/api/classifies/:id', {id: '@id'}, {
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
    series : $resource('/api/series/:id', {id: '@id'}, {
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
    products : $resource('/api/products/:id', {id: '@id'}, {
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
'use strict';
var orderController = angular.module('orderController',['ui.bootstrap']);

orderController.controller('orderListController',['$scope', '$location', '$stateParams', 'PanelAlert', 'Order', '$modal', '$filter',
	function($scope, $location, $stateParams, PanelAlert, Order, $modal, $filter){
		PanelAlert.clearAlert();

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
      PanelAlert.addError(err.data);
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
          PanelAlert.addError({
            type: 'success',
            msg: '删除成功'
          });
          $scope.orders = $scope.orders.filter(function (item) {
            return item.id !== id
          })
        }, function(err){
          PanelAlert.addError(err.data);
        });
      }
    }
    
    $scope.searchOrders = function () {
      PanelAlert.clearAlert();
      var searchKey = ['username', 'phone']
      var param = panelUtils.searchCondition(searchKey, $scope.search);
      if($scope.search.date) {
        param.date = $filter('date')($scope.search.date, 'yyyy-MM-dd');
      }
      $location.search(param);
      getOrders(param, function(data, total){
        $scope.orders = data.list;
        $scope.bigTotalItems = total;
        console.log(total)
      }, function(err){
        PanelAlert.addError(err.data);
      });
    }

    $scope.pageChanged = function () {
      $location.search('page', $scope.bigCurrentPage);
      getOrders($location.search(), function (data, total) {
        $scope.orders = data.list;
        $scope.bigTotalItems = total;
        console.log(total)

      }, function (err) {
        PanelAlert.addError(err.data);
      });
    }

}]);

orderController.controller('createOrderTimeController', ['$scope', '$modalInstance', 'PanelAlert', 'Order',  '$filter', '$stateParams',
  function ($scope, $modalInstance, PanelAlert, Order, $filter, $stateParams){
    PanelAlert.clearAlert();
    $scope.order = $scope.orderEdit || {}
    if ($scope.order.time_type){
      $scope.order.onetime = $scope.order.time_type.indexOf(1)>-1
      $scope.order.twotime = $scope.order.time_type.indexOf(2)>-1
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
      var param={
        username: 'admin',
        date:  $filter('date')($scope.order.date, 'yyyy-MM-dd'),
        time_type: time_type,
      }
      
      if ($scope.order.id) {
        param.id = $scope.order.id
        Order.order.update(param, function(data){
          PanelAlert.addError({
            type: 'success',
            msg: '修改成功'
          });
          $scope.$parent.orders = $scope.$parent.orders.map(function (item) {
            if(item.id == param.id){
              item = param
            }
            return item
          })
          console.log($scope.orders, '$scope.orders')
          $modalInstance.dismiss('cancel');
        }, function(err){
          PanelAlert.addError(err.data);
        });
      } else {
        Order.order.create(param, function(data){
          PanelAlert.addError({
            type: 'success',
            msg: '发布成功'
          });
          $scope.orders.unshift(param)
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








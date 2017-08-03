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

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

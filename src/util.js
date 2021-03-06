/**
 * @file
 * webapp通用组件基础库文件
 * util -   工具函数部分
 * @author oupeng-fe
 * @version 1.1
 */
;(function(o, undefined) {

    "use strict";

    /**
     * 避免未声明 octopus.util
     */
    var util = o.util = o.util || {};

    /**
     * @const octopus.util.LEFT {String} "left"
     * @const octopus.util.RIGHT {String} "right"
     * @const octopus.util.UP {String} "up"
     * @const octopus.util.DOWN {String} "down"
     */
    util.LEFT = "left";
    util.RIGHT = "right";
    util.UP = "up";
    util.DOWN = "down";

    /**
     * @method octopus.util.getCenter
     * @param touches {Array}
     * @return {object}
     * @desc 获得所有触摸点的中心
     */
    util.getCenter = function(touches) {
        var valuesX = [], valuesY = [];

        for(var t= 0,len=touches.length; t<len; t++) {
            valuesX.push(touches[t].pageX);
            valuesY.push(touches[t].pageY);
        }

        return {
            pageX: ((Math.min.apply(Math, valuesX) + Math.max.apply(Math, valuesX)) / 2),
            pageY: ((Math.min.apply(Math, valuesY) + Math.max.apply(Math, valuesY)) / 2)
        };
    };

    /**
     * @method octopus.util.getVelocity
     * @desc 获得两点间瞬移速度
     * @param delta_time {Number}
     * @param delta_x {Number}
     * @param delta_y {Number}
     * @return {object} x为横向速度 y为纵向速度
     */
    util.getVelocity = function(delta_time, delta_x, delta_y) {
        return {
            x: Math.abs(delta_x / delta_time) || 0,
            y: Math.abs(delta_y / delta_time) || 0
        };

    };

    /**
     * @method octopus.util.getAngle
     * @desc 获得两点间角度
     * @param touch1 {Object}
     * @param touch2 {Object}
     * @return {Number}
     */
    util.getAngle = function(touch1, touch2) {
        var y = touch2.pageY - touch1.pageY,
            x = touch2.pageX - touch1.pageX;
        return Math.atan2(y, x) * 180 / Math.PI;
    };

    /**
     * @method octopus.util.getDirection
     * @desc 获得触碰滑动方向
     * @param touch1 {Object}
     * @param touch2 {Object}
     * @return {string}
     */
    util.getDirection = function(touch1, touch2) {
        var x = Math.abs(touch1.pageX - touch2.pageX),
            y = Math.abs(touch1.pageY - touch2.pageY);

        if(x >= y) {
            return touch1.pageX - touch2.pageX > 0 ? util.LEFT : util.RIGHT;
        }
        else {
            return touch1.pageY - touch2.pageY > 0 ? util.UP : util.DOWN;
        }
    };

    /**
     * @method octopus.util.getDistance
     * @desc 获得两点间距离
     * @param touch1 {Object}
     * @param touch2 {Object}
     * @return {Number}
     */
    util.getDistance = function(touch1, touch2) {
        var x = touch2.pageX - touch1.pageX,
            y = touch2.pageY - touch1.pageY;
        return Math.sqrt((x * x) + (y * y));
    };

    /**
     * @method octopus.util.getScale
     * @desc 获得两触摸点滑动后得到的两触摸点之于之前的放大倍数
     * @param start {Array}
     * @param end {Array}
     * @return {Number}
     */
    util.getScale = function(start, end) {
        if(start.length >= 2 && end.length >= 2) {
            return this.getDistance(end[0], end[1]) /
                this.getDistance(start[0], start[1]);
        }
        return 1;
    };

    /**
     * @method octopus.util.getRotation
     * @desc 获得两触摸点滑动后得到的两触摸点之于之前的旋转度数
     * @param start {Array}
     * @param end {Array}
     * @return {Number}
     */
    util.getRotation = function(start, end) {
        if(start.length >= 2 && end.length >= 2) {
            return this.getAngle(end[1], end[0]) -
                this.getAngle(start[1], start[0]);
        }
        return 0;
    };

    /**
     * @method octopus.util.encodeHtml
     * @desc 对字符串中的特殊字符进行html编码
     * @param str {String}
     */
    util.encodeHtml = function(str) {
        return String(str)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    };

    /**
     * @method octopus.util.decodeHtml
     * @desc 对字符串中的html进行编码
     * @param str {String}
     */
    util.htmlDecodeDict = {"quot": '"', "lt": "<", "gt": ">", "amp": "&", "#39": "'"};
    util.decodeHtml = function(str) {
        return String(str).replace(/&(quot|lt|gt|amp|#39);/ig, function(all, key) {
            return util.htmlDecodeDict[key];
        }).replace(/&#u([a-f\d]{4});/ig, function(all, hex) {
                return String.fromCharCode(parseInt("0x" + hex));
            }).replace(/&#(\d+);/ig, function(all, number) {
                return String.fromCharCode(+number);
            });
    };

    /**
     * @method octopus.util.loadImage
     * @desc 加载图片方法
     * @param url {String} 图片url
     * @param ready {Function} 此时图片没有加载完 但是宽高已知
     * @param load {Function} 图片onload的callback
     * @param error {Function} 图片加载失败的callback
     */
    util.loadImage = (function() {
        var list = [],
            intervalId = null,
        //用来执行队列
            tick = function() {
                var i = 0;
                for (; i < list.length; i++) {
                    list[i].end ? list.splice(i--, 1) : list[i]();
                };
                !list.length && stop();
            },
        // 停止所有定时器队列
            stop = function () {
                clearInterval(intervalId);
                intervalId = null;
            };
        return function (url, ready, load, error) {
            var onready, width, height, newWidth, newHeight,
                img = new Image();
            img.src = url;
            // 如果图片被缓存，则直接返回缓存数据
            if (img.complete) {
                ready.call(img);
                load && load.call(img);
                return;
            };
            width = img.width;
            height = img.height;
            // 加载错误后的事件
            img.onerror = function () {
                error && error.call(img);
                onready.end = true;
                img = img.onload = img.onerror = null;
            };
            // 图片尺寸就绪
            onready = function () {
                newWidth = img.width;
                newHeight = img.height;
                if (newWidth !== width || newHeight !== height || newWidth * newHeight > 1024) {
                    ready.call(img);
                    onready.end = true;
                };
            };
            onready();
            // 完全加载完毕的事件
            img.onload = function () {
                // onload在定时器时间差范围内可能比onready快
                // 这里进行检查并保证onready优先执行
                !onready.end && onready();
                load && load.call(img);
                // IE gif动画会循环执行onload，置空onload即可
                img = img.onload = img.onerror = null;
            };
            // 加入队列中定期执行
            if(!onready.end) {
                list.push(onready);
                // 无论何时只允许出现一个定时器，减少浏览器性能损耗
                if (intervalId === null) intervalId = setInterval(tick, 40);
            };
        };
    })();

    /**
     * @method octopus.util.empty
     * @desc 空函数
     */
    util.empty = function() {};

    /**
     * @method octopus.util.bind
     * @desc 换作用域
     * @param func {Function}
     * @param object {Object}
     */
    util.bind = function(func, object) {
        // create a reference to all arguments past the second one
        var args = Array.prototype.slice.apply(arguments, [2]);
        return function() {
            // Push on any additional arguments from the actual function call.
            // These will come after those sent to the bind call.
            var newArgs = args.concat(
                Array.prototype.slice.apply(arguments, [0])
            );
            return func.apply(object, newArgs);
        };
    };

    /**
     * @method octopus.util.bindAsEventListener
     * @param func {Function} 作为事件监听的函数
     * @param object {Object} 作用域
     */
    util.bindAsEventListener = function(func, object) {
        return function(event) {
            return func.call(object, event || window.event);
        };
    };

    /**
     * @method octopus.util.isNode
     * @desc 判断对象是否是节点
     * @param o {Object}
     * @return {Boolean}
     */
    util.isNode = function(o) {
        return !!(o && o.nodeType === 1);
    };

    /**
     * @method octopus.util.isObject
     * @desc 判断对象是否是对象
     * @return {Boolean}
     */
    util.isObject = function (source) {
        return 'function' == typeof source || !!(source && 'object' == typeof source);
    };

    /**
     * @method octopus.util.isString
     * @desc 判断对象是否是字符串
     * @return {Boolean}
     */
    util.isString = function (source) {
        return '[object String]' == Object.prototype.toString.call(source);
    };

    /**
     * @method octopus.util.isArray
     * @desc 判断对象是否是数组
     * @return {Boolean}
     */
    util.isArray = function(source) {
        return ('[object Array]' == Object.prototype.toString.call(source));
    };

    /**
     * @method octopus.util.isNumeric
     * @desc 判断对象是否是数字
     * @returns {Boolean}
     */
    util.isNumeric = function(obj) {
        return !isNaN(parseFloat(obj)) && isFinite(obj);
    };

    /**
     * @method octopus.util.isPlain
     * @desc 判断是否是普通对象 非function
     */
    util.isPlain  = function(obj){
        var hasOwnProperty = Object.prototype.hasOwnProperty,
            key;
        if ( !obj ||
            Object.prototype.toString.call(obj) !== "[object Object]" ||
            !('isPrototypeOf' in obj)
            ) {
            return false;
        }
        if ( obj.constructor &&
            !hasOwnProperty.call(obj, "constructor") &&
            !hasOwnProperty.call(obj.constructor.prototype, "isPrototypeOf") ) {
            return false;
        }
        for ( key in obj ) {}
        return key === undefined || hasOwnProperty.call( obj, key );
    };

    /**
     * @method octopus.util.isEmpty
     * @desc 判断传入的参数是否为空，
     *       包括undefined, null, false, number 0,
     *       empty string, string "0", {} and []
     * @returns {Boolean}
     */
    util.isEmpty = function(mixed_var) {
        var undef, key, i, len;
        var emptyValues = [undef, null, false, 0, "", "0"];

        for (i = 0, len = emptyValues.length; i < len; i++) {
            if (mixed_var === emptyValues[i]) {
                return true;
            }
        }

        if (typeof mixed_var === "object") {
            for (key in mixed_var) {
                return false;
            }
            return true;
        }

        return false;
    };

    /**
     * @method octopus.util.clone
     * @desc 深度拷贝一个对象
     * @return 拷贝后的对象
     */
    util.clone = function(source) {
        var result = source, i, len;
        if (!source
            || source instanceof Number
            || source instanceof String
            || source instanceof Boolean) {
            return result;
        } else if(util.isNode(source)) {
            return source.cloneNode(true);
        } else if (util.isArray(source)) {
            result = [];
            var resultLen = 0,
                i = 0,
                len = source.length;
            for (; i < len; i++) {
                result[resultLen++] = util.clone(source[i]);
            }
        } else if (util.isPlain(source)) {
            result = {};
            for (i in source) {
                if (source.hasOwnProperty(i)) {
                    result[i] = util.clone(source[i]);
                }
            }
        }
        return result;
    };

    /**
     * @method octopus.util.each
     * @param source {Array | Object}
     * @param callback {Function}
     * @returns {*}
     * @desc 遍历数组或对象
     */
    util.each = function(source, callback) {
        if(util.isArray(source)) {
            return Array.forEach ? source.forEach(callback) : function(ar, func) {
                var len = ar.length,
                    i = 0;
                for(; i < len; i++) {
                    var result = func.call(this, ar[i], i);
                    if(result === true) break;
                }
            }(source, callback);
        }
        if(util.isObject(source)) {
            for(var k in source) {
                if(source.hasOwnProperty(k)) {
                    var result = callback.call(this, source[k], k);
                    if(result === true) break;
                }
            }
        }
        return false;
    };

    /**
     * @method octopus.util.format
     * @param str {String} 待转换的字符串
     * @param data {} 数据
     * @returns {String}
     */
    util.format = function(str, data) {
        return str.replace(/(#)\{(.*?)\}/g, function(all, flag, param) {
            return data && typeof data[param] != "undefined" ? data[param] : "";
        });
    };

    /**
     * @method octopus.util.applyDefaults
     * @desc 将一个对象里没有的参数复制给另一个对象 与extend的区别在于 如果不会复制已存在属性
     * @param to {Object}
     * @param from {Object}
     */
    util.applyDefaults = function(to, from) {
        to = to || {};
        var fromIsEvt = typeof window.Event == "function"
            && from instanceof window.Event;
        for (var key in from) {
            if(to[key] === undefined ||
                (!fromIsEvt && from.hasOwnProperty
                    && from.hasOwnProperty(key) && !to.hasOwnProperty(key))) {
                to[key] = from[key];
            }
        }
        if(!fromIsEvt && from && from.hasOwnProperty
            && from.hasOwnProperty('toString') && !to.hasOwnProperty('toString')) {
            to.toString = from.toString;
        }
        return to;
    };

    /**
     * @method octopus.util.applyAdd
     * @desc 将一个对象里的参数深度拷贝给另一个对象 如果参数已存在 则覆盖 如果不存在 则追加
     * @param to {Object}
     * @param from  {Object}
     */
    util.applyAdd = function(to, from) {
        to = to || {};
        var fromIsEvt = typeof window.Event == "function"
            && from instanceof window.Event;
        for(var k in from) {
            if(util.isObject(to[k]) && util.isObject(from[k])) {
                to[k] = util.applyAdd(to[k], from[k]);
            } else if(from[k] !== undefined) {
                to[k] = from[k]
            }
        }
        if(!fromIsEvt && from && from.hasOwnProperty
            && from.hasOwnProperty('toString') && !to.hasOwnProperty('toString')) {
            to.toString = from.toString;
        }
        return to;
    };

    /**
     * @method octopus.util.urlAppend
     * @desc 将指定字符串里的内容拼进url
     * @param url {String}
     * @param paramStr {String}
     * @example
     * url = "http://www.google.com";
     * octopus.util.urlAppend(url, "a=1&b=2");
     * return "http://www.google.com?a=1&b=2"
     */
    util.urlAppend = function(url, paramStr) {
        var newUrl = url;
        if(paramStr) {
            var parts = (url + " ").split(/[?&]/);
            newUrl += (parts.pop() === " " ?
                paramStr :
                parts.length ? "&" + paramStr : "?" + paramStr);
        }
        return newUrl;
    };

    /**
     * @method octopus.util.getParameterString
     * @desc 从指定名值对里搞出来字符串形式
     * @param params {Object}
     * @example
     * param = { a: 1, b: 2 }
     * octopus.util.getParameterString(param)
     * return "a=1&b=2"
     */
    util.getParameterString = function(params) {
        var paramsArray = [];
        for (var key in params) {
            var value = params[key];
            if ((value != null) && (typeof value != 'function')) {
                var encodedValue;
                if (typeof value == 'object' && value.constructor == Array) {
                    var encodedItemArray = [];
                    var item;
                    for (var itemIndex=0, len=value.length; itemIndex<len; itemIndex++) {
                        item = value[itemIndex];
                        encodedItemArray.push(encodeURIComponent(
                            (item === null || item === undefined) ? "" : item)
                        );
                    }
                    encodedValue = encodedItemArray.join(",");
                }
                else {
                    encodedValue = encodeURIComponent(value);
                }
                paramsArray.push(encodeURIComponent(key) + "=" + encodedValue);
            }
        }
        return paramsArray.join("&");
    };

    /**
     * @method octopus.util.getParameters
     * @desc 从url中?后的字符串以对象形式返回
     * @param url {String}
     * @example
     * url = "http://www.baidu.com?a=1&b=2"
     * octopus.util.getParameters(url);
     * return { a: 1, b: 2 }
     */
    util.getParameters = function(url) {
        url = (url === null || url === undefined) ? window.location.href : url;
        var paramsString = "";
        if(url.indexOf("?") != -1) {
            var start = url.indexOf('?') + 1;
            var end = url.indexOf("#") != -1 ?
                url.indexOf('#') : url.length;
            paramsString = url.substring(start, end);
        }
        var parameters = {};
        var pairs = paramsString.split(/[&;]/),
            i = 0,
            len = pairs.length;
        for( ; i < len; i++) {
            var keyValue = pairs[i].split('=');
            if(keyValue[0]) {
                var key = keyValue[0];
                try {
                    key = decodeURIComponent(key);
                } catch (err) {
                    key = unescape(key);
                }
                var value = (keyValue[1] || '').replace(/\+/g, " ");
                try {
                    value = decodeURIComponent(value);
                } catch (err) {
                    value = unescape(value);
                }
                value = value.split(",");
                if (value.length == 1) {
                    value = value[0];
                }
                parameters[key] = value;
            }
        }
        return parameters;
    };

    /**
     * @method octopus.util.createUrlObject
     * @desc 创建一个url对象的名值对
     * 里面按照w3c url标准提供了每一个的值
     * @example
     * url = "http://www.google.com?a=1&b=2#abc=1";
     * octopus.util.createUrlObject(url);
     * return
     * {
     *  args: Object,
     *  a: "1",
     *  b: "2",
     *  hash: "#abc=1",
     *  host: "www.google.com",
     *  pathname: "/",
     *  port: "80",
     *  protocol: "http:",
     * }
     */
    util.createUrlObject = function(url, options) {
        options = options || {};
        url = url || window.location.href;
        if(!(/^\w+:\/\//).test(url)) {
            var loc = window.location;
            var port = loc.port ? ":" + loc.port : "";
            var fullUrl = loc.protocol + "//" + loc.host.split(":").shift() + port;
            if(url.indexOf("/") === 0) {
                url = fullUrl + url;
            } else {
                var parts = loc.pathname.split("/");
                parts.pop();
                url = fullUrl + parts.join("/") + "/" + url;
            }
        }
        if (options.ignoreCase) {
            url = url.toLowerCase();
        }
        var a = document.createElement('a');
        a.href = url;
        var urlObject = {};
        urlObject.host = a.host.split(":").shift();
        urlObject.protocol = a.protocol;
        if(options.ignorePort80) {
            urlObject.port = (a.port == "80" || a.port == "0") ? "" : a.port;
        } else {
            urlObject.port = (a.port == "" || a.port == "0") ? "80" : a.port;
        }

        //hash
        urlObject.hash = (options.ignoreHash || a.hash === "#") ? "" : a.hash;
        var queryString = a.search;
        if (!queryString) {
            var qMark = url.indexOf("?");
            queryString = (qMark != -1) ? url.substr(qMark) : "";
        }
        urlObject.args = util.getParameters(queryString);
        urlObject.pathname = (a.pathname.charAt(0) == "/") ? a.pathname : "/" + a.pathname;
        return urlObject;
    };

    /**
     * @method octopus.util.trim
     * @desc 去掉字符串两侧空白
     * @param str {String}
     */
    util.trim = function(str) {
        str = String(str);
        return !!str.trim ? str.trim() : str.replace(new RegExp("(^[\\s\\t\\xa0\\u3000]+)|([\\u3000\\xa0\\s\\t]+\x24)", "g"), '');
    };


    /**
     * @method octopus.util.removeItem
     * @param source
     * @param item
     */
    util.removeItem = function(source, item) {
        var len = source.length,
            i = len;
        for(; i--; ) {
            if(source[i] === item) {
                source.splice(i, 1);
            }
        }
        return source;
    };

    /**
     * @method octopus.util.upperCaseObject
     * @desc 将指定对象里的key首字母大写
     * @param object {Object}
     */
    util.upperCaseObject = function (object) {
        var uObject = {};
        for (var key in object) {
            uObject[key.toUpperCase()] = object[key];
        }
        return uObject;
    };

    /**
     * @method octopus.util.camelize
     * @desc 驼峰化字符串
     * @param source {String}
     */
    util.camelize = function(source) {
        var oStringList = source.split(/[\-|_|\s|\.]/g);
        var camelizedString = oStringList[0],
            i = 1,
            len = oStringList.length;
        for ( ; i < len; i++) {
            var s = oStringList[i];
            camelizedString += s.charAt(0).toUpperCase() + s.substring(1);
        }
        return camelizedString;
    };

    /**
     * @method octopus.util.styleCss
     * @desc 将前缀类css 样式化
     * @example
     * var css = "-webkit-transition";
     * octopus.util.styleCss(css);
     * return "webkitTransition"
     */
    util.styleCss = function(str) {
        var flag = true;
        var str = str.replace(/\-(\S)/g, function($1, $2) {
            return flag ? (flag = false, $2) : $2.toUpperCase();
        });
        return str;
    };

    /**
     * @method octopus.util.cssStyle
     * @desc 将样式化的前缀 css化
     * @example
     * var style = "webkitTransition"
     * octopus.util.cssStyle(style);
     * return -webkit-transition
     */
    util.cssStyle = function(str) {
        var str = str.replace(/(^\S|[A-Z])/g, function($1) {
            return "-" + $1.toLowerCase();
        });
        return str;
    };

    /**
     * @method octopus.util.requestAnimation
     */
    util.requestAnimation = (function() {
        var request = window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            window.oRequestAnimationFrame ||
            window.msRequestAnimationFrame ||
            function(callback, element) {
                window.setTimeout(callback, 16);
            };
        return function(callback, element) {
            request.apply(window, [callback, element]);
        };
    })();
})(octopus);
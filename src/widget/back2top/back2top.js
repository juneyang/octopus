/**
 * @file
 * @author oupeng-fe
 * @version 1.1
 * webapp通用组件
 * back2top   -   回到顶部
 * @require lib/class.js
 * @require lib/util.js
 * @require lib/dom.js
 * @require lib/event.js
 * @require lib/tween.js
 * @require widget/widget.js
 */
;(function(o, undefined) {

    "use strict";

    /**
     * @class octopus.Widget.Back2Top
     * @parent octopus.Widget
     * @desc 回到顶部控件
     * @param options {Object} 接受的参数
     * @param options.isFast {Boolean} 是否使用高性能（即当滚动时隐藏控件）模式 默认不采用
     * @param options.animation {Boolean} 返回顶部是否使用动画 默认不采用
     * @param options.bottom {Number} 控件距离底部的值
     * @param options.direction {String} 控件在左侧还是右侧 默认右侧 "right" || "left"
     * @param options.offsetV {Number} 控件距离左侧或者右侧的距离
     * @param options.customize {Boolean} 是否自定制点击控件后的回调 若为true则点击控件只触发自定义事件（back2top-ontap） 不返回顶部
     */
    o.Widget.Back2Top = o.define(o.Widget, {

        /**
         * @private
         * @property bottom
         * @type {Number}
         * @desc 控件距离底部距离
         */
        bottom: 10,

        /**
         * @private
         * @property direction
         * @type {String}
         */
        direction: "right",

        /**
         * @private
         * @property offsetV
         * @type {Number}
         * @desc 控件距离两侧的距离
         */
        offsetV: 10,

        /**
         * @private
         * @property isAbsolute
         * @desc 某些机器不支持fixed属性 用absolute代替
         * @type {Boolean}
         */
        isAbsolute: false,

        /**
         * @private
         * @property isFast
         * @type {Boolean}
         * @desc 是否在滚动中隐藏从而提高性能
         */
        isFast: false,

        /**
         * @private
         * @property scrollTimer
         * @type {Number}
         * @desc 用来优化性能的scroll时的定时器
         */
        scrollTimer: null,

        /**
         * @private
         * @property isScroll
         * @type {Boolean}
         * @desc 当前是否在scroll的标志位
         */
        isScroll: false,

        /**
         * @private
         * @property customize
         * @type {Boolean}
         * @desc 是否用户自定义点击事件
         */
        customize: false,

        /**
         * @private
         * @property animation
         * @type {Boolean}
         * @desc 是否有动画
         */
        animation: false,

        /**
         * @private
         * @property loop
         * @type {Object}
         * @desc 动画的内存寻址
         */
        loop: null,

        /**
         * @private
         * @property count
         * @type {Number}
         * @desc 动画计数
         */
        count: 0,

        /**
         * @private
         * @property testFixed
         * @type {Boolean}
         * @desc 是否测试过是否支持fixed属性
         */
        testFixed: false,

        /**
         * @private
         * @property testFixableDom
         * @type {DOMElement}
         * @desc 用来判断设备是否支持fixed的节点
         */
        testFixableDom: null,

        /**
         * @private
         * @constructor
         */
        initialize: function() {
            o.Widget.prototype.initialize.apply(this, arguments);
            o.dom.addClass(this.el, "octopusui-back2top");
            this.loop = {};
            this.initFixed();
            this.initEvent();
            this.testFixableDom = o.dom.createDom("div", null, {
                top: "5px",
                position: "fixed"
            });
        },

        /**
         * @private
         * @method initFixed
         * @desc 初始化fix属性 让其兼容所有浏览器
         */
        initFixed: function() {
            var that = this;
            if(/M031/.test(navigator.userAgent)) {
                this.setAbsolute();
            } else {
                var direction = this.direction;
                o.dom.setStyles(this.el, {
                    position: "fixed",
                    bottom: this.bottom + "px"
                });
                this.el.style[direction] = this.offsetV + "px";
            }
        },

        /**
         * @private
         * @method setAbsolute
         * @desc 将不支持fixed的节点设置为absolute
         */
        setAbsolute: function() {
            this.el.style.position = "absolute";
            this.isAbsolute = true;
            o.event.on(window, "ortchange", o.util.bind(this.onOrientationChanged, this));
        },

        /**
         * @private
         * @method onOrientationChanged
         */
        onOrientationChanged: function() {
            this.startFixed();
        },

        /**
         * @private
         * @method initEvent
         * @desc 事件初始化
         */
        initEvent: function() {
            this.isFast && o.event.on(document, "touchmove", o.util.bindAsEventListener(this.onTouchMove, this), false);
            o.event.on(document, "scroll", o.util.bindAsEventListener(this.onJudgeScroll, this), false);
            o.event.on(document, "touchend", o.util.bindAsEventListener(this.onTouchEnd, this), false);
            o.event.on(document, "touchcancel", o.util.bindAsEventListener(this.onTouchEnd, this), false);
            this.on("tap", o.util.bindAsEventListener(this.onTap, this));
        },

        /**
         * @private
         * @method onTap
         */
        onTap: function(e) {
            this.notify("back2top-ontap", e);
            !this.customize && this.goTo(1, this.animation);
        },

        /**
         * @public
         * @method octopus.Widget.Back2Top.goTo
         * @param y {Number}
         * @param animation {Boolean}
         * @desc 使页面滚到指定位置
         */
        goTo: function(y, animation) {
            if(!animation) {
                window.scrollTo(0, y);
            } else {
                var _y = window.pageYOffset;
                this.count = 0;
                var that = this;
                ++this.count;
                this.loop[this.count] = function() {
                    if(that.loop[that.count]) {
                        if (_y > (y - 1)) {
                            window.scrollBy(0, -Math.min(150, _y - y + 1));
                            _y -= 150;
                            o.util.requestAnimation(that.loop[that.count]);
                        } else {
                            that.loop[that.count] = null;
                        }
                    } else {
                        that.loop[that.count] = null;
                    }
                }
                o.util.requestAnimation(this.loop[this.count]);
            }
        },

        /**
         * @private
         * @method onTouchEnd
         * @desc 判断是否应该显示
         */
        onTouchEnd: function() {
            this.checkIfVisible();
        },

        /**
         * @private
         * @method onJudgeScroll
         */
        onJudgeScroll: function() {
            if(!this.isScroll) {
                o.util.requestAnimation(o.util.bind(this.onScroll, this));
                this.isScroll = true;
            }
        },

        /**
         * @private
         * @method onScroll
         */
        onScroll: function() {
            this.clearTimer();
            this.isFast && this.hidden();
            this.isAbsolute && this.startFixed();
            this.scrollTimer = window.setTimeout(o.util.bind(this.onScrollStop, this), 300);
            this.isScroll = false;
        },

        /**
         * @private
         * @method onScrollStop
         */
        onScrollStop: function() {
            this.isAbsolute && this.startFixed();
            !this.testFixed && this.testFixable();
            this.checkIfVisible();
        },

        /**
         * @private
         * @method testFixable
         * @desc 判断当前设备是否支持fixed属性
         */
        testFixable: function() {
            this.testFixed = true;
            if(this.testFixableDom.offsetTop != 5) {
                this.setAbsolute();
            }
            document.body.removeChild(this.testFixableDom);
            this.testFixableDom = null;
        },

        /**
         * @private
         * @method checkIfVisible
         */
        checkIfVisible: function() {
            window.pageYOffset > document.documentElement.clientHeight ? this.show() : this.hidden()
        },

        /**
         * @private
         * @method onTouchMove
         */
        onTouchMove: function() {
            this.hidden();
        },

        /**
         * @private
         * @method clearTimer
         */
        clearTimer: function() {
            if(this.scrollTimer) {
                window.clearTimeout(this.scrollTimer);
                this.scrollTimer = null;
            }
        },

        /**
         * @private
         * @method startFixed
         * @desc 当设备不支持fixed时用absolute的滚动
         */
        startFixed: function() {
            if(!this.active)    return;
			var direction = this.direction == "right" ? "left" : "right";
            o.dom.setStyles(this.el, {
                top: window.pageYOffset + window.innerHeight - parseInt(this.getHeight()) - this.bottom + "px"
            });
            this.el.style[direction] = document.body.offsetWidth - parseInt(this.getWidth()) - this.offsetV + "px";
        },

        /**
         * @private
         * @method render
         */
        render: function() {
            var b = document.body,
                fragment = document.createDocumentFragment();
            this.container = b;
            fragment.appendChild(this.el);
            fragment.appendChild(this.testFixableDom)
            this.appendChild(fragment, this.container);
            if(this.isShow) {
                this.isShow = false;
                this.show();
            }
            if(!this.active) {
                this.activate();
            }
        },

        CLASS_NAME: "octopus.Widget.Back2Top"
    });

    /**
     * @method octopus.Widget.back2top
     * @desc 生成与html模版相绑定的回到顶部 所有的参数都以html模版形式传入
     * @param el
     * @returns {o.Widget.HtmlBack2Top}
     */
    o.Widget.back2top = function(el) {
        return new o.Widget.HtmlBack2Top({
            el: el
        });
    };

    /**
     * @class octopus.Widget.HtmlBack2Top
     * @parent octopus.Widget.Back2Top
     * @desc 参数与octopus.Widget.Back2Top 不同的是 这个类仅限于对已有符合规范的html模版的改造与封装
     * 符合条件的html模版属性包括
     * data-octopusui-back2top-direction 可以指定控件的左右 "left" || "right"
     * data-octopusui-back2top-fast 如果设置此属性 使用高性能（即当滚动时隐藏控件）模式
     * data-octopusui-back2top-animate 如果设置此属性 返回顶部会使用动画
     * data-octopusui-back2top-bottom 设置距底部的距离 默认为10
     * data-octopusui-back2top-offset 设置距左｜右的距离 默认为10
     * data-octopusui-back2top-customize 如果设置此属性 则需要自定义点击后的事件
     */
    o.Widget.HtmlBack2Top = o.define(o.Widget.Back2Top, {

        /**
         * @private
         * @constructor
         */
        initialize: function(opts) {
            o.Widget.prototype.initialize.apply(this, arguments);
            this.loop = {};
            this.direction = o.dom.data(this.el, "octopusui-back2top-direction") || this.direction;
            this.isFast = o.dom.data(this.el, "octopusui-back2top-fast");
            this.animation = o.dom.data(this.el, "octopusui-back2top-animate");
            this.bottom = o.dom.data(this.el, "octopusui-back2top-bottom") || this.bottom;
            this.offsetV = o.dom.data(this.el, "octopusui-back2top-offset") || this.offsetV;
            this.customize = o.dom.data(this.el, "octopusui-back2top-customize");
            this.testFixableDom = o.dom.createDom("div", null, {
                top: "5px",
                position: "fixed"
            });
            if(this.isShow) {
                this.isShow = false;
                this.show();
            }
            if(!this.active) {
                this.activate();
            }
            this.checkDom();
            this.initEvent();
        },

        /**
         * @private
         * @method render
         * @desc 防止被调用
         */
        render: function() {
            throw new Error("this class can't render! :)");
        },

        /**
         * @private
         * @method checkDom
         * @desc 初始化dom
         */
        checkDom: function() {
            this.el.style.display = "none";
            this.isShow = false;
            o.dom.addClass(this.el, "octopusui-back2top");
            this.initFixed();
            var parent = this.el.parentNode,
                body = document.body;
            this.container = body;
            if(parent != body) {
                parent.removeChild(this.el);
                body.appendChild(this.el);
            }
            body.appendChild(this.testFixableDom);
        },

        CLASS_NAME: "octopus.Widget.HtmlBack2Top"
    });

})(octopus);
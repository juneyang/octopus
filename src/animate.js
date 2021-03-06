/**
 * @file
 * webapp通用组件基础库文件
 * 动画行为部分
 * @require lib/class.js
 * @require lib/util.js
 * @require lib/event.js
 * @require lib/tween.js
 * @author oupeng-fe
 * @version 1.1
 */
;(function(o, undefined) {

    "use strict";

    /**
     * @method octopus.animate
     * @param options {Object}
     * @param options.el {DOMElement} 进行动画的节点
     * @param options.type {String} 进行动画的类型
     * @param options.config {Object} 进行动画的参数
     * @return octopus.animation
     */
    o.animate = function(options) {
        return !!o.animation[options.type] ? (o.animation[options.type](options.el, options.config, options.func)) : null;
    };

    /**
     * @namespace octopus.animation
     */
    octopus.animation = octopus.animation || {

        /**
         * @method octopus.animation.slide
         */
        slide: function(el, config, func) {
            var options = o.extend({
                direction: "left",
                out: true,
                duration: .4,
                isFade: false,
                ease: "ease-out",
                isScale: false
            }, config);
            func = func || o.util.empty;
            var el = el,
                out = options.out,
                currentOpacity,
                toOpacity,
                direction = options.direction,
                toX = 0,
                toY = 0,
                fromX = 0,
                fromY = 0,
                elOffset = 100,
                ps = [],
                fvs = [],
                evs = [];
            if(direction == "left" || direction == "right") {
                if(out) {
                    toX = -elOffset;
                } else {
                    fromX = elOffset;
                }
            } else if(direction == "up" || direction == "down") {
                if(out) {
                    toY = -elOffset;
                }
                else {
                    fromY = elOffset;
                }
            }
            if (direction == 'right' || direction == 'down') {
                toY *= -1;
                toX *= -1;
                fromY *= -1;
                fromX *= -1;
            }
            ps.push("-webkit-transform");
            fvs.push("translate3d(" + fromX + "%, " + fromY + "%, 0)");
            evs.push("translate3d(" + toX + "%, " + toY + "%, 0)");
            if(options.isFade) {
                toOpacity = out ? 0 : 1;
                currentOpacity = out ? 1 : 0;
                fvs.push(currentOpacity);
                evs.push(toOpacity);
                ps.push("opacity");
            }
            if(options.isScale && out) {
                var fromScale = 1,
                    toScale = 0.8;
                fvs.push("scale(" + fromScale + ")");
                evs.push("scale(" + toScale + ")");
                ps.push("-webkit-transform");
                var _index = ps.indexOf("opacity");
                if(_index == -1) {
                    ps.push("opacity");
                    evs.push(out ? 1 : 0);
                    fvs.push(out ? 0 : 1);
                } else {
                    evs[_index] = out ? 1 : 0;
                    fvs[_index] = out ? 0 : 1;
                }
            }
            return new o.Tween(el, ps, fvs, evs, options.duration, func, {
                ease: options.ease
            });
        },

        /**
         * @method octopus.animation.fade
         */
        fade: function(el, config, func) {
            var options = o.extend({
                out: true,
                duration: .4,
                ease: "ease-out"
            }, config);
            func = func || o.util.empty;
            var el = el,
                fromOpacity = 1,
                toOpacity = 1,
                out = options.out;
            if (out) {
                toOpacity = 0;
            } else {
                fromOpacity = 0;
            }
            var fv = [fromOpacity],
                ev = [toOpacity];
            return new o.Tween(el, ["opacity"], fv, ev, options.duration, func, {
                ease: options.ease
            });
        },

        /**
         * @method octopus.animation.pop
         */
        pop: function(el, config, func) {
            var options = o.extend({
                out: true,
                duration: .4,
                ease: "ease-out",
                scaleOnExit: true
            }, config);
            func = func || o.util.empty;
            var el = el,
                fromScale = 1,
                toScale = 1,
                fromOpacity = 1,
                toOpacity = 1,
                curZ = o.dom.getStyle(el, 'z-index') || 0,
                fromZ = curZ,
                toZ = curZ,
                out = options.out;

            if (!out) {
                fromScale = 0.01;
                fromZ = curZ + 1;
                toZ = curZ + 1;
                fromOpacity = 0;
            } else {
                if (options.scaleOnExit) {
                    toScale = 0.01;
                    toOpacity = 0;
                } else {
                    toOpacity = 0.8;
                }
            }
            var ps = ["-webkit-transform", "-webkit-transform-origin", "opacity", "z-index"],
                fvs = ["scale(" + fromScale + ")", "50% 50%", fromOpacity, fromZ],
                evs = ["scale(" + toScale + ")", "50% 50%", toOpacity, toZ];
            return new o.Tween(el, ps, fvs, evs, options.duration, func, {
                ease: options.ease
            });
        },

        /**
         * @method octopus.animation.flip
         */
        flip: function(el, config, func) {
            var options = o.extend({
                out: true,
                duration: .4,
                ease: "ease-out",
                direction: "left"
            }, config);
            func = func || o.util.empty;
            var el = el,
                direction = options.direction,
                rotateProp = 'Y',
                fromScale = 1,
                toScale = 1,
                fromRotate = 0,
                out = options.out,
                toRotate = 0;

            if (out) {
                toRotate = -180;
                toScale = 0.8;
            } else {
                fromRotate = 180;
                fromScale = 0.8;
            }

            if (direction == 'up' || direction == 'down') {
                rotateProp = 'X';
            }

            if (direction == 'right' || direction == 'left') {
                toRotate *= -1;
                fromRotate *= -1;
            }
            el.style.webkitBackfaceVisibility = "hidden"
            return new o.Tween(el, "-webkit-transform", 'rotate' + rotateProp + '(' + fromRotate + 'deg) scale(' + fromScale + ')',
                'rotate' + rotateProp + '(' + toRotate + 'deg) scale(' + toScale + ')', options.duration, func, {
                ease: options.ease
            });
        },

        /**
         * @method octopus.animation.wipe
         */
        wipe: function(el, config, func) {
            var options = o.extend({
                out: true,
                duration: .4,
                ease: "ease-out"
            }, config);
            func = func || o.util.empty;
            var el = el,
                curZ = o.dom.getStyle(el, "z-index") || 0,
                zIndex,
                out = options.out,
                mask = '';

            if (!out) {
                zIndex = curZ + 1;
                mask = '-webkit-gradient(linear, left bottom, right bottom, from(transparent), to(#000), color-stop(66%, #000), color-stop(33%, transparent))';
                var _width = o.dom.getWidth(el);
                el.style.webkitMaskImage = mask;
                el.style.maskImage = mask;
                el.style.webkitMaskSize = _width * 3 + "px" + o.dom.getHeight(el) + "px";
                el.style.maskSize = _width * 3 + "px" + o.dom.getHeight(el) + "px";
                el.style.zIndex = zIndex;
                return new o.Tween(el, "-webkit-mask-position-x", "0", 0 - _width + "px",  options.duration, func, {
                    ease: options.ease
                });
            }
            window.setTimeout(func, options.duration * 1000);
            return null;
        },

        /**
         * @method octopus.animation.roll
         */
        roll: function(el, config, func) {
            var options = o.extend({
                out: true,
                duration: .4,
                ease: "ease-out",
                isFade: false
            }, config);
            func = func || o.util.empty;
            var el = el,
                out = options.out,
                fromTransform = "translateX(-100%) rotate(-120deg)",
                toTransform = "translateX(0px) rotate(0deg)",
                ps = ["-webkit-transform"],
                fvs = [],
                evs = [];
            if(out) {
                var temp = fromTransform;
                fromTransform = toTransform;
                toTransform = temp;
            }
            fvs.push(fromTransform);
            evs.push(toTransform);
            if(options.isFade) {
                ps.push("opacity");
                fvs.push(options.out ? 1 : 0);
                evs.push(options.out ? 0 : 1);
            }
            return new o.Tween(el, ps, fvs, evs, options.duration, func, {
                ease: options.ease
            })
        },

        /**
         * @method octopus.animation.rotate
         */
        rotate: function(el, config, func) {
            var options = o.extend({
                out: true,
                duration: .4,
                ease: "ease-out",
                horizon: "center",
                direction: "center",
                isFade: false
            }, config);
            func = func || o.util.empty;
            var el = el,
                out = options.out,
                ps = ["-webkit-transform"],
                fvs = [],
                fromTransform = "rotate(200deg)",
                toTransform = "rotate(0)",
                evs = [];
            if(options.direction == "up") {
                options.direction = "top";
            } else if(options.direction == "down") {
                options.direction = "bottom";
            }
            el.style.webkitTransformOrigin = options.horizon + " " + options.direction;
            if(options.horizon == "left") {
                fromTransform = "rotate(90deg)";
            } else if(options.horizon == "right") {
                fromTransform = "rotate(-90deg)";
            }
            if(out) {
                var temp = fromTransform;
                fromTransform = toTransform;
                toTransform = temp;
            }
            fvs.push(fromTransform);
            evs.push(toTransform);
            if(options.isFade) {
                ps.push("opacity");
                fvs.push(options.out ? 1 : 0);
                evs.push(options.out ? 0 : 1);
            }
            return new o.Tween(el, ps, fvs, evs, options.duration, func, {
                ease: options.ease
            });
        },

        /**
         * @method octopus.animation.fold
         */
        fold: function(el, config, func) {
            var options = o.extend({
                out: true,
                duration: .4,
                ease: "ease-out",
                direction: "left",
                isFade: false
            }, config);
            func = func || o.util.empty;
            var el = el,
                out = options.out,
                direction = options.direction,
                transform = {
                    "left": {
                        "origin": "100% 50%",
                        "startTransform": "translateX(-100%) rotateY(-90deg)"
                    },
                    "right": {
                        "origin": "0% 50%",
                        "startTransform": "translateX(100%) rotateY(90deg)"
                    },
                    "up": {
                        "origin": "50% 100%",
                        "startTransform": "translateY(-100%) rotateX(90deg)"
                    },
                    "down": {
                        "origin": "50% 0%",
                        "startTransform": "translateY(100%) rotateX(-90deg)"
                    }
                },
                ps = ["-webkit-transform"],
                fvs = [],
                evs = [],
                fromTransform = transform[direction]["startTransform"],
                toTransform = "translate3d(0, 0, 0) rotate(0)";
            el.style.webkitTransformOrigin = transform[direction]["origin"];
            if(out) {
                var temp = fromTransform;
                fromTransform = toTransform;
                toTransform = temp;
            }
            fvs.push(fromTransform);
            evs.push(toTransform);
            if(options.isFade) {
                ps.push("opacity");
                fvs.push(options.out ? 1 : 0);
                evs.push(options.out ? 0 : 1);
            }
            return new o.Tween(el, ps, fvs, evs, options.duration, func, {
                ease: options.ease
            });
        },

        /**
         * @method octopus.animation.carousel
         */
        carousel: function(el, config, func) {
            var options = o.extend({
                out: true,
                duration: .4,
                ease: "ease-out",
                direction: "left",
                isFade: false
            }, config);
            func = func || o.util.empty;
            var el = el,
                out = options.out,
                direction = options.direction,
                transform = {
                    "left": {
                        "originOut": "100% 50%",
                        "originIn": "0% 50%",
                        "startTransformOut": "translateX(-200%) scale(.4) rotateY(-65deg)",
                        "startTransformIn": "translateX(200%) scale(.4) rotateY(65deg)"
                    },
                    "right": {
                        "originOut": "0% 50%",
                        "originIn": "100% 50%",
                        "startTransformOut": "translateX(200%) scale(.4) rotateY(65deg)",
                        "startTransformIn": "translateX(-200%) scale(.4) rotateY(-65deg)"
                    },
                    "up": {
                        "originOut": "50% 100%",
                        "originIn": "50% 0%",
                        "startTransformOut": "translateY(-200%) scale(.4) rotateX(65deg)",
                        "startTransformIn": "translateY(200%) scale(.4) rotateX(-65deg)"
                    },
                    "down": {
                        "originOut": "50% 0%",
                        "originIn": "50% 100%",
                        "startTransformOut": "translateY(200%) scale(.4) rotateX(-65deg)",
                        "startTransformIn": "translateY(-200%) scale(.4) rotateX(65deg)"
                    }
                },
                ps = ["-webkit-transform"],
                fvs = [],
                evs = [],
                fromTransform = transform[direction]["startTransformOut"],
                toTransform = "translate3d(0, 0, 0) rotate(0)";
            el.style.webkitTransformOrigin = out ? transform[direction]["originIn"] : transform[direction]["originOut"];
            if(out) {
                fromTransform = toTransform;
                toTransform = transform[direction]["startTransformIn"];
            }
            fvs.push(fromTransform);
            evs.push(toTransform);
            if(options.isFade) {
                ps.push("opacity");
                fvs.push(options.out ? 1 : 0);
                evs.push(options.out ? 0 : 1);
            }
            return new o.Tween(el, ps, fvs, evs, options.duration, func, {
                ease: options.ease
            });
        }
    };
})(octopus);
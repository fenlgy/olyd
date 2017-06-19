/**
 * Created by liguangyao on 2016/7/29.
 */
;(function (factory) {
    if (typeof exports == "object" && typeof module == "object")
    // CommonJS
        factory(require("jquery"));
    else if (typeof define == "function" && define.amd)
    // AMD
        define(["jquery"], factory);
    else
    // 全局模式
        factory(jQuery);
})(function ($) {

    var strToJson = function (str){
        var json = (new Function("return " + str))();
        return json;
    }

    var methods = {
        init: function (options) {
            var self = methods;

            var defaults = {
                item: '.tab-item',
                container: '.tabs-cnt',
                activeClass:'active'
            }

            return this.each(function () {
                var $this = $(this);
                var customOpts = $this.attr('tabs-opts');
                var opts = customOpts ? strToJson(customOpts) : {},
                    settings = $.extend({}, defaults, opts);


                settings.$item = $this.find(settings.item);
                settings.$container = $this.find(settings.container);

                $this.data("settings", settings)

                //如果没有设id，则设一个组件名
                // $this.attr('id') || $this.attr('id', function () {
                //     return 'olyDropdown' + ('00000' + (Math.random() * 16777216 << 0).toString(16)).substr(-6).toUpperCase();
                // })

                self.bindHandlers($this, settings);

            });
        },
        bindHandlers: function (item, settings) {
            var $this = item;

            $this.on('click.olyTabs', settings.item, function () {
                var index = settings.$item.index($(this));

                settings.$item.removeClass(settings.activeClass);
                $(this).addClass(settings.activeClass);
                settings.$container.hide().eq(index).show();

            })

        },
        unBindHandlers: function (item) {
            var self = item ? item : this;
            self.each(function () {
                self.off('.olyTabs');
            });
        }
    };

    $.fn.olyTabs = function () {
        var method = arguments[0];

        if (methods[method]) {
            method = methods[method];
            arguments = Array.prototype.slice.call(arguments, 1);
        } else if (typeof(method) == 'object' || !method) {
            method = methods.init;
        } else {
            $.error('Method ' + method + ' does not exist on jQuery.pluginName');
            return this;
        }

        return method.apply(this, arguments);
    }

    $(function () {

        $("[oly-widget = 'olyTabs']").olyTabs();
    });

});
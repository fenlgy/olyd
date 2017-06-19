/**
 * Created by liguangyao on 2016/8/1.
 */
;(function (factory) {
    if (typeof exports == "object" && typeof module == "object")
    // CommonJS
        factory(require("jquery"));
    else if (typeof define == "function" && define.amd)
    // AMD
        define(["jquery","css!./placeholder.css"], factory);
    else
    // 全局模式
        factory(jQuery);
})(function ($) {

    var methods = {
        init: function () {
            var self = methods;
            var supportPlaceholder = 'placeholder' in document.createElement('input');
            // var supportPlaceholder = false;
            if(!supportPlaceholder) {
                return this.each(function () {
                    var $this = $(this);
                    var defaultValue = $this.attr('placeholder');
                    var $placeholder = $('<span class="oly-placeholder">' + defaultValue + '</span>');

                    $placeholder.css({
                        'font-size': $this.css('font-size'),
                        'padding-left': parseInt($this.css('border-left-width')) + parseInt($this.css('paddingLeft')) + 'px',
                        'line-height': $this.outerHeight()+'px'
                    });

                    // 防止 input width等于100%且初始是被隐藏的时候,获取不到宽度值
                    if($this.outerWidth() == '0'){
                        var wrapWidth = $this.parent().width()+"px";
                    }else {
                        var wrapWidth = $this.outerWidth() + "px";
                    }

                    //console.log($(this).parent().width()+"|"+$this.outerWidth()+"|"+$this.css('width'))
                    var $wrapPlaceholder = ('<div class="oly-placeholder-wrap" style="width:' + wrapWidth + '; height:' + $(this).outerHeight() + 'px"></div>')

                    $this
                        .wrap($wrapPlaceholder)
                        .before($placeholder.click(function () {
                            $this.trigger('focus');
                        }));

                    $this.val().length != 0 && $placeholder.hide();
                    self.bindHandlers($this, $placeholder);

                });
            }
        },
        bindHandlers: function (item,$placeholder) {
            var self = this;
            var $this = item;

            //propertychage 为IE 系列私有的
            var inputChangeEvent = typeof($this[0].oninput) == 'object' ? 'input' : 'propertychange';

            $this.on(inputChangeEvent + ".olyPlaceholder change.olyPlaceholder", function () {
                $placeholder[0].style.display = $this.val().length != 0 ? 'none' : 'block';
            });

        },
        unBindHandlers: function (item) {
            var self = item ? item : this;

            self.each(function () {
                var $this = $(this);
                $this.off('.olyPlaceholder');
            });
        },
        destroy: function () {
            methods.unBindHandlers($(this));
        }
    };

    $.fn.olyPlaceholder = function () {
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
        var supportPlaceholder = 'placeholder' in document.createElement('input');
         //var supportPlaceholder = false;

        if(!supportPlaceholder){
            $("input[placeholder]").each(function () {
                //placeholder 为空值的时候不初始化插件
               if($(this).attr('placeholder').length > 0){
                   $(this).olyPlaceholder();
               }
            });
        }
    });


})
/**
 * Created by liguangyao on 2017/3/6
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

    var strToJson = function (str) {
        var json = (new Function("return " + str))();
        return json;
    }

    var methods = {
        init: function () {
            var self = methods;
            var $this = this;
            var defaults = {
                themes: 'simple',//黑色
                direction: 'bottom',
                text: false,
                isResize:false
            };
            
            $(window).resize(function(){
            	$this.each(function (){
                    $(this).data("tipsSettings").isResize = true;
            	})
            })

            return $this.each(function () {
                var $this = $(this);
                var customOpts = $this.attr('tips-opts');
                var opts = customOpts ? strToJson(customOpts) : {},
                    tipsSettings = $.extend({}, defaults, opts);

                $this.data("tipsSettings", tipsSettings);

                //如果没有设id，则设一个组件名
                $this.attr('id') || $this.attr('id', function () {
                    return 'olyTips' + ('00000' + (Math.random() * 16777216 << 0).toString(16)).substr(-6).toUpperCase();
                });

                self.bindHandlers($this, tipsSettings);

            });
        },
        bindHandlers: function (item, tipsSettings) {
            var self = this;
            var $this = item;
            var thisId = $this.attr('id');
            // 由于箭头方向和tips所在方向刚好相反，所以转化下
            var direction = {
                bottom: 'top',
                top: 'bottom',
                left: 'right',
                right: 'left'
            }[tipsSettings.direction];
            var tipsId = 'tips-' + thisId;


            $this.bind('mouseenter.olyTips', function () {
                var $tips = $('#' + tipsId);
                var hasTips = $tips.length;
                var isResize =  $(this).data('tipsSettings').isResize

                if (hasTips && !isResize) {
                    $tips.show();
                }else if(hasTips && isResize){
                	self.setOffset($(this),tipsSettings)
                    $(this).data("tipsSettings").isResize = false;
                	$tips.show();
                } else {
                	var text = tipsSettings.text || $(this).attr('title');
                    $tips = $('<div class="tips" id="' + tipsId + '">' +
                        '<div class="tips-arrow tips-arrow-' + direction + '"></div>' +
                        '<div class="tips-text">' + text + '</div>' +
                        '</div>');
                    $('body').append($tips);

                    self.setOffset($(this),tipsSettings)
                }

                $this.attr('title', '')
            })
                .bind('mouseleave.olyTips', function () {
                    $('#' + tipsId).hide();
                })

        },
        setOffset:function(item,tipsSettings){
        	var tipsId = 'tips-' + item.attr('id');
        	var $tips = $('#' + tipsId);
        	var width = item.outerWidth();
            var height = item.outerHeight();
            var offset = item.offset();
            
            	var tipsWidth = $tips.outerWidth();
                var tipsHeight = $tips.outerHeight();
                var arrowSize = 5;
                var tipsLeft, tipsTop;
                switch (tipsSettings.direction) {
                    case 'bottom':
                        tipsLeft = offset.left - (tipsWidth - width) / 2;
                        tipsTop = offset.top + height + arrowSize;
                        break;
                    case 'top':
                        tipsLeft = offset.left - (tipsWidth - width) / 2;
                        tipsTop = offset.top - tipsHeight - arrowSize;
                        break;
                    case 'right':
                        tipsLeft = offset.left + width;
                        tipsTop = offset.top + ( height - tipsHeight ) / 2 + arrowSize;
                        break;
                    case 'left':
                        tipsLeft = offset.left - tipsWidth - arrowSize;
                        tipsTop = offset.top + ( height - tipsHeight ) / 2;
                        break
                }
                $tips.css({left: tipsLeft, top: tipsTop});
            }
    };

    $.fn.olyTips = function () {
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
    };

    $(function () {
        $("[oly-widget *= 'tips']").olyTips();

    });


});
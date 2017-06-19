/**
 * Created by liguangyao on 2016/7/29.
 */
;(function (factory) {
    if (typeof exports == "object" && typeof module == "object")
    // CommonJS
        factory(require("jquery"));
    else if (typeof define == "function" && define.amd)
    // AMD
        define(["jquery","utils"], factory);
    else
    // 全局模式
        factory(jQuery);
})(function ($) {
var utils = require("utils");

    var methods = {
        init: function () {
            var self = methods;
            var $this = this;
            var defaults = {
                eventType: 'click',
                direction: 'bottom',
                text: false,
                isResize:false
            };
            
            $(window).resize(function(){
            	$this.each(function (){
            		$(this).data("popoverSettings").isResize = true;
            	})
            })
            
            return $this.each(function () {
                var $this = $(this);
                var customOpts = $this.attr('popover-opts');
                var opts = customOpts ? utils.strToJson(customOpts) : {},
                    popoverSettings = $.extend({}, defaults, opts);

                $this.data("popoverSettings", popoverSettings);

                //如果没有设id，则设一个组件名
                $this.attr('id') || $this.attr('id', function () {
                    return utils.getId("olyPopover")
                });

                self.bindHandlers($this, popoverSettings);

            });
        },
        bindHandlers: function (item, popoverSettings) {
            var self = this;
            var $this = item;
            var thisId = $this.attr('id');
            // 由于箭头方向和popover所在方向刚好相反，所以转化下
            var direction = {
                bottom: 'top',
                top: 'bottom',
                left: 'right',
                right: 'left'
            }[popoverSettings.direction];
            var popoverId = 'popover-' + thisId;

            $this.bind(popoverSettings.eventType+'.olyPopover', function () {
                var $this = $(this)
                var $popover = $('#' + popoverId);
                var haspopover = $popover.length;
                var isResize =  $(this).data('popoverSettings').isResize

                if (haspopover && !isResize) {
                    $popover.show();
                }else if(haspopover && isResize){
                	self.setOffset($(this),popoverSettings)
                    $(this).data("popoverSettings").isResize = false;
                	$popover.show();
                } else {

                    $popover = methods.setPopoverHtml($this,thisId,popoverSettings.direction,popoverSettings.header)

                    //非组件内部触发的点击，隐藏下拉框
                    $(document).on("click.olyPopover." + thisId, function (e) {
                        // 需要把自身的点击过滤掉
                        var $item = $("#popover-"+thisId+",#"+thisId)
                        var isSelf = utils.isSelfEven($item,e)

                        if (!isSelf) {
                            $popover.hide()
                        }
                    })
                }
            })

            // mouseenter的时候需要鼠标移开就隐藏，但是dom结构又不是从属关系，所以要有延时隐藏
            if(popoverSettings.eventType == "mouseenter"){
                $this.bind('mouseleave'+'.olyPopover',function () {
                    function hide() {
                        $popover.hide()
                    }
                    var timer = setTimeout(hide,200)

                    $popover.bind('mouseenter',function () {
                        clearTimeout(timer)
                    }).bind('mouseleave',function () {
                        $(this).hide();
                    })
                })
            }


        },
        setPopoverHtml:function (item,popoverId,direction,header) {
            var setting = item.data("popoverSettings");
            $popover = $('<div class="comp-popover" id="popover-' + popoverId + '">' +
                '<div class="comp-popover__arrow comp-popover__arrow--' + direction + '"></div>' +
                '<div class="comp-popover__header">' + header + '</div>' +
                '<div class="comp-popover__body"></div>' +
                '</div>');

            var $popoverHeader =$popover.find('.comp-popover__header');
            var $popoverContent =$popover.find('.comp-popover__body');

            $popover.append($popoverContent);

            this.dom = {
                content:$popoverContent,
                header:$popoverHeader
            }

            this.setPopoverContent(item,setting)
            $('body').append($popover);

            this.setOffset(item,setting)

            return $popover
        },
        setPopoverContent:function (item,popoverSettings) {
            var that = this;
            var $popover = this.dom;
            if(popoverSettings.url){
                $popover.content.html(utils.getLoading())
                $.ajax({
                    url:popoverSettings.url,
                    success:function (date) {
                        $popover.content.html(date);
                        that.setOffset(item,popoverSettings)
                    }
                })
            }else {
                var content = popoverSettings.content
                $popover.content.html(content)
            }

        },
        setOffset:function(item,popoverSettings){
            var settings = item.data("popoverSettings")
        	var popoverId = 'popover-' + item.attr('id');
        	var $popover = $('#' + popoverId);
        	var width = item.outerWidth();
            var height = item.outerHeight();
            var offset = item.offset();
            
            	var popoverWidth = parseInt(settings.width) || $popover.outerWidth();
                var popoverHeight = $popover.outerHeight();
                var arrowSize = 5;
                var popoverLeft, popoverTop;
                switch (popoverSettings.direction) {
                    case 'bottom':
                        popoverLeft = offset.left - (popoverWidth - width) / 2;
                        popoverTop = offset.top + height + arrowSize;
                        break;
                    case 'top':
                        popoverLeft = offset.left - (popoverWidth - width) / 2;
                        popoverTop = offset.top - popoverHeight - arrowSize;
                        break;
                    case 'right':
                        popoverLeft = offset.left + width;
                        popoverTop = offset.top + ( height - popoverHeight ) / 2 + arrowSize;
                        break;
                    case 'left':
                        popoverLeft = offset.left - popoverWidth - arrowSize;
                        popoverTop = offset.top + ( height - popoverHeight ) / 2;
                        break
                    case 'top-left':
                        popoverLeft = offset.left - popoverWidth - arrowSize;
                        popoverTop = offset.top;
                        break
                }

                $popover.css({width:popoverSettings.width,left: popoverLeft, top: popoverTop});
            },
        unBindHandlers: function (item) {

        },
        destroy:function () {

        }
    };

    $.fn.olyPopover = function () {
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
        $("[oly-widget *= 'popover']").olyPopover();
    });
});
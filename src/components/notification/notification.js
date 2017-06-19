/**
 * Created by FEN on 2017/3/22.
 * 使用方法
 * $.fn.olyNotification({
                title:string,                    //  标题
                content:sting,                   //  展示内容
                type:sting,                      //  展示类型：warning,error,success,normal
                autoClose:boolean,               //  是否自动关闭，默认 false （5s 后自动关闭）
                autoCloseTime:number,            //  自动关闭时间单位ms，默认5000 ms
                afterClosed:function,            //  关闭后需执行的事件，关闭的叉叉按钮也会执行
                handler:function,                //  ‘朕知道了’按钮的方法
                btn:{                            //  可以添加一个自定义按钮
                    text:'',                     //  按钮文字
                    func:function                // function 关闭之外的方法
                }
            })
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
        init: function (opts) {
            var self = methods;
            var $this = this;
            var defaults = {
                title: '',
                content:'',
                autoCloseTime:5000,
                type:'info'
            };

                self.opts = $.extend({}, defaults, opts);
                self.setHtml();

        },
        bindHandlers: function (item) {
            var that = this;
            var opts = this.opts;

            var $notification = item;
            $notification.data('opts',that.opts);


            // 右上角叉叉图标
            $btnClose = $notification.find('i.icon-close');
            // 朕知道了的按钮
            $btnISee = $notification.find('.j-i-see');
            $btnDeal = $notification.find('.j-btn-deal');

            function handleclose() {
                that.close($notification)
            }

            // 用于直接关闭
            $btnClose.on('click',handleclose)

            // 可能关闭后要处理一些事件，比如关闭后不再显示
            $btnISee.on('click',function () {
                handleclose();
                opts.handler && opts.handler()
            })

            $btnDeal.on('click',function () {
                handleclose();
                opts.btn.func && opts.btn.func();
            })

            // 自动关闭
            if(opts.autoClose ){
                var timer = setTimeout(handleclose,opts.autoCloseTime)
                $notification.data('settimeout',timer)
            }
        },
        close:function (item) {
            var opts = item.data('opts')

            // 如果是自动关闭的，需要在手动关闭后把这个方法清除
            if(opts.autoClose){
                clearTimeout(item.data('settimeout'))
            }

            // css3 的退出动画效果
            item.addClass('comp-notification--effect-out')
            // 因为退出有动画，需要等到动画完成再执行colose 方法
            function delayClose() {
                item.remove()
                opts.afterClosed && opts.afterClosed();
            }

            setTimeout(delayClose,300)


        },
        setHtml:function () {
            var opts = this.opts;
            var that = this;
            var $container = $('.comp-notification__container');
            var hasContainer = $container.length;
            var thisId = utils.getId('olyNotification')

            if(!hasContainer){
                $container = $('<div class="comp-notification__container"></div>');
                $('body').append($container);
            }

            var $btn = opts.btn
                ? '<a href="javascript:" class="pdr6 j-btn j-btn-deal">'+ opts.btn.text +'</a><a href="javascript:" class="comp-notification__gray-btn j-i-see">朕知道了</a>'
                :'<a href="javascript:" class="j-i-see">朕知道了</a>'


            that.$notification = $('<div class="comp-notification comp-notification--effect-in comp-notification--'+ opts.type +'" id="' + thisId + '">' +
                '<div class="comp-notification__body">' +
                '<h3 class="comp-notification__title">'+ opts.title +'</h3>' +
                '<p>'+ opts.content +'</p>' +
                '<div class="comp-notification__fn">'+ $btn +'</div>' +
                '</div>' +
                '<i class="comp-notification__icon"></i>' +
                '<i class="icon-close"></i></div>' +
                '</div>')


            $container.append(that.$notification);
            var $notification = $('#'+thisId);

            that.bindHandlers($notification)

        },
        unBindHandlers: function (item) {

        },
        destroy:function () {

        }
    };

    $.fn.olyNotification = function () {
        var method = arguments[0];

        if (methods[method]) {
            method =  methods[method];
            arguments = Array.prototype.slice.call(arguments, 1);
        } else if (typeof(method) == 'object' || !method) {
            method =  methods.init;
        } else {
            $.error('Method ' + method + ' does not exist on jQuery.pluginName');
            return this;
        }
        return method.apply(this, arguments);
    };

});
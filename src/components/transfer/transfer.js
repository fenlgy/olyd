/* ========================================================================
 * transfer
 * @param
 * @param className [string] 控件的样式
 * @param height [string] 设置控件的高度
 * @param titles [array] 2个title，第一个为左侧的第二个为右侧的
 * @param dataSource [array] 数据源
 * @param choseKey [string] 是否选中的key
 * ======================================================================== */

(function( factory ) {
    if ( typeof define === "function" && define.amd ) {

        // AMD. Register as an anonymous module.
        define([ "jquery" ,'jqueryUi',"utils"], factory );
    } else {

        // Browser globals
        factory( jQuery );
    }
}(function ($) {

    var utils = require('utils');

    // 声明默认属性对象
    var pluginName = "transfer",
        preCls = 'comp'
        pluginClassName = preCls + '-transfer',
        defaults = {
            size: "normal",
            height:'',
            width:'',
            className: '',
            dataSource: [],
            titles: ['来源列','目标列'],
            choseKey:'chose'
        };

    var getClass = function (cls) {
        return pluginClassName+cls
    }

    // 构造函数
    function Plugin(element, options) {
        this.element = element;
        // 将默认属性对象和传递的参数对象合并到第一个空对象中
        this.settings = $.extend({}, defaults, options);
        this._defaults = defaults;
        this._name = pluginName;
        //放置一些全局要用的变量，如jquery 对象
        this.GLOBAL = {};
        this._cached = {}
        this.init();
    }

    Plugin.VERSION = '0.0.1';

    // 为了避免和原型对象Plugin.prototype的冲突，这地方采用继承原型对象的方法
    $.extend(Plugin.prototype, {
        init: function () {
            var _G = this.GLOBAL;

            // var opts = $(this.element).attr(pluginName+'-opts');
            // opts && $.extend(this.settings,utils.strToJson(opts));

            this.setHtml();
            this.setHandler();

            //更新状态是为了没数据要把全选的 checkbox 设为 false；
            this.updataState(_G.$transferLeftBody);
            this.updataState(_G.$transferRightBody);

        },
        setHtml:function () {
            var _s = this.settings;
            var _G = this.GLOBAL;
            var $transfer = $('<div class="'+ pluginClassName +' '+_s.className +'"></div>');
            var $transferLeft = $('<div class="'+ getClass('__left') +'">' +
                '<div class="'+ getClass('__header') +'">' +
                '<h4 class="'+ getClass('__title') +'">'+_s.titles[0]+'</h4>' +
                '<label><input type="checkbox" class="j-check-all">全选</label></div>' +
                '</div>');
            var $transferBody = $('<ul class="'+ getClass('__body') +'"></ul>');

            var $transferMid = $('<div class="'+ getClass('__mid') +'">' +
                '<div class="'+ getClass('__mid-con') +'">' +
                '<button type="button" class="j-to-target">></button>' + // 加上 type="button"，防止在form下面默认提交表单
                '<button type="button" class="j-to-source"><</button>' +
                '</div>' +
                '</div>');



            $transferLeft.append($transferBody);
            $transfer.append($transferLeft);
            $transfer.append($transferMid);
            var $transferRight = $transferLeft.clone().attr('class',getClass('__right'));
            $transfer.append($transferRight);

            //存储jQuery DOM对象
            _G.$transfer = $transfer;
            _G.$transferLeft = $transferLeft;
            _G.$transferRight = $transferRight;
            _G.$transferBody = $transfer.find('.'+getClass('__body'));
            _G.$transferLeftBody = $transferLeft.find('.'+getClass('__body'));
            _G.$transferRightBody = $transferRight.find('.'+getClass('__body'));
            _G.leftCheckAll = _G.$transferLeft.find('input.j-check-all');
            _G.rightCheckAll = _G.$transferRight.find('input.j-check-all');
            _G.btnToRight = _G.$transfer.find('button.j-to-target');
            _G.btnToLeft = _G.$transfer.find('button.j-to-source');
            _G.$transferRight.find('h4').text(_s.titles[1]);
            _s.height && _G.$transfer.height(_s.height);

            this.renderList();

            $(this.element).append($transfer);

        },
        renderList:function () {
            var _G = this.GLOBAL;
            var listData = _G.parsedData || this.getListData();
            _G.parsedData = listData;
            _G.$transferLeftBody.html(this.getList(listData.source));
            _G.$transferRightBody.html(this.getList(listData.target));
        },
        //把数据格式化
        getListData:function () {
            var _S = this.settings;
            var data = _S.dataSource;
            var ret = {source:[],target:[]};

            $.each(data,function (index,val) {
                if(val[_S.choseKey] == true){
                    ret.target.push(val)
                }else {
                    ret.source.push(val)
                }
            });

            return ret
        },
        // 把数据转化成 DOM
        getList:function (data) {
            var ret ='';
            $.each(data,function (index, val) {
                ret += '<li class="'+ getClass('__item') +'"><input type="checkbox" value="'+ val.key +'">'+ val.title +'</li>'
            })

            return ret;
        },
        setHandler:function () {
            var _G = this.GLOBAL;
            var that = this;

            _G.$transferBody.sortable({
                connectWith: ".comp-transfer__body",
                opacity:'.5',
                revert:true,
                receive:function (e,ui) {
                    // console.log(ui)
                    var $this = ui.item.find('input');
                    //拖动结束后需要 把checkbox false
                    $this.prop('checked',false);

                    that.updataState(_G.$transferLeftBody);
                    that.updataState(_G.$transferRightBody);

                }
            }).disableSelection();


            // 左右移动按钮事件
            _G.$transfer.on('click','button',function () {
                // 从左侧移到右侧
                if($(this).hasClass('j-to-target'))that.transferItem(_G.$transferLeftBody,_G.$transferRightBody);
                // 右侧移到左侧
                if($(this).hasClass('j-to-source'))that.transferItem(_G.$transferRightBody,_G.$transferLeftBody);
            });

            // 全选按钮
            _G.$transfer.find('.'+getClass('__header')).on('click','input',function () {
                var hasChecked = $(this).prop('checked');
                var fromLeft = $(this).parent().parent().parent().hasClass(getClass('__left'));
                var btn = fromLeft ? _G.btnToRight : _G.btnToLeft;
                $(this).parent().parent().next().find('input').prop('checked',hasChecked);

                hasChecked ? btn.addClass('actived') : btn.removeClass('actived')

            });

            _G.$transferLeftBody.on('click','input',function () {
                that.updataState(_G.$transferLeftBody)
            })

            _G.$transferRightBody.on('click','input',function () {
                that.updataState(_G.$transferRightBody)
            })

        },
        updataState:function (source) {
            var _G = this.GLOBAL;
            var fromLeft = source[0] == _G.$transferLeftBody[0];
            var checkbox =  fromLeft ? _G.leftCheckAll[0] : _G.rightCheckAll[0];
            // var $noData = fromLeft ? _G.$leftNoData : _G.$rightNoData;
            // var $container = fromLeft ? _G.$transferLeftBody : _G.$transferRightBody;
            var $btn = fromLeft ? _G.btnToRight : _G.btnToLeft;
            var state = this.getCheckboxState(source);

            if(state == 'indeterminate'){
                checkbox.indeterminate = true;
                $btn.addClass('actived');
            }

            if(state == 'allChecked') {
                checkbox.checked = true;
                $btn.addClass('actived');
            }

            if(state == 'allNotChecked' || state == 'hasNoItem') {
                checkbox.checked = false;
                $btn.removeClass('actived')
            }

            if(state !== 'indeterminate') checkbox.indeterminate = false;

            if(state == 'hasNoItem'){
                checkbox.disabled = true;
            }else {
                checkbox.disabled = false;
            }
        },
        getCheckboxState:function (container) {
            var hasChecked = false,notChecked = false,isIndeterminate = false,ret,
            $inputs = container.find('input');

            //没有input的时候，返回都没选择
            if($inputs.length == 0){
                return ret = 'hasNoItem';
            }

            $inputs.each(function () {
                if($(this).prop('checked') == false) notChecked = true;
                if($(this).prop('checked') == true) hasChecked = true;
                if(hasChecked && notChecked){
                    isIndeterminate = true;
                    // 只有这样才能跳出循环
                    return false
                }

            });
            if(isIndeterminate){
                // 选择一半
                ret = 'indeterminate'
            }else {
                // 全部选择
                if(hasChecked && !notChecked) ret = 'allChecked';
                // 全部不选中
                if(!hasChecked && notChecked) ret = 'allNotChecked';
            }

            return ret
        },
        transferItem:function (source,target) {
            var inputs = source.find('input:checked');
            var items = inputs.parent();
            target.append(items);
            inputs.prop('checked',false);

            this.updataState(source);
            this.updataState(target);

        },
        serialize:function () {
            var _G = this.GLOBAL;
            var _S = this.settings;
            var data = this.settings.dataSource;
            var newData = {source:[],target:[]};

            _G.$transferLeftBody.find('input').each(function () {
                var index = $(this).prop("value")
                var item = utils.getObjFromArr(data,'key',index);
                item[_S.choseKey] = false;
                newData.source.push(item)
            })

            _G.$transferRightBody.find('input').each(function () {
                var index = $(this).prop("value");
                var item = utils.getObjFromArr(data,'key',index);
                item[_S.choseKey] = true;
                newData.target.push(item)
            })

            return newData.source.concat(newData.target);

        }
        // updataData:function () {
        //     var _G = this.GLOBAL;
        //     var dataSource = this.settings.dataSource;
        //
        //     _G.$transferBody.find('input').each(function () {
        //         if($(this).prop('checked') == true){
        //             var index = $(this).val();
        //             var el = utils.getObjFromArr(dataSource,'key',index);
        //             el[_S.choseKey] = !el[_S.choseKey];
        //         }
        //     })
        // }

    });

    // 对外提供的接口
    var openMethod = /serialize/

    $.fn[pluginName] = function (props) {
        var args = [].slice.call(arguments,1);
        var ret = this;
        this.each(function () {
            var data = $.data(this, 'plugin_' + pluginName);
            if (!data) {
                $.data(this, "plugin_" + pluginName, new Plugin(this, props));
            }else {
                if (!openMethod.test(props)) {
                    return console.warn(props + ' 方法不被接受！')
                }
                if (typeof props === 'string') {
                    //如果是调用接口，则返回接口返回的值
                    ret =  data[props].apply(data,args)
                }
            }
        });

        return ret;
    };

    // 传值写在html上不美观，去掉这个功能
    // $(function () {
    //     $("[oly-widget *= "+ pluginName +"]")[pluginName]();
    // });

}))

/**
 * Created by liguangyao on 2016/7/29.
 */
import _utils from 'components/utils'
import classnames from 'classnames'

// 声明默认属性对象
var pluginName = 'olyDropdown',
  pluginClassName = 'oly-dropdown',
  defaults = {
    trigger: 'click', // type:string / click | hover
    className: '', // type:string
    dataSource: [],//{text:'',value:'',render:function(){}}
    loading: false, // type:boolean 是否需要显示 laoding
    getPopupContainer: 'body', //
    onVisibleChange: null, // type:function
    onClick: null, // type:function 点击触发对象
    onSelect: null, // type:function 选择选项
    maxRow: 0,
    setPosition: 'one',
    activeClass:`${pluginClassName}__item--active`,
    needConfirm: false,
    onConfirm: null, // type:function
    onCancel: null, // type:function
  };

class Dropdown {
  constructor(element, options) {
    this.element = element
    // 将默认属性对象和传递的参数对象合并到第一个空对象中
    this.settings = $.extend({}, defaults, options)
    this._defaults = defaults
    this._name = pluginName
    //放置一些全局要用的变量，如jquery 对象
    this.GLOBAL = {} // 存储jquery对象
    this._cached = {} // 主要用于存储数据
    this.state = { // 引起状态变化的数据
      selected:[]
    }
    this.init()
  }

  // static state ={}

  render() {
    const that = this;
    const _state = this.state;
    const $items = this.GLOBAL.$dropdownItems;
    const activeClass = this.settings.activeClass;

    $items.removeClass(activeClass);
    _state.selected.forEach( item => {
      $items.eq(item).addClass(activeClass);
    })
  }

  setState(obj) {
    const _state = this.state;
    let isChange = false;

    for (let key in obj) {
      if (!_utils.isEqual(_state[key], obj[key])) {
        _state[key] = obj[key];
        isChange = true;
      }
    }

    isChange && this.render();

  }

  init() {
    this.bindHandler();

  }

  //生成 Dom 结构，并添加到 body 中
  generateDom(cb) {
    let lists = '';
    const _ = this.settings;
    _.dataSource.forEach(item => {
      let el = item.text;
      //如果有渲染函数，则调用渲染函数，并把文本传给它
      if (item.render) {
        el = item.render(item.text)
      }
      lists += `<li class="${pluginClassName}__item">${el}</li>`;
    });

    const $dropdown = $(`<div class="${pluginClassName}"><ul>${lists}</ul></div>`);

    if (_.needConfirm) {
      const $confirm = $(`<div class="${pluginClassName}__confirm"><button class="oly-btn oly-btn-primary oly-btn-sm j-confirm">确定</button> <button class="oly-btn oly-btn-sm j-cancel">重置</button></div>`)
      $dropdown.addClass(`${pluginClassName}--confirm`).append($confirm)
    }

    this.GLOBAL.$dropdown = $dropdown;
    this.GLOBAL.$dropdownItems = $dropdown.find(`.${pluginClassName}__item`);

    $(_.getPopupContainer).append($dropdown);

    cb && cb();

    return $dropdown;
  }

  //
  bindHandler() {
    const that = this;
    const _ = this.settings;
    const _state = this.state;
    const eventName = this.settings.trigger + '.' + pluginClassName;

    // Dom 插入到 document 之后的事件
    const afterRenderEven = function () {

      const $dropdown = that.GLOBAL.$dropdown;

      // 监控body的事件，用于隐藏下拉框
      $('body').on(eventName, function (e) {
        let isSelf = e.target == that.element;
        let consdition = !isSelf;

        // 如果是多项选择，那么点击值不隐藏下拉框
        if (_.needConfirm) {
          consdition = !isSelf && !$dropdown.find(e.target).length > 0;
        }

        if (consdition && $dropdown.is(':visible')){
          that.handlerHide();
          that.render()

        }

      });

      // 点击下拉列表
      $dropdown.on(eventName, `.${pluginClassName}__item`, function () {
        const index = $(this).index();

        if(_.needConfirm){
          const activeCls = _.activeClass;
          if($(this).hasClass(activeCls)){
            $(this).removeClass(activeCls)
          }else {
            $(this).addClass(activeCls)
          }
        }
        // 返回当前点击的数据
        const ret = _.dataSource[index];
        _.onSelect && _.onSelect(ret,index)

      })

      if(_.needConfirm){
        // 确定的时候把 acitve 部分存到 state.selected 中
        $dropdown.on('click', '.j-confirm', function () {
          that.handlerHide();
          const selected = [];
          that.GLOBAL.$dropdownItems.each(function (index) {
            $(this).hasClass(_.activeClass) && selected.push(index)
          });
          that.setState({
            selected
          });
          _.onConfirm && _.onConfirm(selected);
        })
          .on('click', '.j-cancel', function () {
            that.handlerHide();
            that.render();
            _.onCancel && _.onCancel();
          })
      }

    };


    // 只有点击才触发 DOM 生成
    $(this.element).on(eventName, function (e) {
      const $dropdown = that.GLOBAL.$dropdown || that.generateDom(afterRenderEven);
      const positon = that.getPosition();
      $dropdown.css({top: positon.top, left: positon.left});

      _.onClick && _.onClick(e);
      that.handlerShow()
    })

  }

  getPosition() {
    const _ = this.settings;
    const $dropdown = this.GLOBAL.$dropdown;
    const margin = 16;
    const dWidth = $dropdown.outerWidth();
    const $el = $(this.element);
    const offset = $el.offset();
    const elHeight = $el.outerHeight();
    const containerWidth = $(_.getPopupContainer).outerWidth();

    if (containerWidth < offset.left + dWidth - margin) {
      offset.left = containerWidth - dWidth - margin;
    }

    return {
      top: offset.top + elHeight + 4,
      left: offset.left
    }
  }

  handlerShow() {
    this.GLOBAL.$dropdown.show();
    this.settings.onVisibleChange && this.settings.onVisibleChange('visible')
  }

  handlerHide() {
    this.GLOBAL.$dropdown.hide();
    this.settings.onVisibleChange && this.settings.onVisibleChange('hidden')
  }

}

// 对外提供的接口
const openMethod = /handlerShow|handlerHide|setState/

$.fn[pluginName] = function (props) {
  const args = [].slice.call(arguments, 1)
  this.each(function () {
    const data = $.data(this, 'plugin_' + pluginName)
    if (!data) {
      $.data(this, 'plugin_' + pluginName, new Dropdown(this, props))
    } else {

      if (!openMethod.test(props)) {
        return console.warn(props + ' 该方法不被接受！请查阅帮助文档 https://github.com/fenlgy/olyd/blob/es6_class/doc/table.md')
      }
      if (typeof props === 'string') {
        data[props].apply(data, args)
      }
    }
  })

  return this
}

export default Dropdown;
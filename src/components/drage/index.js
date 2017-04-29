/* ========================================================================
 * 拖动组件
 * 2 种模式，一种是直接绑定对象，一种是通过父级帅选对象
 * @param container  类型 string 或 function
 * ========================================================================
 * ======================================================================== */



// 声明默认属性对象
const pluginName = 'olyDrage'

const defaults = {
  axis: 'default'
}

// 构造函数
function Plugin (element, options) {
  this.$element = $(element)
  // 将默认属性对象和传递的参数对象合并到第一个空对象中
  this.settings = $.extend({}, defaults, options)
  this._defaults = defaults
  this.state = {
    canMove: false
  }
  this.GLOBAL ={}
  this._name = pluginName
  this._cached = {}
  this.init()
}

Plugin.VERSION = '0.0.1'

// 为了避免和原型对象Plugin.prototype的冲突，这地方采用继承原型对象的方法
$.extend(Plugin.prototype, {
  init: function () {
    this.handler();
  },
  handler: function () {
    const $el = this.$element;
    const cursor = {
      x:'col-resize',
      y:'row-resize',
      'default':'move'
    }
    const css = {position:'absolute',cursor:cursor[this.settings.axis]};

    const bindHander = (event, target, fuc) => {
      if (target) {
        $(target).css(css)
        $el.on(event, target, fuc)
      } else {
        $el.css(css)
        $el.on(event, fuc);
      }
    }

    bindHander('mousedown', this.settings.target, (e) => {
      this.startDrage(e);
      e.preventDefault(); // 去除默认行为，不然会选中其他文字
    })

  },
  setState: function (obj, cb) {
    $.extend(this.state, obj)
    cb && $.isFunction(cb) && cb()
  },
  startDrage: function (e) {
    this.state.canMove = true
    const $el = $(e.currentTarget)
    this.settings.$handleDrage = $el
    const _offset = $el.position()


    const container = this.settings.container
    if (container) {
      // container 可以是 function 或 string ，function 需要返回一个jquery对象
      const $container = $.isFunction(container) ? container.call($el) : $(container),
        position = $container.position(),
        width = $container.outerWidth(),
        height = $container.outerHeight()

      this.GLOBAL.range = {
        left: position.left,
        top: position.top,
        right: position.left + width,
        bottom: position.top + height
      }
    }
    console.log(this.settings.constructor)
    this.setState({
      startX: e.clientX,
      startY: e.clientY,
      elX: _offset.left,
      elY: _offset.top
    })

    this.settings.onDrageStart && this.settings.onDrageStart.call($el[0], this.setCache)
    $(document).on('mousemove.' + pluginName, (e) => this.drageing(e))
    $(document).on('mouseup.' + pluginName, (e) => this.endDrage(e))
  },
  drageing: function (e) {
    if (this.state.canMove) {
      const _state = this.state
      let _nX = e.clientX, // now x
        _nY = e.clientY,
        _sX = _state.startX, // start x
        _sY = _state.startY,
        // 当前鼠标的位置 减去 鼠标和元素原点的距离
        moveLeft = _nX - ( _state.startX - _state.elX),
        moveTop = _nY - ( _state.startY - _state.elY)

      _state.disX = _nX - _sX
      _state.disY = _nY - _sY

      const _range = this.GLOBAL.range;
      //限制滚动区域
      if(this.settings.container){
        if(moveLeft < _range.left ) moveLeft = _range.left
        if(moveTop < _range.top) moveTop = _range.top
      }

      console.log(this.$element)

      const $el = this.settings.$handleDrage
      const func = {
        x: function () {$el.css({left: moveLeft})},
        y: function () {$el.css({top: moveTop})},
        'default': function () {$el.css({left: moveLeft, top: moveTop})},
      }

      func[this.settings.axis]()

      this.settings.onDraging && this.settings.onDraging.call($el[0], _state)
    }
  },
  endDrage: function (e) {
    this.state.canMove = false

    this.settings.onDrageEnd && this.settings.onDrageEnd.call(this.settings.$handleDrage)
    $(document).off('mousemove.' + pluginName)
    $(document).off('mouseup.' + pluginName)
  }

})

// 对构造函数的一个轻量级封装，
// 防止产生多个实例
$.fn[pluginName] = function (options) {
  this.each(function () {
    if (!$.data(this, 'plugin_' + pluginName)) {
      $.data(this, 'plugin_' + pluginName, new Plugin(this, options))
    }
  })

  // 方便链式调用
  return this
}

module.exports = Plugin
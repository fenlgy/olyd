/* ========================================================================
 * oly-table
 * @pram
 * ========================================================================
 * ======================================================================== */

//TODO 全局使用的变量放到GLOBAL中
//TODO 翻页数据做cached缓存，设置缓存时间
import _utils from 'components/utils'
import classnames from 'classnames'

// 声明默认属性对象
var pluginName = 'olyTable',
  pluginClassName = 'oly-table',
  defaults = {
    size: 'normal',
    className: '',
    rowActiveClass: 'acti',
    columns: null,
    dataSource: null,
    loading: false,
    bordered: true,
    colResize: false, // 自定义列宽
    serialNumber: false, // 序号
    scroll: false,
    autoColWith: true, // 主要用于设置是否设置为 table-layout 为 fixed
    headFixed: false,
    //showThead: true, // 显示 thead
    rowSelection: false, // 是否带check box
    showHeader: true,
    height: '400px',
    // expandedRowRender:val => val.email, // 行点击展开的内容
    sortOder: 'asc', // more所有的排序方式，可在columns 中自定义每一个
    // afterUpdata
  }

const getCls = name => {
  if (!name) {
    return pluginClassName
  }
  return pluginClassName + name
}

const _cls = {
  colResize: 'col-resize-handle',
  wrapper: getCls('__wrapper'),
  container: getCls('__container'),
  head: getCls('__head'),
  body: getCls('__body'),
  fixed: getCls('--fixed')
}
// Plugin.VERSION = '0.0.1';

class Table {
  constructor(element, options) {
    this.$element = element
    // 将默认属性对象和传递的参数对象合并到第一个空对象中
    this.settings = $.extend({}, defaults, options)
    this._defaults = defaults
    this._name = pluginName
    //放置一些全局要用的变量，如jquery 对象
    this.GLOBAL = {
      isFirstRender: true
    }
    this._cached = {}
    this.state = {}
    this.render()
  }

  init() {

    // 标准化数据
    this.normalizeColumns();
    // 缓存一份数据用于筛选重置
    this._cached.dataSource = this.settings.dataSource;


    const _G = this.GLOBAL;
    const thead = this.getThead(),
      tbody = this.getTbody(),
      _settings = this.settings,
      isheadFixed = _settings.headFixed,
      colgroup = this.getColgroup()

    const className = classnames(
      getCls(),
      {
        [_settings.className]: _settings.className,
        [getCls('--fixed')]: _settings.headFixed || _settings.colResize
      }
    )

    function getTable(con) {
      return `<table class="${className}">${colgroup}${con}</table>`
    }

    function getWrapper(con) {
      return `<div class="${_cls.wrapper}"><div class="${_cls.container}">${con}</div></div>`
    }

    let html = '';

    if (isheadFixed) {
      html = getWrapper(`<div class="${_cls.head}">${getTable(thead)}</div><div class="${_cls.body}">${getTable(tbody)}</div>`)
    } else if (!_settings.showHeader) {
      html = getWrapper(`${getTable(tbody)}`)
    } else {
      html = getWrapper(`${getTable(thead + tbody)}`)
    }

    _G.$table = $(html)
    _G.$tbody = _G.$table.find('tbody')
    _G.$thead = _G.$table.find('thead')

    const $element = $(this.$element)
    $element.empty().append(_G.$table);

    _G.$colgroup = _G.$table.find('colgroup');

    // 如果没有设置 Col 的值，则把对应 th 的宽度设给他，没值的时候拖动有问题，会跳跃
    // _G.$table.find('.J-col').each(function (index) {
    //   const w = $(this).outerWidth();
    //   const $col = _G.$colgroup.find('col:eq('+ index +')');
    //   $col.width() || $col.width(w)
    // })

    _G.isFirstRender = false;

  }

  generateHtml() {

  }

  // render 是指把表格的主体部分放到 html 中
  render(type) {
    // type 为 ture 只更新body
    if (type) {
      this.update();
      return
    }

    this.beforeRender()
    this.init()
    this.afterRender()
  }

  beforeRender() {
    this.settings.beforeRender && this.settings.beforeRender($(this.$element))
  }

// 组件渲染完成后执行，可以在这里初始化其他组件
  afterRender() {
    this.initColResize();
    this.bindHandler();
    this.initFilter()

    this.settings.afterRender && this.settings.afterRender($(this.$element));
  }

  //用于排序，增加删除行,只跟新body部分
  update() {
    console.log('body')
    const _G = this.GLOBAL
    const $tbody = $(this.getTbody())
    _G.$tbody.replaceWith($tbody)
    _G.$tbody = $tbody
  }

  // 对外接受数据的更新
  setState(data, cb) {
    const _settings = this.settings;
    const {columns,dataSource} = data;

    dataSource && (_settings.dataSource = dataSource)
    columns && (_settings.columns = columns)

    this.render(!columns)

    cb && cb()
  }

  initColResize() {

    if (!this.settings.colResize) {
      return
    }

    const $table = this.GLOBAL.$table
    const _this = this

    function getColResize() {
      let colResizeHandle = ''
      _this.GLOBAL.compilerColumns.forEach((x, i) => {
        // console.log($element.find('col').eq(index).width())
        colResizeHandle += `<div class="${_cls.colResize}" data-index="${i}"></div>`
      })
      // 返回jquery 对象
      return $(colResizeHandle)
    }

    const $colResize = getColResize()
    this.GLOBAL.$colResizeHandle = $colResize

    const $useTh = $table.find('thead:first .J-col')
    // 按照看到的顺序排序
    $useTh.sort((a, b) => {
      return a.attributes['data-col-index'].value - b.attributes['data-col-index'].value
    })


    const setColResizeProps = (needTop) => {
      let colX = 0
      $useTh.each(function (index, aa) {
        const h = $(this).outerHeight()
        colX += $(this).outerWidth()

        const _css = {height: h, left: colX - 4}
        if (needTop === 'needTop') {
          $.extend(_css, {
            top: $(this).position().top
          })
        }
        $colResize.eq(index).css(_css)
      })
    }

    // 是否设置 top 值， 用于首次渲染，以后只调整左右
    setColResizeProps('needTop')

    $table.append($colResize);

    // $colResize.olyDrage()
    const $colgroup = $table.find('colgroup');
    let _startW = 0
    let $col = null
    $table.olyDrage({
      target: '.col-resize-handle',
      axis: 'x',
      container: function () {
        const index = $(this).attr('data-index');
        return $table.find('th[data-col-index=' + index + ']')
      },
      onDrageStart: function () {
        const index = $(this).attr('data-index')
        $col = $colgroup.find('col:eq(' + index + ')')
        _startW = $col.width()

      },
      onDraging: function (opt) {
        $col.width(_startW + opt.disX)
      },
      onDrageEnd: function () {
        setColResizeProps()
      }
    })

  }

  destroy() {
    console.log(this)
  }

  bindHandler() {
    const _this = this
    let select = []
    const $table = this.GLOBAL.$table

    // tr 点击事件
    $table.on('click', 'tbody tr', function () {
      const index = $(this).attr(pluginName + '-tr-index');

      $(this).addClass(_this.settings.rowActiveClass)

      // 调 onRowClick 时间，第一个参数当前tr的jquery对象 ，第二个参数：当前行的数据对象
      _this.settings.onRowClick && _this.settings.onRowClick(this, _this.settings.dataSource[index])
    })
    // checkbox 选择事件
      .on('click', 'input:checkbox', function () {

        if ($(this).hasClass('j-checkbox-all')) {
          let $otherCheckbox = $table.find('input').not($(this))

          if (this.checked) {
            select = []
            $otherCheckbox.prop('checked', true)
            $.each($otherCheckbox, function (index, val) {
              select.push(val.value)
            })
          } else {
            $otherCheckbox.prop('checked', false)
          }
          return
        }

        if (this.checked) {
          _utils.arrayDel(select, this.value)
          select.push(this.value)
        } else {
          _utils.arrayDel(select, this.value)
        }
      })
      // 排序
      .on('click', '.sort-icon', (e) => this.handlerSort(e))
      // 展开搜索，全部
      .on('click','.icon-expanded',function () {
        const $tr = $(this).parent().parent();

        if($(this).hasClass('icon-plus--box')){
          $(this).removeClass('icon-plus--box').addClass('icon-reduce--box');
          const index = $tr.attr(`${pluginName}-tr-index`);
          console.log(index)
          const val = _this.settings.dataSource[index];
          const con = _this.getExpanedRow(val);
          $tr.after(con)

        }else {
          $(this).removeClass('icon-reduce--box').addClass('icon-plus--box');
          $tr.next().remove();
        }

      });

    // 如果头部浮动，则把 body 部分左右滚动同步到头部
    if(this.settings.headFixed){
      const $tbodyContainer  = this.GLOBAL.$tbody.parent().parent();
      const $theadContainer = this.GLOBAL.$thead.parent().parent();
      $tbodyContainer.scroll(function () {
        const scrollLeft = $(this).scrollLeft();
        $theadContainer[0].scrollLeft = scrollLeft
      })
    }

  }

  setState(obj, cb) {
    $.extend(this.state, obj)
    cb && $.isFunction(cb) && cb()
  }

  _cache(name, val) {
    if (name in this._cached) {
      return this._cached[name]
    }

    this._cached[name] = $.isFunction(val) ? val() : val

    return this._cached[name]
  }

  groupedColumns(columns) {
    const _groupColumns = (columns, currentRow = 0, parentColumn = {}, rows = []) => {
      // 获取行数
      rows[currentRow] = rows[currentRow] || []
      const grouped = []

      //
      const setRowSpan = column => {
        const rowSpan = rows.length - currentRow
        if (column &&
          !column.children &&
          rowSpan > 1 &&
          (!column.rowSpan || column.rowSpan < rowSpan)
        ) {
          column.rowSpan = rowSpan
        }
      }

      columns.forEach((column, index) => {
        const newColumn = {...column};
        rows[currentRow].push(newColumn);
        parentColumn.colSpan = parentColumn.colSpan || 0;

        if (newColumn.children && newColumn.children.length > 0) {
          newColumn.children = _groupColumns(newColumn.children, currentRow + 1, newColumn, rows);
          parentColumn.colSpan = parentColumn.colSpan + newColumn.colSpan
        } else {
          parentColumn.colSpan++
        }

        // update rowspan to all same row columns
        for (let i = 0; i < rows[currentRow].length - 1; ++i) {
          setRowSpan(rows[currentRow][i])
        }

        // last column, update rowspan immediately
        if (index + 1 === columns.length) {
          setRowSpan(newColumn)
        }
        grouped.push(newColumn)
      });
      return grouped
    }
    return _groupColumns(columns)

  }

  //实际用于渲染的 header 数据
  getHeaderRows(columns, currentRow = 0, rows = []) {
    rows[currentRow] = rows[currentRow] || []

    columns.forEach(column => {
      if (column.rowSpan && rows.length < column.rowSpan) {
        while (rows.length < column.rowSpan) {
          rows.push([])
        }
      }

      const cell = {
        className: column.className || '',
        title: column.title,
        dataIndex: column.dataIndex,
      }

      if (column.sort) {
        $.extend(cell, {sort: column.sort})
      }

      if (column.filter) {
        $.extend(cell, {filter: column.filter})
      }

      if (column.children) {
        this.getHeaderRows(column.children, currentRow + 1, rows)
      }
      if ('colSpan' in column) {
        cell.colSpan = column.colSpan
      }
      if ('rowSpan' in column) {
        cell.rowSpan = column.rowSpan
      }
      if (cell.colSpan !== 0) {
        rows[currentRow].push(cell)
      }
    });
    return rows.filter(row => row.length > 0)
  }

// 标准化数据 并缓存到 cache 里
// colums 为转换后的按行分类的数组
// compilerColumns 为只剩下对应下面 td 的数组
// normalizeColumns 为在来源数组的基础上加上自定义配置后的数组
  normalizeColumns() {

    const columns = this.getHeaderRows(this.groupedColumns(this.settings.columns))
    // 添加序号、checkbox 等的列,并缓存
    this.GLOBAL.columns = this.setExtraCol(columns)

    let compilerColumns = []
    const normalizeColumns = this.settings.columns

    this.getExtraCol().forEach(val => {
      normalizeColumns.unshift(val)
    });

    this.GLOBAL.normalizeColumns = normalizeColumns

    const _compilerColumns = (columns) => {
      return columns.forEach((val, i) => {
        if (val.children && val.children.length > 0) {
          _compilerColumns(val.children)
        } else {
          compilerColumns.push(val)
        }
      })
    }

    _compilerColumns(normalizeColumns)

    this.GLOBAL.compilerColumns = compilerColumns

    return compilerColumns
  }

  wrapTag(str, tag) {
    return `<${tag}>${str}</${tag}>`
  }

  handlerSort(e) {
    const className = 'sort-icon';
    const aceClass = className + '--ace';
    const descClass = className + '--desc';
    // 当前的排序图标
    const $cur = $(e.currentTarget);
    // 除了自己外的 排序 图标
    const $other = this.GLOBAL.$thead.find('.' + className).not($cur);
    const index = $cur.parent().attr('data-col-index');
    const settingData = this.GLOBAL.compilerColumns;
    let data = settingData[index];

    //把其他的排序设为
    settingData.forEach((data, i) => {
      data.toSort && (data.toSort = false)
      if (index != i) {
        data.sortOder = undefined
      }
    });


    $other.removeClass(aceClass + ' ' + descClass);

    if ($cur.hasClass(aceClass)) {
      $cur.removeClass(aceClass).addClass(descClass)
    } else {
      $cur.removeClass(descClass).addClass(aceClass)
    }

    data.toSort = true;

    this.initSort()
  }

  initFilter() {
    const that = this;
    if (!$.fn.olyDropdown) {
      require('../dropdown');
    }

    const $filter = this.GLOBAL.$thead.find('.th__filter');
    this.GLOBAL.$filter = $filter;

    $filter.each(function () {
      const index = $(this).parent().attr('data-col-index');
      const key = that.GLOBAL.compilerColumns[index].dataIndex;
      const _data = that.settings.dataSource.map(item => item[key]);
      // 去重，排序，格式化成对象数组
      const dataSource = _utils.uniq(_data).sort().map(item => {
        return {text: item}
      });

      $(this).olyDropdown({
        dataSource,
        // onVisibleChange:item => console.log(item),
        // 单选
        // onSelect:(item,index) => that.onFilter([index],dataSource,key,$(this)),
        // 多选
        needConfirm: true,
        onConfirm: item => that.onFilter(item, dataSource, key, $(this)),
        onCancel: () => {
          // 重置选中状态
          if ($(this).hasClass('th__filter--active')) {
            $(this).olyDropdown('setState', {selected: []});
            that.onFilter('reset');
          }
        }
      })
    })
  }

  onFilter(arr, data, key, $this) {
    const activeCls = 'th__filter--active';
    const $filter = this.GLOBAL.$filter;
    $filter.removeClass(activeCls);

    // 重置
    if (arguments[0] === 'reset') {
      this.settings.dataSource = this._cached.dataSource;
      this.update();
      return
    }

    // 没有选中值不触发
    if (arr.length > 0) {
      // 其他的漏斗状态设为未选中
      $filter.not($this).each(function () {
        $(this).olyDropdown('setState', {selected: []});
      });

      const val = _utils.getArrFromIndex(data, arr);
      this.settings.dataSource = this._cached.dataSource;

      const _data = this.settings.dataSource.filter(item => {
        return val.some(v => v.text == item[key]);
      });

      $this.addClass(activeCls)
      this.settings.dataSource = _data;

      this.update()
    }


  }

  initSort() {
    const settingData = this.GLOBAL.compilerColumns
    const dataSource = this.settings.dataSource

    const index = _utils.inArray(settingData, {toSort: true})
    const sortData = settingData[index]
    const sort = sortData.sort
    const sortIndex = sortData.dataIndex

    if (sortData.sortOder && sortData.sortOder === 'asc') {
      dataSource.reverse()
    } else {
      // 传递方法进来则直接执行传递的方法
      dataSource.sort((a, b) => {
        if ($.isFunction(sort)) {
          return sort(a, b)
        } else {
          const aa = a[sortIndex], bb = b[sortIndex]

          if ($.isNumeric(aa) && $.isNumeric(bb)) {
            return aa - bb
          }

          if (aa === bb) {
            return 0
          }

          return aa.length - bb.length

        }
      })
    }
    sortData.sortOder = sortData.sortOder ? sortData.sortOder == 'asc' ? 'desc' : 'asc' : this.settings.sortOder
    this.render(true)
  }

  getExtraCol() { //增加序号，checkbox 等额外的列
    const extraCol = [];

    if (this.settings.rowSelection) {
      extraCol.push({
        title: `<input type="checkbox" class="j-checkbox-all" />`,
        className: pluginClassName + '__th-checkbox',
        render: () => {
          return `<input type="checkbox" />`
        }
      })
    }

    if (this.settings.serialNumber) {
      extraCol.push({
        title: '#',
        className: pluginClassName + '__th-checkbox',
        render: (a, index) => {
          return `${index + 1}`
        }
      })
    }

    // icon-plus--box
    if(this.settings.expandedRowRender){
      extraCol.push({
        title: ``,
        className: pluginClassName + '__th-checkbox',
        render: () => {
          return `<i class="icon-expanded icon-plus--box"></i>`
        }
      })
    }

    return extraCol
  }

  setExtraCol(columns) {
    const maxRowSpan = columns.length
    let newColums = columns
    const extraCol = this.getExtraCol()

    extraCol.forEach((val) => {
      val.rowSpan = maxRowSpan
      newColums[0].unshift(val)
    })

    return newColums
  }

  getThead() {
    let _this = this;
    let rows = '';

    const _getTh = (columns, row = '') => {

      columns.forEach(col => {
        let _th = col.title;

        if (!col.colSpan) {
          _this.GLOBAL.compilerColumns.forEach(function (thatCol, i) {
            //TODO 更严谨的判断
            if (col.title === thatCol.title && (col.dataIndex == thatCol.dataIndex )) {
              col.colIndex = i
            }
          })
        }

        if (col.filter) {
          _th += `<i class="icon-filter th__filter"></i>`
        }

        // 排序
        if (col.sort) {
          _th += `<div class="sort-icon"><i class="icon-arrow--up-solid sort-icon__up"></i><i class="icon-arrow--down-solid sort-icon__down"></i></div>`
        }

        const colspan = _utils.IF(col.colSpan, 'colspan')
        const rowspan = _utils.IF(col.rowSpan, 'rowspan')
        const colIndex = _utils.IF(col.colIndex + '', 'data-col-index')
        let className = _utils.classnames(
          col.className, {
            ['J-col']: col.colIndex + 1, // number 0 为false ，所以需要转成string
            ['J-col-sort']: col.sort
          }
        );

        row += `<th ${colspan}${rowspan} ${colIndex} class="${className}">${_th}</th>`

      });

      return row
    };

    this.GLOBAL.columns.forEach(col => {
      rows += _this.wrapTag(_getTh(col), 'tr')
    });

    return `<thead>${rows}</thead>`

  }

  getBodyRows() {
    const compilerColumns = this.GLOBAL.compilerColumns; // 用于遍历每一个列
    const dataSource = this.settings.dataSource;
console.log(dataSource)
    const generateTd = (value, columns, currentRow,tds = '') => {
      columns.forEach((val) => {
        //如果有render 方法的，直接调用render方法，并把这个td的值传进去
        if (val.render) {
          const cellData = value[val.dataIndex];
          // 传递 当前cell 的值 ， 索引 ， 当前行的数据对象
          tds += `<td>${val.render(cellData, currentRow, value)}</td>`
        } else {
          tds += `<td>${value[val.dataIndex]}</td>`
        }
      });

      return tds
    };

    const generateRow = (data,rows = '') => {
      console.log(rows)
      data.forEach((value, index) => {
        console.log(value)
        const row = generateTd(value, compilerColumns, index);
        rows += `<tr ${pluginName}-tr-index="${index}">${row}</tr>`;
        if(value.children) generateRow(value.children,rows)
      });

      return rows
    };


    return generateRow(dataSource)
  }

  getExpanedRow(value){
    const compilerColumns = this.GLOBAL.compilerColumns;
    const colNum = compilerColumns.length;
    const expandedRowRender = this.settings.expandedRowRender;
    return `<tr><td colspan="${colNum}">${expandedRowRender(value)}</td></tr>`
  }

  getTbody() {
    const tbody = this.getBodyRows()
    return `<tbody>${tbody}</tbody>`
  }

  test(val) {
    console.log('I\'m' + JSON.stringify(val))
  }

  getColgroup() {
    let cols = ''

    this.GLOBAL.compilerColumns.forEach(col => {
      cols += `<col style="${col.width ? 'width:' + col.width : ''}" ${_utils.IF(col.className, 'class')}>`
    })

    const colgroup = this.wrapTag(cols, 'colgroup')
    this._cache('$cols', $(cols))

    return colgroup

  }
}

// 对外提供的接口
const openMethod = /setState|submit/;

$.fn[pluginName] = function (props) {
  const args = [].slice.call(arguments, 1)
  this.each(function () {
    const data = $.data(this, 'plugin_' + pluginName)
    if (!data) {
      $.data(this, 'plugin_' + pluginName, new Table(this, props))
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

module.exports = Table

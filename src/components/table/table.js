/* ========================================================================
 * oly-table
 * ========================================================================
 * ======================================================================== */



// 声明默认属性对象
var pluginName = "olyTable",
    pluginClassName = 'oly-table',

    defaults = {
        size: "normal",
        // className: "oly-table",
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
        showThead: true, // 显示 thead
        rowSelection: false, // 是否带check box
        showHeader:true,
        // afterUpdata
    };

const _utils = require('components/utils');

const getCls = name => {
    if(!name){
        return pluginClassName
    }
    return pluginClassName + name;
};

const _cls = {
    colResize: 'col-resize-handle',
    wrapper :getCls('__wrapper'),
    container:getCls('__container'),
    fixHeader:getCls('__fixed-thead'),
    body:getCls('__body'),
    fixed:getCls('--fixed')
}


// 构造函数
function Plugin(element, options) {
    this.$element = element;
    // 将默认属性对象和传递的参数对象合并到第一个空对象中
    this.settings = $.extend({}, defaults, options);
    this._defaults = defaults;
    this._name = pluginName;
    //放置一些全局要用的变量，如jquery 对象
    this.GLOBAL = {};
    this._cached = {};
    this.state = {};
    this.init();
}

Plugin.VERSION = '0.0.1';

// 为了避免和原型对象Plugin.prototype的冲突，这地方采用继承原型对象的方法
$.extend(Plugin.prototype, {
    init: function () {
        this.extensions && this.extensions()
        this.beforeRender();
        this.render();
        this.afterRender();

    },
    getHtml: function () {
        const thead = this.getThead(),
            tbody = this.getTbody(),
            _settings = this.settings,
            isheadFixed = _settings.headFixed,
            colgroup = this.getColgroup();

        const classnames = require('classnames');
        const className = classnames(
            getCls(),
            {
                [_settings.className]:_settings.className,
                [getCls('--fixed')]:_settings.headFixed || _settings.colResize
            }
        )

        function getTable(con) {
            return `<table class="${className}">${colgroup}${con}</table>`;
        }

        function getWrapper(con) {
            return `<div class="${_cls.wrapper}"><div class="${_cls.container}">${con}</div></div>`
        }

        let html = '';

        if (isheadFixed) {
            html = getWrapper(`<div class="${_cls.fixHeader}">${getTable(thead)}</div><div class="${_cls.body}">${getTable(tbody)}</div>`);
        } else if (!_settings.showHeader) {
            html = getWrapper(`${getTable(tbody)}`);
        } else {
            html = getWrapper(`${getTable(thead + tbody)}`);
        }

        return html;
    },
    render: function () {
        const $element = $(this.$element);
        const $html = $(this.getHtml());

        $element.append($html);

        this.GLOBAL.$table = $html;
    },
    setColResize: function () {

        if (!this.settings.colResize) {
            return
        }


        const $element = $(this.$element);
        const _this = this;

        function getColResize() {
            let colResizeHandle = '';
            _this._cache('compilerColumns').forEach((x, i) => {
                // console.log($element.find('col').eq(index).width())
                colResizeHandle += `<div class="${_cls.colResize}" data-index="${i}"></div>`
            });
            // 返回jquery 对象
            return $(colResizeHandle)
        }

        const $colResize = getColResize();

        const $useTh = $element.find('thead:first .J-col');
        // 按照看到的顺序排序
        $useTh.sort((a, b) => {
            return a.attributes['data-col-index'].value - b.attributes['data-col-index'].value;
        });

        const setColResizeProps = (needTop) =>{
            let colX = 0;
            $useTh.each(function (index) {
                const h = $(this).outerHeight();
                colX += $(this).outerWidth();

                const _css = {height: h, left: colX - 4}
                if(needTop === 'needTop'){
                    $.extend(_css,{
                        top:$(this).position().top
                    })
                }
                $colResize.eq(index).css(_css)
            })
        };

        setColResizeProps('needTop');

        $element.find('.oly-table__wrapper').append($colResize);

        // $colResize.olyDrage()
        let _startW = 0;
        let $col = null;
        $element.olyDrage({
            target: '.col-resize-handle',
            direction:'x',
            onDrageStart: function () {
                const index = $(this).attr('data-index');
                $col = $element.find('colgroup').find('col:eq('+ index +')');
                _startW = $col.width();

            },
            onDraging: function (opt) {
                $col.width(_startW + opt.disX)
            },
            onDrageEnd: function () {
                setColResizeProps();
            }
        });

    },
    destroy: function () {
        console.log(this)
    },
    beforeRender: function () {
        // 标准化数据
        this.normalizeColumns();

        this.settings.beforeRender && this.settings.beforeRender($(this.$element))
    },
    // 组件渲染完成后执行，可以在这里初始化其他组件
    afterRender: function () {

        this.setColResize();
        this.bindHandler();
        this.settings.afterRender && this.settings.afterRender($(this.$element))
    },
    bindHandler: function () {
        const _this = this;
        let select = [];
        const $table = this.GLOBAL.$table;

        console.log($table)

        // tr 点击事件
        $table.on('click', 'tbody tr', function () {
            const index = $(this).attr(pluginName + "-tr-index");

            $(this).addClass(_this.settings.rowActiveClass)

            // 调 onRowClick 时间，第一个参数当前tr的jquery对象 ，第二个参数：当前行的数据对象
            _this.settings.onRowClick && _this.settings.onRowClick($(this), _this.settings.dataSource[index])
        })
        // checkbox 选择事件
            .on("click", 'input:checkbox', function () {

                if ($(this).hasClass('j-checkbox-all')) {
                    let $otherCheckbox = $table.find('input').not($(this))


                    if (this.checked) {
                        select = []
                        $otherCheckbox.prop('checked', true);
                        $.each($otherCheckbox, function (index, val) {
                            select.push(val.value)
                        })
                    } else {
                        $otherCheckbox.prop('checked', false)
                    }
                    return
                }

                if (this.checked) {
                    _utils._arrayDel(select, this.value)
                    select.push(this.value)
                } else {
                    _utils._arrayDel(select, this.value)
                }
            })
            .on('click','.J-col-sort',function () {
                _this.sort('email')
            })
    },
    setState:function (obj,cb) {
        $.extend(this.state,obj);
        cb && $.isFunction(cb) && cb();
    },
    _cache: function (name, val) {
        if (name in this._cached) {
            return this._cached[name];
        }

        this._cached[name] = $.isFunction(val) ? val() : val;

        return this._cached[name];
    },
    groupedColumns: function (columns) {
        const _groupColumns = (columns, currentRow = 0, parentColumn = {}, rows = []) => {
            // 获取行数
            rows[currentRow] = rows[currentRow] || [];
            const grouped = [];

            //
            const setRowSpan = column => {
                const rowSpan = rows.length - currentRow;
                if (column &&
                    !column.children &&
                    rowSpan > 1 &&
                    (!column.rowSpan || column.rowSpan < rowSpan)
                ) {
                    column.rowSpan = rowSpan;
                }
            };

            columns.forEach((column, index) => {
                const newColumn = {...column};
                rows[currentRow].push(newColumn);
                parentColumn.colSpan = parentColumn.colSpan || 0;

                if (newColumn.children && newColumn.children.length > 0) {
                    newColumn.children = _groupColumns(newColumn.children, currentRow + 1, newColumn, rows);
                    parentColumn.colSpan = parentColumn.colSpan + newColumn.colSpan;
                } else {
                    parentColumn.colSpan++;
                }

                // update rowspan to all same row columns
                for (let i = 0; i < rows[currentRow].length - 1; ++i) {
                    setRowSpan(rows[currentRow][i]);
                }

                // last column, update rowspan immediately
                if (index + 1 === columns.length) {
                    setRowSpan(newColumn);
                }
                grouped.push(newColumn);
            });
            return grouped;
        };
        return _groupColumns(columns);

    },
    getHeaderRows: function (columns, currentRow = 0, rows = []) {
        rows[currentRow] = rows[currentRow] || [];

        columns.forEach((column, index) => {
            if (column.rowSpan && rows.length < column.rowSpan) {
                while (rows.length < column.rowSpan) {
                    rows.push([]);
                }
            }
            const cell = {
                className: column.className || '',
                title: column.title,
                dataIndex: column.dataIndex,
                sort:column.sort
            };
            if (column.children) {
                this.getHeaderRows(column.children, currentRow + 1, rows);
            }
            if ('colSpan' in column) {
                cell.colSpan = column.colSpan;
            }
            if ('rowSpan' in column) {
                cell.rowSpan = column.rowSpan;
            }
            if (cell.colSpan !== 0) {
                rows[currentRow].push(cell);
            }
        });
        return rows.filter(row => row.length > 0);
    },
    // 标准化数据 并缓存到 cache 里
    // colums 为转换后的按行分类的数组
    // compilerColumns 为只剩下对应下面 td 的数组
    // normalizeColumns 为在来源数组的基础上加上自定义配置后的数组
    normalizeColumns: function () {

        const columns = this.getHeaderRows(this.groupedColumns(this.settings.columns));
        // 添加序号、checkbox 等的列,并缓存
        this._cache('columns', this.setExtraCol(columns))


        let compilerColumns = [];
        const normalizeColumns = this.settings.columns;

        this.getExtraCol().forEach(val => {
            normalizeColumns.unshift(val)
        });

        this._cache('normalizeColumns', normalizeColumns);


        const _compilerColumns = (columns) => {

            return columns.forEach((val, i) => {
                if (val.children && val.children.length > 0) {
                    _compilerColumns(val.children)
                } else {
                    compilerColumns.push(val)
                }
            })
        };

        _compilerColumns(normalizeColumns);

        this._cache('compilerColumns', compilerColumns);

        return compilerColumns

    },
    wrapTag: function (str, tag) {
        return `<${tag}>${str}</${tag}>`
    },
    sort:function (arg,func) {
        const dataSource = this.settings.dataSource;

        // 传递方法进来则直接执行传递的方法
        dataSource.sort((a,b) => {
            if($.isFunction(arg)){
                return arg(a,b)
            }else {
                if($.isNumeric(a[arg])){
                    return a[arg] - b[arg]
                }
            }
        });

        this.updata();
        func && func();
    },
    setDataSource:function (data,func) {
        this.settings.dataSource = data;
        this.updata();
        func && func();
    },
    updata:function () {
        const tbody = this.getBodyRows(this.settings.dataSource);
        // this.GLOBAL.$table.find('tbody').html(tbody);
        this.GLOBAL.$table.find('tbody').html(tbody);
    },
    getExtraCol: function () { //增加序号，checkbox 等额外的列
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

        return extraCol

    },
    setExtraCol: function (columns) {
        const maxRowSpan = columns.length;
        let newColums = columns;
        const extraCol = this.getExtraCol();

        extraCol.forEach((val) => {
            val.rowSpan = maxRowSpan;
            newColums[0].unshift(val)
        })

        return newColums
    },
    getThead: function () {
        let _this = this;
        const settings = this.settings;
        let rows = ''

        const _getTh = (columns, row = '') => {

            columns.forEach(col => {
                let _th = col.title;

                if (!col.colSpan) {
                    _this._cached.compilerColumns.forEach(function (thatCol, i) {
                        //TODO 更严谨的判断
                        if (col.title === thatCol.title && (col.dataIndex == thatCol.dataIndex )) {
                            col.colIndex = i;
                        }
                    })
                }

                //TODO 排序，晒选等内容
                if (col.sort) {
                    _th += `<a href="javascript:">#</a>`;

                }


                const colspan = _utils._IF(col.colSpan, 'colspan');
                const rowspan = _utils._IF(col.rowSpan, 'rowspan');
                const colIndex = _utils._IF(col.colIndex + '', 'data-col-index');
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

        this._cached.columns.forEach(col => {
            rows += _this.wrapTag(_getTh(col), 'tr');
        });


        return `<thead>${rows}</thead>`;
    },

    getBodyRows: function (dataSource) {
        let tbody = '',
            row = '';

        const compilerColumns = this._cache('compilerColumns')

        const _getBodyRow = (value, columns, currentRow) => {

            columns.forEach((val) => {
                //如果有render 方法的，直接调用render方法，并把这个td的值传进去
                if (val.render) {
                    const cellData = value[val.dataIndex]
                    // 传递 当前cell 的值 ， 索引 ， 当前行的数据对象
                    row += `<td>${val.render(cellData, currentRow, value)}</td>`
                } else {
                    row += `<td>${value[val.dataIndex]}</td>`
                }
            });

            return row
        };

        dataSource.forEach((value, index) => {

            row = '';
            _getBodyRow(value, compilerColumns, index);
            tbody += `<tr ${pluginName}-tr-index="${index}">${row}</tr>`

        });

        return tbody
    },
    test:function (a) {
      console.log(a,222)
    },
    getTbody: function () {
        const data = this.settings.dataSource;
        const tbody = this.getBodyRows(data);

        return `<tbody>${tbody}</tbody>`
    },
    getColgroup: function () {
        let cols = '';

        this._cache('compilerColumns').forEach(col => {
            cols += `<col style="${col.width ? 'width:' + col.width : ''}" ${_utils._IF(col.className, 'class')}>`
        });

        const colgroup = this.wrapTag(cols, 'colgroup');
        this._cache('$cols', $(cols))

        return colgroup

    },
    // 用 for 循环实现，但是性能没提升
    // getTbodyf: function () {
    //     let tbody = '',
    //         data = this.settings.dataSource,
    //         columns = this.settings.columns;
    //     for(let i=0,l=data.length; i < l;i++) {
    //         // 一行数据
    //         let tr = '';
    //
    //         for(let ii = 0,ll = columns.length;ii < ll;ii++) {
    //             tr += `<td>${data[i][columns[ii].dataIndex]}</td>`
    //         }
    //
    //         tbody += `<tr>${tr}</tr>`
    //     }
    //
    //     const dom = `<tbody>${tbody}</tbody>`
    //
    //     return dom
    // }
});

//
$.fn[pluginName] = function (options) {
    const args = Array.prototype.slice.call(arguments, 1);
    this.each(function () {
        const data = $.data(this, "plugin_" + pluginName);
        if (!data) {
            $.data(this, "plugin_" + pluginName, new Plugin(this, options));
        }else {
          if(typeof options === 'string'){
            data[options].call(data,args)
          }
        }
    });

    // 方便链式调用
    return this;
};

module.exports = Plugin;

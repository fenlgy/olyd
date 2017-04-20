import 'style/index.less'
import Mock from 'mockjs'
require('components')

var colums = [
    {title: '姓名', dataIndex: 'name', width: '100px'},
    {
        title: "联系方式", children: [
        {title: '地址', dataIndex: 'address', width: '100px'},
        {
            title: '手机', dataIndex: 'phone', width: '120px', render: function (text) {
            return '<a href="mailto:' + text + '">' + text + '</a>'
        }
        }, {
            title: '二级',
            children: [
                {title: '地址', dataIndex: 'address1', width: '100px'},
                {
                    title: '手机', dataIndex: 'phone1', width: '120px', render: function (text) {
                    return '<a href="mailto:' + text + '">' + text + '</a>'
                }
                }, {
                    title: '三级',
                    children: [
                        {title: '地址', dataIndex: 'address2', width: '100px'},
                        {
                            title: '手机', dataIndex: 'phone2', width: '100px', render: function (text) {
                            return '<a href="mailto:' + text + '">' + text + '</a>'
                        }
                        }
                    ]
                }
            ]
        }
    ]
    },

    {
        title: '邮箱', dataIndex: 'email', width: '100px', render: function (text) {
        return '<a href="mailto:' + text + '">' + text + '</a>'
    }, sort: true,
    },
    {title: '年龄', dataIndex: 'year', width: '80px'},
    {
        title: '操作', render: function () {
        return '<a href="#">详情</a>'
    }
    }
]

var colums1 = [
    {title: '姓名', dataIndex: 'name', width: '50px'},
    {title: '地址', dataIndex: 'address'},
    {title: '手机', dataIndex: 'phone'},
    {
        title: '邮箱',
        dataIndex: 'email',
        width: "180px",
        sort: true,
        filter:'',
        render: function (text) {
            return '<a href="mailto:' + text + '">' + text + '</a>'
        }
    },
    {title: '年龄', dataIndex: 'year'},
    {
        title: '操作', render: function () {
        return '<a href="#">详情</a>'
    }
    }
]

// 使用 Mock
var dataSource = Mock.mock({
    'list|100': [{
        name: '@cname',
        address: "@city",
        address1: "@city",
        address2: "@city",
        "phone|13900000000-13999999999": 1,
        "phone1|13900000000-13999999999": 1,
        "phone2|13900000000-13999999999": 1,
        email: "@email",
        "year|20-35": 1
    }]
})

var dataSource1 = Mock.mock({
    'list|8': [{
        name: '@cname',
        address: "@city",
        "phone|13900000000-13999999999": 1,
        email: "@email",
        "year|20-35": 1
    }]
})


$('#app').olyTable({
    columns: colums,
    dataSource: dataSource.list,
    className: 'test ddddd',
    onRowClick: function (ele, data) {
//                console.log(ele, data)
    },
    rowSelection: true,
    colResize: true,
    serialNumber: true,
    headFixed: true,
    afterRender: function (item) {
        console.log('after render', item)
    }
})

$('#app1').olyTable({
    columns: colums1,
    rowSelection: true,
    colResize: true,
    // showHeader:false,
    dataSource: dataSource1.list,
})

var instance = $("#app").data('plugin_olyTable');

$('#app1').olyTable('test',{a:11})

console.log(instance)

$('button').on('click', function (reverse = false) {

    if (reverse) {
        instance.sort('year')
    } else {
        reverse = !reverse
        instance.sort('year')
    }
    console.log(reverse)

    return reverse
})
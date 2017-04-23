# Tabs
继承全部 antd 中的 tabs 方法

## API
成员 | 说明 | 类型 | 默认值
---|---|---|---
size|表格大小 `small` `normal` `large`|string| normal
className|增加 table 的样式 |string| -
rowActiveClass|选中行样式 |string| -
columns|  | String | -
dataSource |  属性 | Object | -
loading||Function|() => document.body
bordered||Function|() => document.body
colResize|自由拖动列头宽度|boolean|false
serialNumber|是否显示序号|boolean|false
rowSelection|是否需要 checkbox |boolean|false
sortOder|排序方式 `asc` `desc`|string| 'asc'
showHeader|是否显示表头|boolean| true
height | 表格高度 |number| -
setter| 更新表格数据 |number| -


### columns
成员 | 说明 | 类型 | 默认值
---|---|---|---
title|列头显示文字|string|-
toSort|该列是否需要在初始化的时候排序|boolean| undefine
sortOder|排序方式 `asc` `desc`,不设置则取全局的排序方式|string| -
sort|设置为 `true` 则用默认排序，也可以按照 js 的 sort 方法写自己的表达式|boolean \| function|false
render|ddd|ddd|dd
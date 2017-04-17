/**
 * Created by Administrator on 2017/4/14.
 */


// 如果变量有值则输出本身，没值则不输出
// 等式输出用于class，之类的html类标签属性
function _IF(variable, equ) {
    if (equ) {
        return variable ? `${equ}="${variable}"` : ''
    } else {
        return variable ? variable : ''
    }
}

function _arrayDel(arr, val) {
    var index = $.inArray(val, arr)
    if (index > -1) {
        arr.splice(index, 1)
    }

    return arr
}

module.exports = {
    _IF:_IF,
    _arrayDel:_arrayDel,
    classnames:require('classnames'),
    moment:require('moment')
}
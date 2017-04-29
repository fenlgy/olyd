/**
 * Created by Administrator on 2017/4/14.
 */


// 如果变量有值则输出本身，没值则不输出
// 等式输出用于class，之类的html类标签属性
function IF(variable, equ) {

    if (!variable || variable === 'undefined') {
        return ''
    }

    return equ ? `${equ}="${variable}"` : variable

}

function arrayDel(arr, val) {
    var index = $.inArray(val, arr)
    if (index > -1) {
        arr.splice(index, 1)
    }

    return arr
}

// 数组对象
// @param arr 数组或数组对象
// @param opts
function inArrary(arr, opts) {
    const isObject = $.isPlainObject(opts);
    const key = isObject && Object.keys(opts)[0]

    function getIndex(arr, opts, i = -1) {

        arr.forEach((_arr, index) => {
            if(isObject){
                if(_arr[key] === opts[key]){
                    i = index
                }

            }else {
                if(_arr === opts){
                    i = index
                }
            }
            })
        return i
    }
    return getIndex(arr, opts)
}


function installExtensions() {

}

module.exports = {
    IF: IF,
    arrayDel: arrayDel,
    classnames: require('classnames'),
    moment: require('moment'),
    inArray:inArrary,
    installExtensions: installExtensions,
  keycode:require('./keycode')
}
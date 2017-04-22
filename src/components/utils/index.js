/**
 * Created by Administrator on 2017/4/14.
 */


// 如果变量有值则输出本身，没值则不输出
// 等式输出用于class，之类的html类标签属性
function _IF(variable, equ) {

    if(!variable || variable === 'undefined'){
        return ''
    }

    return  equ ? `${equ}="${variable}"` : variable

}

function _arrayDel(arr, val) {
    var index = $.inArray(val, arr)
    if (index > -1) {
        arr.splice(index, 1)
    }

    return arr
}

// 数组对象
// @param opt
function inArrary(opt,arr) {
    let i = -1;
    arr.forEach( (arr,index) => {
        if(arr[i] === opt){
            i = index
        }
    })


    if(typeof opt === 'string'){

    }else if(typeof  opt === 'object'){
        arr.forEach( (arr,index) => {
            if(arr[opt.key] === opt.value){
                i = index
            }
        })
    }

    return i
}

function installExtensions(){

}

module.exports = {
    _IF:_IF,
    _arrayDel:_arrayDel,
    classnames:require('classnames'),
    moment:require('moment'),
    installExtensions:installExtensions
}
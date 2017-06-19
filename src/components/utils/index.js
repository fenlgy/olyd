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

// 返回索引
// @param arr 数组或数组对象
// @param opts
function inArray(arr, opts) {
  const isObject = $.isPlainObject(opts);
  const key = isObject && Object.keys(opts)[0]

  function getIndex(arr, opts, i = -1) {

    arr.forEach((_arr, index) => {
      if (isObject) {
        if (_arr[key] === opts[key]) {
          i = index
        }

      } else {
        if (_arr === opts) {
          i = index
        }
      }
    })
    return i
  }

  return getIndex(arr, opts)
}

const strToJson = function (str) {
  const json = (new Function("return " + str))();
  return json;
};

// 返回指定索引的数组中的值，
// 返回类型也是数组
// @param index 数组或者可以转换为number的数字
function getArrFromIndex(arr,index) {
  let ret=[];
  if($.isArray(index)){
    index.forEach( item => {
      ret.push(arr[item])
    })
  }
  if($.isNumeric(index)){
    ret = arr[index]
  }
  return ret;
}


function installExtensions() {

}

module.exports = {
  IF,
  arrayDel,
  inArray,
  strToJson,
  getArrFromIndex,
  installExtensions,
  uniq:require('lodash.uniq'),
  isEqual:require('lodash.isequal'),
  keycode: require('./keycode'),
  classnames: require('classnames'),
  moment: require('moment'),
}
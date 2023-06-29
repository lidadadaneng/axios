var bind = require('./helpers/bind');

var toString = Object.prototype.toString;

/**
 * 判断是否是一个字符串
 * @param {Object} val
 * @returns {boolean}
 */
function isString(val) {
    return typeof val === 'string';
}

/**
 * 判断是否是 undefined
 * @param {Object} val
 * @returns {boolean}
 */
function isUndefined(val) {
    return typeof val === 'undefined';
}

/**
 * 判断是否是对象
 * @param {Object} val
 * @returns {boolean}
 */
function isObject(val) {
    return val !== null && typeof val === 'object';
}

/**
 * 判断是否是一个函数
 * @param {Object} val
 * @returns {boolean}
 */
function isFunction(val) {
    return toString.call(val) === '[object Function]';
}

/**
 * 判断对象是否是普通对象
 * @param {Object} val
 * @return {boolean}
 */
function isPlainObject(val) {
    if (toString.call(val) !== '[object Object]') {
        return false;
    }

    var prototype = Object.getPrototypeOf(val);
    return prototype === null || prototype === Object.prototype;
}

/**
 * 判断是否是数组
 * @param {Object} val
 * @returns {boolean}
 */
function isArray(val) {
    return toString.call(val) === '[object Array]';
}

/**
 * 判断是否可以使用 URLSearchParams, 浏览器和Node环境均可使用, 但低版本浏览器要使用需要安装 npm install --save url-search-params
 * URLSearchParams 能帮助你快速解析URL中的参数请求, 也能帮助你快速拼接URL中需要的参数形式
 * @param {Object} val
 * @returns {boolean}
 */
function isURLSearchParams(val) {
    return typeof URLSearchParams !== 'undefined' && val instanceof URLSearchParams;
}

/**
 * 判断是否是日期类型
 * @param {Object} val
 * @returns {boolean}
 */
function isDate(val) {
    return toString.call(val) === '[object Date]';
}

/**
 * 判断是否是 FormData 对象
 * @param {Object} val
 * @returns {boolean}
 */
function isFormData(val) {
    return (typeof FormData !== 'undefined') && (val instanceof FormData);
}

/**
 * 判断是否是一个 ArrayBuffer 类型
 * @param {Object} val
 * @returns {boolean}
 */
function isArrayBuffer(val) {
    return toString.call(val) === '[object ArrayBuffer]';
}

/**
 * 判断是否是一个 Buffer 类型
 * @param {Object} val
 * @returns {boolean}
 */
function isBuffer(val) {
    return val !== null && !isUndefined(val) && val.constructor !== null && !isUndefined(val.constructor)
        && typeof val.constructor.isBuffer === 'function' && val.constructor.isBuffer(val);
}

/**
 * 判断是否是一个 Stream 类型
 * @param {Object} val
 * @returns {boolean}
 */
function isStream(val) {
    return isObject(val) && isFunction(val.pipe);
}

/**
 * 判断是否是一个 File 类型
 * @param {Object} val
 * @returns {boolean}
 */
function isFile(val) {
    return toString.call(val) === '[object File]';
}

/**
 * 判断是否是一个 Blob 类型
 * @param {Object} val
 * @returns {boolean}
 */
function isBlob(val) {
    return toString.call(val) === '[object Blob]';
}

/**
 * 判断是否是一个 isArrayBufferView
 * @param {Object} val
 * @returns {boolean}
 */
function isArrayBufferView(val) {
    var result;
    if ((typeof ArrayBuffer !== 'undefined') && (ArrayBuffer.isView)) {
        result = ArrayBuffer.isView(val);
    } else {
        result = (val) && (val.buffer) && (val.buffer instanceof ArrayBuffer);
    }
    return result;
}

/**
 * 去除头尾空格
 * @param {String} str
 * @returns {String}
 */
function trim(str) {
    return str.trim ? str.trim() : str.replace(/^\s+|\s+$/g, '');
}

/**
 * 重写 forEach
 * @param {Object|Array} obj
 * @param {Function} fn
 * @returns
 */
function forEach(obj, fn) {
    if (obj === null || typeof obj === 'undefined') return;
    // 不是对象类型, 则变成一个数组, 如函数
    if (typeof obj !== 'object') obj = [obj];

    if (isArray(obj)) {
        for (var i = 0, l = obj.length; i < l; i++) {
            fn.call(null, obj[i], i, obj);
        }
    } else {
        for (var key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                fn.call(null, obj[key], key, obj);
            }
        }
    }
}

/**
 * 扩展对象 a 身上的属性, 会将 b 身上的属性拷贝到 a 身上
 * @param {Object} a
 * @param {Object} b
 * @param {Object} thisArg: this 指向
 */
function extend(a, b, thisArg) {
    forEach(b, function assignValue(val, key) {
        if (thisArg && typeof val === 'function') {
            a[key] = bind(val, thisArg);
        } else {
            a[key] = val;
        }
    });
    return a;
}

/**
 * 接收多个对象进行合并
 * @param {Object} obj1
 * @returns {Object}
 */
function merge(/* obj1, obj2, obj3, ... */) {
    var result = {};
    function assignValue(val, key) {
        if (isPlainObject(result[key]) && isPlainObject(val)) {
            result[key] = merge(result[key], val);
        } else if (isPlainObject(val)) {
            result[key] = merge({}, val);
        } else if (isArray(val)) {
            result[key] = val.slice();
        } else {
            result[key] = val;
        }
    }

    for (var i = 0, l = arguments.length; i < l; i++) {
        forEach(arguments[i], assignValue);
    }
    return result;
}

module.exports = {
    isString: isString,
    isUndefined: isUndefined,
    isArray: isArray,
    isObject: isObject,
    isPlainObject: isPlainObject,
    isDate: isDate,
    isFunction: isFunction,
    isFormData: isFormData,
    isArrayBuffer: isArrayBuffer,
    isBuffer: isBuffer,
    isStream: isStream,
    isFile: isFile,
    isBlob: isBlob,
    isArrayBufferView: isArrayBufferView,
    isURLSearchParams: isURLSearchParams,
    trim: trim,
    forEach: forEach,
    extend: extend,
    merge: merge
}

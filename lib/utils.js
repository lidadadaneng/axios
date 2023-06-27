var bind = require('./helpers/bind');
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
// 判断是否是数组
function isArray(val) {
    return toString.call(val) === '[object Array]';
}
// 重写 forEach
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
module.exports = {
    extend: extend,
    isArray: isArray,
    forEach: forEach,
}

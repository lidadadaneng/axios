/**
 * "取消对象": 请求被取消后生成的一个对象, 这个会存储这个请求被取消时传递的一些信息
 * @class
 * @param {string=} message: 手动执行 cancel(message) 中的 message信息, 如例子中的 "这个请求已经被取消"
 */
function Cancel(message) {
    this.message = message;
}

/**
 * 在取消对象身上挂载 toString() 方法, 方便我们直接查询 取消对象 的信息
 * 例如: var o = new Object(); o.toString(); => [object Object]
 */
Cancel.prototype.toString = function toString() {
    return 'Cancel' + (this.message ? ': ' + this.message : '');
};

// 在取消对象原型上做一个取消标识, 方法后续的判断
Cancel.prototype.__CANCEL__ = true;

module.exports = Cancel;

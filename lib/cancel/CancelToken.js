// lib/cancel/CancelToken.js
var Cancel = require('./Cancel');

/**
 * 取消请求的操作: 该函数在使用时, 会先被实例化, 会在 this 身上储存很多东西, 等待被传递到 xhr.js 文件中被调用使用.
 * @param {Function} executor: 外部使用时需要传递进来的回调函数, 当我们内部执行 executor 函数时, 会传递另一个函数作为参数, 函数的内容主要是去执行 abort() 方法
 */
function CancelToken(executor) {
    if (typeof executor !== 'function') {
        throw new TypeError('CancelToken 接收的参数必须是一个参数');
    }
    // 实例化一个 Promise 对象, 然后把这个 Promise 挂载在 CancelToken 方法身上暴露出去
    var resolvePromise;
    this.promise = new Promise(function promiseExecutor(resolve) {
        resolvePromise = resolve;
    });

    // 把 this 重写成 token 会更加形象, 因为本身每个请求就是需要一个唯一的 token 来标识
    var token = this;

    /**
     * 执行外部传递的 executor(c) 方法, 并传递出另一个函数作为参数
     * @param {Function} cancel: 暴露给 "外部" 手动执行 promise 的方法
     */
    executor(function cancel(message) {
        // 已经取消了的请求会在 reason 做一个标识
        if (token.reason) return;
        // 请求取消后, 生成取消对象
        token.reason = new Cancel(message);
        // 执行 promise 的 resolve() 并把 "取消对象" 传递出去, 方便后续外部请求判断
        resolvePromise(token.reason);
    });
}
CancelToken.prototype.throwIfRequested = function (){
    if(this.reason){
        throw this.reason
    }
}

CancelToken.source = function source() {
    var cancel;
    var token = new CancelToken(function executor(c) {
        cancel = c;
    });
    return {
        token: token,
        cancel: cancel
    };
};

module.exports = CancelToken;

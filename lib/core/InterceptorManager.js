var utils = require('./../utils');

function InterceptorManager() {
    this.handlers = []; // 拦截器可以有多个
}
/**
 * 收集拦截器的回调函数
 * @param {Function} fulfilled
 * @param {Function} rejected
 * @param {Object} options: 拦截器配置, {synchronous, runWhen}
 * @return {Number}: .use() 方法执行后, 返回当前拦截器总个数, 实际也就是当前这个拦截器的索引
 */
// 注册 use() 方法
InterceptorManager.prototype.use = function use(fulfilled, rejected, options) {
    this.handlers.push({
        fulfilled: fulfilled,
        rejected: rejected,
        synchronous: options ? options.synchronous : false, // 默认情况下, axios 的拦截器是异步执行, 当添加请求拦截器时，可以通过 synchronous 来控制是否要同步执行
        runWhen: options ? options.runWhen : null, // 可以自定义提供一个函数, 用于验证请求是否能执行该拦截器
    });
    return this.handlers.length - 1;
}

/**
 * 实现一个 forEach方法, 用于迭代所有的拦截器
 * @param {Function} fn: 接收一个函数, 会执行函数, 把拦截器传递出去
 */
InterceptorManager.prototype.forEach = function forEach(fn) {
    utils.forEach(this.handlers, function forEachHandler(h) {
        // 循环到被移除的拦截不处理
        if (h !== null) {
            fn(h);
        }
    });
};

// 注册移除拦截器方法
InterceptorManager.prototype.eject = function eject(id) {
    if (this.handlers[id]) {
        this.handlers[id] = null; // 把要移除的拦截器赋值为空
    }
};

module.exports = InterceptorManager

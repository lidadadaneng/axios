// lib/core/Axios.js
var dispatchRequest = require('./dispatchRequest'); // 引入新文件
var InterceptorManager = require('./InterceptorManager'); // 引入拦截器
var mergeConfig = require('./mergeConfig'); // 引入合并函数

function Axios(instanceConfig) {
    this.defaults = instanceConfig; // 保存默认配置
    // 初始化拦截器容器
    this.interceptors = {
        request: new InterceptorManager(),
        response: new InterceptorManager()
    };

}

// axios内部发送网络请求的核心方法, config 参数就是我们传递的请求配置信息
Axios.prototype.request = function request(config) {
    // 允许 config 为字符串类型, 能直接传递一个 URL
    // 例如: axios.get(url, config) ; 更多查看: https://www.axios-http.cn/docs/instance
    if (typeof config === 'string') {
        config = arguments[1] || {}; // 取第二个参数作为请求配置
        config.url = arguments[0];
    } else {
        config = config || {};
    }
    // 默认配置 与 请求配置 进行合并
    config = mergeConfig(this.defaults, config);


    // 设置请求方式, 默认为 get, 都统一转成小写, 但在 xhr.js 中会统一转成大写
    if (config.method) {
        config.method = config.method.toLowerCase();
    } else if (this.defaults.method) {
        config.method = this.defaults.method.toLowerCase();
    } else {
        config.method = 'get';
    }
    // 拦截器是否是同步执行的
    var synchronousRequestInterceptors = true;

    // 请求拦截器
    var requestInterceptorChain = [];
    // 主要这里的 forEach() 方法会在 InterceptorManager.js 文件中注册
    this.interceptors.request.forEach(function unshiftRequestInterceptors(interceptor) {
        // 判断是否提供了使用拦截器的判断条件, 如果提供了拦截器的使用条件, 则需要通过才会执行拦截器, 否则该请求不执行拦截器
        if (typeof interceptor.runWhen === 'function' && interceptor.runWhen(config) === false) return;
        // 可以配置 synchronous 使 axios 变成同步执行, 默认是异步的, true && false => false
        synchronousRequestInterceptors = synchronousRequestInterceptors && interceptor.synchronous;
        // 往头部依次插入拦截器回调, 这也就是为什么开头例子提到的 请求拦截器 会是倒序执行的原因
        requestInterceptorChain.unshift(interceptor.fulfilled, interceptor.rejected);
    });

    // 响应拦截器, 不需要考虑其他配置、执行顺序问题，直接取出来等着被执行就行
    var responseInterceptorChain = [];
    this.interceptors.response.forEach(function pushResponseInterceptors(interceptor) {
        responseInterceptorChain.push(interceptor.fulfilled, interceptor.rejected);
    });

    var promise;

    // 异步执行
    if (!synchronousRequestInterceptors) {
        // 这里的 undefined 主要作用是保持完整性, 成功与失败
        var chain = [dispatchRequest, undefined];

        // 加入拦截器
        Array.prototype.unshift.apply(chain, requestInterceptorChain); // 往头部添加 请求拦截器
        chain = chain.concat(responseInterceptorChain); // 往尾部添加 响应拦截器

        // 构建一个 fulfilled 状态的 Promise, 为后续的 Promise链 做准备
        promise = Promise.resolve(config);

        // 依次执行所有的回调函数
        while (chain.length) {
            promise = promise.then(chain.shift(), chain.shift()); // 以 Promise链 来执行并传递结果
        }

        return promise;
    }


    var newConfig = config;

    // 执行请求拦截器 - 同步
    while (requestInterceptorChain.length) {
        // 从头部开始获取并删除
        var onFulfilled = requestInterceptorChain.shift();
        var onRejected = requestInterceptorChain.shift();
        try {
            newConfig = onFulfilled(newConfig); // 执行
        } catch (error) {
            onRejected(error); // 执行
            break;
        }
    }

    // 发送请求 - 异步
    try {
        promise = dispatchRequest(newConfig);
    } catch (error) {
        return Promise.reject(error);
    }

    // 执行响应拦截器 - 同步
    while (responseInterceptorChain.length) {
        // 从尾部开始获取并删除
        promise = promise.then(responseInterceptorChain.shift(), responseInterceptorChain.shift());
    }

    return promise;
}
// 其他便捷方法
Axios.prototype.get = function () {
}
Axios.prototype.post = function () {
}

module.exports = Axios

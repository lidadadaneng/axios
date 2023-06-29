// lib/core/dispatchRequest.js
var defaults = require('../defaults'); // 引入新文件
var isCancel = require('../cancel/isCancel');
var transformData = require('./transformData'); // 引入新文件
var utils = require('./../utils');

/**
 * 过滤已取消的请求
 * @param {*} config
 */
function throwIfCancellationRequested(config) {
    if (config.cancelToken) {
        config.cancelToken.throwIfRequested();
    }
}

// 这个 config 是默认配置和请求配置合并后的结果
module.exports = function dispatchRequest(config) {

    // 这个过滤触发的时机是: axios是单例的时候,如果前一个请求被取消, 那会在它原型上标识 __CANCEL__
    // 即使修改了 url 等参数形式, 但依旧用这个实例发起网络请求, 还是会被过滤掉
    throwIfCancellationRequested(config); // 过滤已取消的请求

    // 确保 headers 属性一定是一个对象, 因为如果 请求配置 中把 axios({headers: undefined}), 后续会带来不必要的麻烦
    config.headers = config.headers || {};

    // 请求发送前, 对象请求参数data做处理, 同transformResponse原理过程一样
    config.data = transformData.call(
        config,
        config.data,
        config.headers,
        config.transformRequest
    );

    // 合并 headers, 以 config.headers 为准
    config.headers = utils.merge(
        config.headers.common || {}, // 默认必传请求头
        config.headers[config.method] || {}, // 当前请求类型 的其他一些 默认请求头
        config.headers // 请求配置 中的请求头
    );

    // 删除默认请求了, 保持 header 的纯净
    utils.forEach(['delete', 'get', 'head', 'post', 'put', 'patch', 'common'],
        function cleanHeaderConfig(method) {
            delete config.headers[method];
        }
    );

    // 获取适配器, 可以自定义适配器: https://www.axios-http.cn/docs/req_config
    var adapter = config.adapter || defaults.adapter;

    // 执行适配器, 实际发送起网络请求也就是这个时机
    return adapter(config).then(function onAdapterResolution(response) {
        // 这个过滤触发的时机是: 请求已经发出, 但已经获取到结果, 准备正常返回时, 又将请求取消了的时候
        throwIfCancellationRequested(config); // 过滤已取消的请求
        // 返回响应结果前, 去执行 transformData() 方法, 其实也就是去执行 transformResponse 数组,
        // transformData() 方法内部就是遍历 transformResponse 数组依次执行每个函数
        response.data = transformData.call(
            config, // transformResponse数组中每个函数的 this
            response.data,
            response.headers,
            config.transformResponse
        );

        return response;
    }, function onAdapterRejection(reason) {
        if (!isCancel(reason)) {
            // 这个过滤触发的时机是: 请求已经发出, 但获取结果时出现异常, 如网络情况、超时等, 准备返回异常信息时, 又将请求取消了的时候
            throwIfCancellationRequested(config); // 过滤已取消的请求
        }


        return Promise.reject(reason);
    });
}

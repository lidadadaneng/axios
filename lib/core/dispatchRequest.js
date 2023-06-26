// lib/core/dispatchRequest.js
var defaults = require('../defaults'); // 引入新文件

module.exports = function dispatchRequest(config) {
    // 获取适配器, 可以自定义适配器: https://www.axios-http.cn/docs/req_config
    var adapter = config.adapter || defaults.adapter;

    // 执行适配器, 实际发送起网络请求也就是这个时机
    return adapter(config).then(function onAdapterResolution(response) {
        return response;
    }, function onAdapterRejection(reason) {
        return Promise.reject(reason);
    });
}

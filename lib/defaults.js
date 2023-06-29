// lib/defaults.js
var utils = require('./utils');
var normalizeHeaderName = require('./helpers/normalizeHeaderName'); // 引入新文件


// 设置请求头
function setContentTypeIfUnset(headers, value) {
    if (!utils.isUndefined(headers) && utils.isUndefined(headers['Content-Type'])) {
        headers['Content-Type'] = value;
    }
}

// 根据环境返回合适的适配器
function getDefaultAdapter() {
    var adapter;
    if (typeof XMLHttpRequest !== 'undefined') {
        // 浏览器环境, 浏览器发起网络请求是使用了 XMLHttpRequest 对象
        adapter = require('./adapters/xhr');
    } else if (typeof process !== 'undefined' && Object.prototype.toString.call(process) === '[object process]') {
        // Node 环境, node 发起网络请求是使用了 http 模块
        // adapter = require('./adapters/http');
    }
    return adapter;
}

var defaults = {
    timeout: 0,
    adapter: getDefaultAdapter(),
    transitional: {
        silentJSONParsing: true, // 版本兼容配置-返回值转换为 Json 出错时是否置为 null 返回
        forcedJSONParsing: true, // 版本兼容配置-responseType 设置非 json 类型时是否强制转换成 json 格式
        clarifyTimeoutError: false, // 版本兼容配置-请求超时时是否默认返回 ETIMEDOUT 类型错
    },
    // 注意 transformResponse 属性设计成一个数组, 是因为能更加方便的被使用, 我们可以通过传递数组，并通过一个一个函数来改造响应结果, 这样无疑是多样化的
    transformResponse: [function transformResponse(data) {
        var transitional = this.transitional;
        var silentJSONParsing = transitional && transitional.silentJSONParsing;
        var forcedJSONParsing = transitional && transitional.forcedJSONParsing;
        var strictJSONParsing = !silentJSONParsing && this.responseType === 'json';
        if (strictJSONParsing || (forcedJSONParsing && utils.isString(data) && data.length)) {
            try {
                // 把数据转换成对象, 因为 xhr.js 文件中的取的是 responseText
                return JSON.parse(data);
            } catch (e) {
                if (strictJSONParsing) {
                    if (e.name === 'SyntaxError') {
                        // throw enhanceError(e, this, 'E_JSON_PARSE');
                    }
                    throw e;
                }
            }
        }
        return data;
    }],
    // 关于请求头信息: https://developer.mozilla.org/zh-CN/docs/Glossary/Request_header
    headers: {
        // 默认必传请求头
        common: {
            'Accept': 'application/json, text/plain, */*'
        }
    },
    transformRequest: [function transformRequest(data, headers) {
        // 验证名称大小写
        normalizeHeaderName(headers, 'Accept');
        normalizeHeaderName(headers, 'Content-Type');

        if (utils.isFormData(data) || utils.isArrayBuffer(data) || utils.isBuffer(data)
            || utils.isStream(data) || utils.isFile(data) || utils.isBlob(data)) {
            return data;
        }
        if (utils.isArrayBufferView(data)) return data.buffer;
        if (utils.isURLSearchParams(data)) {
            // 如果请求的参数data是一个 URLSearchParams 对象, 则会自动设置特殊的请求头
            setContentTypeIfUnset(headers, 'application/x-www-form-urlencoded;charset=utf-8');
            return data.toString();
        }
        if (utils.isObject(data) || (headers && headers['Content-Type'] === 'application/json')) {
            setContentTypeIfUnset(headers, 'application/json');
            return JSON.stringify(data);
        }
        return data;
    }],
}
// 每一种不同类型的请求，可能会有一些不一样的请求头, 所以都给他们一个对象，方便我们为它们各自设置一些不一样的默认请求头。
// 如下图
var DEFAULT_CONTENT_TYPE = {
    'Content-Type': 'application/x-www-form-urlencoded'
};
utils.forEach(['delete', 'get', 'head'], function forEachMethodNoData(method) {
    defaults.headers[method] = {};
});
utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
    defaults.headers[method] = utils.merge(DEFAULT_CONTENT_TYPE);
});


module.exports = defaults;

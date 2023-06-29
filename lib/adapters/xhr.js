// lib/adapters/xhr.js
var utils = require('./../utils');
var settle = require('./../core/settle');
var parseHeaders = require('./../helpers/parseHeaders');

module.exports = function xhrAdapter(config) {
    return new Promise(function dispatchXhrRequest(resolve, reject) {
        // 这里的config已经是将默认配置和请求配置合并后的结果了
        var requestData = config.data; // 获取到config.data中的请求数据, config.params 我们后续再讲
        var requestHeaders = config.headers;
        var responseType = config.responseType;

        // 如果传递的 data 为 FormData 对象类型, 则删除头部的设置, 浏览器会自动为 FormData 参数类型的请求设置请求头
        if (utils.isFormData(requestData)) {
            delete requestHeaders['Content-Type'];
        }

        // 创建 XMLHttpRequest 对象
        var request = new XMLHttpRequest();
        // 初始化请求
        request.open(config.method.toUpperCase(), config.url, true);

        // 设置超时时长: 毫秒, 超时请求会自动终止
        request.timeout = config.timeout;

        // 定义一个请求结束后的处理函数
        function onloadend() {
            if (!request) return;

            // XMLHttpRequest.getAllResponseHeaders() 会返回所有响应头, 以字符串的形式, 详情可以看这里: https://developer.mozilla.org/zh-CN/docs/Web/API/XMLHttpRequest/getAllResponseHeaders
            var responseHeaders = 'getAllResponseHeaders' in request ? parseHeaders(request.getAllResponseHeaders()) : null;
            // 根据响应类型获取返回结果
            var responseData = !responseType || responseType === 'text' ||  responseType === 'json' ? request.responseText : request.response;

            // 构建响应结果
            var response = {
                data: responseData,
                status: request.status,
                statusText: request.statusText,
                headers: responseHeaders,
                config: config,
                request: request
            };

            // 验证响应结果状态码情况
            settle(resolve, reject, response);

            // 请求结束, 清空当前的 XMLHttpRequest 对象
            request = null;
        }

        if ('onloadend' in request) {
            request.onloadend = onloadend;
        } else {
            request.onreadystatechange = function handleLoad() {
                if (!request || request.readyState !== 4) return;
                if (request.status === 0 && !(request.responseURL && request.responseURL.indexOf('file:') === 0)) return;
                // 这里制造出下一个宏任务的原因是: readystate处理程序是在ontimeout或onerror处理程序之前调用, 我们应该要在它们调用结束之后才来统一调用onloadend处理最终结果
                setTimeout(onloadend);
            };
        }

        // 设置请求头,
        if ('setRequestHeader' in request) {
            utils.forEach(requestHeaders, function setRequestHeader(val, key) {
                if (typeof requestData === 'undefined' && key.toLowerCase() === 'content-type') {
                    // 如果没有设置 config.data 则不需要 content-type 请求头
                    delete requestHeaders[key];
                } else {
                    request.setRequestHeader(key, val);
                }
            });
        }

        // 监听超时
        request.ontimeout = function handleTimeout() {
            reject('请求超时');
            request = null;
        };

        // 监听网络错误
        request.onerror = function handleError() {
            reject('网络错误');
            request = null;
        };

        if (config.cancelToken) {
            // 等等 promise 被执行, 然后就执行 取消请求 方法
            config.cancelToken.promise.then(function onCanceled(cancel) {
                // 因为是异步执行, 如果取消在请求已经结束前就完成, 就没必要执行取消
                if (!request) return;
                request.abort(); // 取消请求
                reject(cancel); // cancel 为 "取消对象"
                request = null;
            });
        }

        request.send(requestData); // XMLHttpRequest请求 请求中要发送的数据体：https://developer.mozilla.org/zh-CN/docs/Web/API/XMLHttpRequest/send
    });

       /* request.onreadystatechange = function handleLoad() {
            // 0-请求未初始化;  1-服务器连接已建立;  2-请求已接收;  3-请求处理中;  4-请求已完成, 且响应已就绪
            if (!request || request.readyState !== 4) return;
            resolve(request.response);
            request = null; // 请求结束
        };

        // 取消请求
        if (config.cancelToken) {
            // 等等 promise 被执行, 然后就执行 取消请求 方法
            config.cancelToken.promise.then(function onCanceled(cancel) {
                // 因为是异步执行, 如果取消在请求已经结束前就完成, 就没必要执行取消
                if (!request) return;
                request.abort(); // 取消请求
                reject(cancel); // cancel 为 "取消对象"
                request = null;
            });
        }

        request.send();
    });*/
}

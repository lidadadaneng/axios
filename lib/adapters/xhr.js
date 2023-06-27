// lib/adapters/xhr.js
module.exports = function xhrAdapter(config) {
    return new Promise(function dispatchXhrRequest(resolve, reject) {
        // 创建 XMLHttpRequest 对象
        var request = new XMLHttpRequest();
        // 初始化请求
        request.open(config.method.toUpperCase(), config.url, true);

        request.onreadystatechange = function handleLoad() {
            // 0-请求未初始化;  1-服务器连接已建立;  2-请求已接收;  3-请求处理中;  4-请求已完成, 且响应已就绪
            if (!request || request.readyState !== 4) return;
            resolve(request.response);
        };

        request.send();
    });
}

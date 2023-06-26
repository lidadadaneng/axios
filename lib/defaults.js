// lib/defaults.js
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
}

module.exports = defaults;

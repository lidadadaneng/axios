// lib/core/Axios.js
var dispatchRequest = require('./dispatchRequest'); // 引入新文件
function Axios() {

}
// axios内部发送网络请求的核心方法, config 参数就是我们传递的请求配置信息
Axios.prototype.request = function request(config) {
    var promise;
    var newConfig = config;
    try {
        // 把配置参数继续往下传递, 但一定会返回一个 Promise 回来
        promise = dispatchRequest(newConfig);
    } catch (error) {
        return Promise.reject(error);
    }
    return promise;
}
// 其他便捷方法
Axios.prototype.get = function() {}
Axios.prototype.post = function() {}

module.exports = Axios

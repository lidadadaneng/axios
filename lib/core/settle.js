// 验证响应结果的状态值, 再去调用 resolve 或者 reject
module.exports = function settle(resolve, reject, response) {
    // 可以通过 config.validateStatus 自定义响应状态码的验证规则, 默认值: status >= 200 && status < 300
    var validateStatus = response.config.validateStatus;
    if (!response.status || !validateStatus || validateStatus(response.status)) {
        resolve(response);
    } else {
        reject('出现错误了');
    }
};

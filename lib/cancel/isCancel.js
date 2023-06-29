/**
 * 判断是否是一个被取消了的请求
 * @param {*} value
 * @returns
 */
module.exports = function isCancel(value) {
    return !!(value && value.__CANCEL__);
};

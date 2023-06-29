var utils = require('../utils.js');

/**
 * 把默认配置和请求配置合并后返回, 以请求配置为准
 * @param {*} config1: 默认配置
 * @param {*} config2: 请求配置
 */
module.exports = function mergeConfig(config1, config2 = {}) {
    var config = {};
    // 规定一些 "特定属性", 按 它们值的类型 或者 它们的功能 分类好
    var valueFromConfig2Keys = ['url', 'method', 'data'];
    var mergeDeepPropertiesKeys = ['headers', 'auth', 'proxy', 'params'];
    var defaultToConfig2Keys = [
        'baseURL', 'transformRequest', 'transformResponse', 'paramsSerializer',
        'timeout', 'timeoutMessage', 'withCredentials', 'adapter', 'responseType', 'xsrfCookieName',
        'xsrfHeaderName', 'onUploadProgress', 'onDownloadProgress', 'decompress',
        'maxContentLength', 'maxBodyLength', 'maxRedirects', 'transport', 'httpAgent',
        'httpsAgent', 'cancelToken', 'socketPath', 'responseEncoding'
    ];
    var directMergeKeys = ['validateStatus'];

    // 合并两个值
    function getMergedValue(target, source) {
        if (utils.isPlainObject(target) && utils.isPlainObject(source)) {
            // 如果两个值都是普通对象, 则直接合并
            return utils.merge(target, source);
        } else if (utils.isPlainObject(source)) {
            // 如果第一个值不是一个普通对象, 第二个值是一个普通对象, 则直接返回第二个值
            return utils.merge({}, source);
        } else if (utils.isArray(source)) {
            // 如果两个值都不是普通对象, 且第二个值是一个数组, 则返回一个新数组对象
            return source.slice();
        }
        // 如果都不是就返回第二个值
        return source;
    }
    // 针对对象形式
    function mergeDeepProperties(prop) {
        if (!utils.isUndefined(config2[prop])) {
            config[prop] = getMergedValue(config1[prop], config2[prop]);
        } else if (!utils.isUndefined(config1[prop])) {
            config[prop] = getMergedValue(undefined, config1[prop]);
        }
    }

    // 这四个 forEach 是那些 "特定属性" 的合并具体过程
    utils.forEach(valueFromConfig2Keys, function valueFromConfig2(prop) {
        if (!utils.isUndefined(config2[prop])) { // 请求配置中存在这个属性
            config[prop] = getMergedValue(undefined, config2[prop]);
        }
    });
    utils.forEach(mergeDeepPropertiesKeys, mergeDeepProperties);
    utils.forEach(defaultToConfig2Keys, function defaultToConfig2(prop) {
        if (!utils.isUndefined(config2[prop])) {
            config[prop] = getMergedValue(undefined, config2[prop]);
        } else if (!utils.isUndefined(config1[prop])) {
            config[prop] = getMergedValue(undefined, config1[prop]);
        }
    });
    utils.forEach(directMergeKeys, function merge(prop) {
        if (prop in config2) {
            config[prop] = getMergedValue(config1[prop], config2[prop]);
        } else if (prop in config1) {
            config[prop] = getMergedValue(undefined, config1[prop]);
        }
    });

    // 把所有 "特定属性" 拼接成一个数组
    var axiosKeys = valueFromConfig2Keys
        .concat(mergeDeepPropertiesKeys).concat(defaultToConfig2Keys).concat(directMergeKeys);
    // 找到 请求配置 中不属于 "特定属性" 的那些key, 像 axios({url: '', name: '橙某人'}) 中的 name
    var otherKeys = Object.keys(config1).concat(Object.keys(config2)).filter(function filterAxiosKeys(key) {
        return axiosKeys.indexOf(key) === -1;
    });
    // 直接把不属于 "特定属性" 的其他属性做一个拷贝
    utils.forEach(otherKeys, mergeDeepProperties);

    return config;
}

var utils = require('./../utils');
var defaults = require('./../defaults');
module.exports = function transformData(data, headers, fns) {
    // 使用这个方法时, this 可以通过 call() 等方法去设置, 否则就取 默认配置 对象为this
    var context = this || defaults;
    utils.forEach(fns, function transform(fn) {
        // 执行每个函数, 把data和headers作为函数参数, 并改变函数内部this
        data = fn.call(context, data, headers);
    });
    return data;
};

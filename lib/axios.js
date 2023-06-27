// lib/axios.js
var Axios = require('./core/Axios');
var bind = require('./helpers/bind');
var utils = require('./utils'); // 引入工具函数

function createInstance() {
    // 创建 Axios 实例, 核心的一个对象
    var context = new Axios();
    // 把 request() 方法的 this 指向 context, 方便后面 request() 方法内部能访问到 Axios 对象，因为后续的系列方法、参数配置等都会放在 Axios 对象上
    var instance = bind(Axios.prototype.request, context);

    // 把 Axios 实例对象上原型的方法拷贝到 request() 身上, 如get/post
    utils.extend(instance, Axios.prototype, context);

    // 把 Axios 实例对象上本身的东西拷贝到 request() 身上, 如拦截器
    utils.extend(instance, context);

    // 返回 Axios.prototype.request 方法
    return instance;
}

// 创建 axios 对象
var axios = createInstance();

module.exports = axios;

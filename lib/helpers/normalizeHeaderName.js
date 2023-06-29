// 用于矫正header中特定的key
module.exports = function normalizeHeaderName(headers, normalizeName) {
    // headers不存在
    if(!headers) {
        return
    }
    Object.keys(headers).forEach((name) => {
        // key大小写不同的情况下
        if (name !== normalizeName && name.toUpperCase() === normalizeName.toUpperCase()) {
            // 将原有的value 赋值给 新的key
            headers[normalizeName] = headers[name]
            // 删除原有的key
            delete headers[name]
        }
    })
}

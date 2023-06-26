module.exports = function(grunt) {
    // 加载当前项目需要的所有依赖项, 取代以前 grunt.loadNpmTasks("grunt-webpack") 单个声明的繁琐方式
    require('load-grunt-tasks')(grunt);
    // grunt的任务总配置
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        // 关于webpack属性的配置详情可以看这里 https://www.npmjs.com/package/grunt-webpack
        webpack: {
            // 名称可以随便取，下面就是webpack原有的一些属性信息了
            myConfig: {
                mode: 'development',
                entry: './index.js',
                output: {
                    path: __dirname + '/dist/',
                    filename: 'axios.js',
                    library: 'axios',
                    libraryTarget: 'umd'
                },
            }
        }
    });
    // 注册一个任务，具体语法可以看这里 https://www.gruntjs.net/creating-tasks
    grunt.registerTask('build', '任务描述，如：这是一个打包axios的任务', ['webpack']);
    // 再注册一个任务，更多语法可以查看：https://www.gruntjs.net/creating-tasks
    grunt.registerTask('myTask', () => {
        console.log('我的任务');
    });
}

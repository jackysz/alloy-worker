# alloy-worker 技术细节

// TODO

## 构建脚本

alloy-worker 的构建脚本在 `worker-script`, 其中的主要文件为:
```sh
worker-script
├── build-worker.js // 构建脚本, 调用: node ./worker-script/build-worker.js
├── project.config.js // 项目配置
├── worker.webpack.config.js // webpack 构建配置
├── plugin-for-main-thread-build.js // 主线程构建需要添加的 plugins 列表
└── replace-worker-file-name-placeholder-plugin.js // 定制的 worker js 文件名 hash 替换插件
```

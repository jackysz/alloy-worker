# 接入方式

### 让 Alloy Worker 融为项目源码

前端业务中, Web Worker 需打包为独立文件, 并且业务代码也需要打包进去; 所以 Alloy Worker **并不是一个 npm 包**. 它需要你手动将它融合到你的项目源码里; 好在手动并不复杂, 而且它不会入侵你的现有业务.

Alloy-worker 是对原始 Web Worker 能力的 RPC 封装, 也是 **Worker 代码组织方式的约定**. 接入其实是完成一件单纯的事情: **帮你初始化项目中的 Worker 源码**. 初始化源码后, Web Worker 就是项目的一项基础能力, 你可以自由地去使用和修改它.

我们使用一个已有项目 - [template](https://github.com/CntChen/template) - 为例子来了解如何手动融合 Alloy Worker.

### 下载源码
将 `template` 和 `alloy-worker` clone 到本地同级目录.

```sh
$ cd /path/to/test
$ git clone https://github.com/CntChen/template.git
$ git clone https://github.com/CntChen/alloy-worker.git
```

### 复制需要的源码

`template` 需要新增的 Worker 源码在 `alloy-worker/src/worker` 目录, 复制该目录到 `template` 的相同目录.

```sh
$ cd /path/to/test
$ cp -r ./alloy-worker/src/worker ./template/src/
```

### 添加 Worker 的独立构建脚本

我们知道 Web Worker 需要打包为独立的 js 资源, `alloy-worker` 提供独立打包的 webpck 配置, 复制到 `template`.

```sh
$ cd /path/to/test
$ cp -rf alloy-worker/worker-script ./template/
```

需要关注下 `template/scirpt/project.config.js` 中定义的 Worker 构建配置. 比如输出目录 `outputPath` 默认是 `/dist`, 如果 `template` 是其他目录, 则要对齐 `template`.

看到 Web Worker 构建的 webpack 配置: `template/worker-script/worker.webpack.config.js`.

### 现有项目主线程构建添加 Worker 的 plugin
> template/script/get-webpack-plugin.js

```diff
```

### 把 Worker 构建配置纳入构建流程

> template/script/build.js
```diff
+ const workerConfig = require('../worker-script/worker.webpack.config');
const pcConfig = ...
const mobileConfig = ...

-const compiler = webpack([pcConfig, mobileConfig].filter(c => !!c));
+const compiler = webpack([workerConfig, pcConfig, mobileConfig].filter(c => !!c));
```

### Worker 构建常量类型声明

alloy-worker 使用 

```sh
$ cd /path/to/test
$ mkdir -p template/src/typing
$ cp  alloy-worker/src/typings/worker.d.ts ./template/src/typings/
```

如果 `template/tsconfig.json`:
```diff
{
    "typeRoots": [
+       "./src/typings",
        "./node_modules/@types"
    ]
}
```

### 跑构建

webpackv4.

安装一些可能缺失的依赖.
```sh
$ npm i webpack-manifest-plugin -D

```

### 可能需要处理的问题

alloy-worker 使用 Typescript 编写. alloy-worker 的 ts 规则可能和你项目里面的不一致, 而导致 ts check 报错. 需要手动修复一下.

### [可选]:  

### 主线程使用 alloy-worker

源码在 `src/pc/index.ts`.
```js
import createAlloyWorker from '../worker/index';

// 初始化 AlloyWorker
const alloyWorker = createAlloyWorker({
    workerName: 'alloyWorker--test',
    isDebugMode: true,
});

console.log('alloyWorker', alloyWorker);
```

### Babel
Alloy Worker 已经称为你项目源码的一部分. 所以代码的 transpile 和 polyfill 需要项目管理.

如果有需要, 关注主线程和 Worker 线程的 `Promise` 和 `async/await` 否是在目标浏览器已经 polyfill.

## EOF

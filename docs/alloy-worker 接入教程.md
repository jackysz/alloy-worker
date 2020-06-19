# alloy-worker 接入教程

前端业务中, Web Worker 需打包为独立文件, 并且业务代码也需要打包进去. 所以 alloy-worker **并不是一个 npm 包**. 它需要你手动将它融合到你的项目源码里, 并成为**项目源码的一部分**. 好在手动也并不复杂, 而且接入不会影响你的现有业务.

## 接入前提

Alloy-worker 源码基于 TypeScript 编写, 使用 Webpack4 进行构建. 这对你的项目有 2 点要求: 

* 你的项目最好支持 TypeScript 构建. 如果还未支持, 可以先接入 alloy-worker, 再在接入过程中解决 ts 构建报错.
* 你的项目最好是用 Webpack4 进行构建. 使用其他 Webpack 版本可能会出现构建报错.

下面我们以 github 上名为 [template](https://github.com/CntChen/template) 的项目为例, 来了解如何接入 alloy-worker.

## 下载源码
将 `template` 和 `alloy-worker` clone 到本地同级目录.

```sh
$ cd /path/to/test
$ git clone https://github.com/CntChen/template.git
$ git clone https://github.com/AlloyTeam/alloy-worker.git
```

## 复制 Worker 源码

`template` 需要新增的 Worker 源码在 `alloy-worker/src/worker` 目录中, 复制该目录到 `template` 的相同目录.

```sh
$ cd /path/to/test
$ cp -r ./alloy-worker/src/worker ./template/src/
```
## 复制 Worker 类型声明

Alloy-worker 基于 TypeScript 编写源码; 相关的类型声明在 `alloy-worker/src/typings/worker.d.ts` 中. 复制该文件到 `template` 的相同目录.

```sh
$ cd /path/to/test
$ mkdir -p template/src/typings
$ cp ./alloy-worker/src/typings/worker.d.ts ./template/src/typings/
```

如果类型声明查找目录没有包括 `./src/typings`, 需要在 `tsconfig.json` 中添加一下.

```diff
{
    "typeRoots": [
+       "./src/typings",
        "./node_modules/@types"
    ]
}
```

## 复制构建脚本

项目构建流程中, Web Worker 需要打包为独立的 js 资源, 因此 `alloy-worker` 提供独立打包的 webpck 配置. 配置存放在 `alloy-worker/worker-script` 目录, 将该目录复制到 `template` 中.

```sh
$ cd /path/to/test
$ cp -rf alloy-worker/worker-script ./template/
```

如果对 alloy-worker 的构建流程感兴趣, `worker-script` 的文件内容如下:
```sh
worker-script
├── build-worker.js // 构建脚本, 调用: node ./worker-script/build-worker.js
├── project.config.js // 项目配置
├── worker.webpack.config.js // webpack 构建配置
├── plugin-for-main-thread-build.js // 主线程构建需要添加的 plugins 列表
└── replace-worker-file-name-placeholder-plugin.js // 定制的 worker js 文件名 hash 替换插件
```

**修改部分配置:** `项目配置`(`worker-script/project.config.js`) 有 2 处需要对齐你项目的构建配置.

* `outputPath`: `outputPath` 表示 Worker 构建输出目录, 默认是 `./dist`; 如果你的项目使用了其他输出目录, 需要对齐你的项目.
* `isProduction`: `isProduction` 用于区分构建模式, 判断方式是 `process.env.NODE_ENV === 'production'`; 需要对齐你项目的构建模式判断方式.

## 添加 Worker 构建

复制构建脚本后, 需要把 Worker 构建添加到项目现有构建流程中. 大部分构建方式, 只要把 alloy-worker 的构建配置也作为实例化 Webpack compiler 的参数.

在 `tempalte` 中, 添加方式为修改 `template/script/build.js` 文件.

```diff
+ const workerConfig = require('../worker-script/worker.webpack.config');
const pcConfig = ...
const mobileConfig = ...

+const compiler = webpack([workerConfig, pcConfig, mobileConfig].filter(c => !!c));
-const compiler = webpack([pcConfig, mobileConfig].filter(c => !!c));
```

注意点: **Worker 配置需要放在主线程配置前**, 因为主线程构建依赖 Worker 构建出来的 js 文件.

## 主线程构建添加 plugins

项目原来的构建我们称为主线程构建. 接入 alloy-worker 后, 主线程构建需要添加一些 Webpack plugin. Plugins 列表直接从 `worker-script/plugin-for-main-thread-build.js` 中引用.

在 `template` 中, 添加方式为修改 `template/script/get-webpack-config.js` 文件.

```diff
+ const PluginForMainThreadBuild = require('../worker-script/plugin-for-main-thread-build');

const webpackConfig = {
    plugins: [
+        ...PluginForMainThreadBuild,
    ],
};
```

主线程构建需要添加的 plugins 主要解决 2 个问题:
* 主线程通过 url 引用 Web Worker 独立 js 资源, 需要获取该 url 的名称, 特别是 prod 构建后需获取 hash 文件名.
* 主线程和 Worker 线程同构代码需要做区分, 通过 webpack.DefinePlugin 的 `__WOKRER__` 构建变量进行区分.

## 主线程创建 Alloy-worker

在主线程入口处, 添加下面这段代码, 实现 alloy-worker 的实例化和调用. 参考 `template/src/pc/index.ts`.

```js
import createAlloyWorker from '../worker/index';

// 初始化 AlloyWorker
const alloyWorker = createAlloyWorker({
    workerName: 'alloyWorker--test',
});
alloyWorker.workerAbilityTest.communicationTest().then((res) => console.log(`worker test result: ${res}`));
```

## 跑构建

Alloy-worker 的构建依赖一些 npm 包, 跑构建前先安装一下.

```sh
$ npm i webpack-manifest-plugin -D
```

终于可以愉快地跑起构建脚本.
```sh
// dev
$ npm run dev
// dist
$ npm run dist
```

当你看到下面的输出, 表明项目已经成功构建出独立的 Worker js 资源!

```sh
...
chunk {alloy-worker} alloy-worker.js, alloy-worker.js.map (alloy-worker) ...
```

## 查看接入是否成功
打开浏览器调试项目页面, 当你看到下面的 console.log 输出, 恭喜你! 你的项目成功接入了 alloy-worker.
```js
...
> worker test result: xxx
...
```

到此, 你的项目已经具备 Web Worker 能力, 怎么使用 alloy-worker, [请看这里](./alloy-worker%20%E4%BD%BF%E7%94%A8%E6%95%99%E7%A8%8B.md).

## 可能遇到的问题
### TypeScript 报错

Alloy-worker 的 ts 规则可能和你项目里面的不一致, 导致 ts check 报错. 如果遇到需要手动修复一下.

### 代码转译

Alloy-worker 已经成为你项目源码的一部分. 所以 ES6+ 源码的 transpile/polyfill 需要由项目接管. 如果无法确定是否转译, 关注主线程和 Worker 线程的 `Promise` 和 `async/await` 在目标浏览器(如 IE10)的运行情况.

Alloy-worker 项目本身是 Babel7 + browserslist + core-js 实现按需 transpile/polyfil.

## EOF

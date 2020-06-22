# alloy-worker 使用教程

Alloy-worker 对原始 Web Worker 通信能力进行了 RPC 封装,  **约定了 Worker 代码的组织方式和调用方式**. 初始化源码后, Web Worker 就是项目的一项基础能力, 你也可以自由地去使用和修改它.

## 实例化 alloy-worker

Alloy-worker 对外的 API 是 `createAlloyWorker` -- 实例化 AlloyWorker 的工厂函数.

```js
import createAlloyWorker from 'path/to/worker/index';

// 实例化 AlloyWorker
const alloyWorker = createAlloyWorker({
    workerName: 'alloyWorker--test', // 必要参数, 设置 worker 实例名称, 用于区分多个实例.
    isDebugMode: false, // 可选参数, 是否为调试模式, 默认为 false. 为 true 时控制台会输出每次通信的数据流信息.
});
```

## 发起一次跨线程调用

在 alloy-worker 的约定里, 通过事务(action)进行跨线程通信, 同类事务聚合为命名空间, 命名空间作为 `alloyWorker` 的属性来访问.

跨线程调用示例:

```js
alloyWorker.workerAbilityTest.communicationTest()
    .then((res) => console.log(`worker test result: ${res}`));
```

其中:
* `workerAbilityTest` 为事务命名空间; `communicationTest` 为具体事务.
* 调用 `communicationTest(opts)` 会发起一次跨线程通信, `opts` 为通信负载.
* 跨线程通信是 Promise 化的, 可在 `.then` 中得到通信的返回.

> 想了解 alloy-worker 如何封装通信为 Promise, 请查看 [alloy-worker 技术细节](./alloy-worker%20%E6%8A%80%E6%9C%AF%E7%BB%86%E8%8A%82.md).

## 添加新事务

使用 alloy-worker 开发 Worker 侧业务时, 需对齐 alloy-worker 的约定. 为快速地新增符合约定的事务, alloy-worker 提供了事务生成脚本.

调用事务生成脚本
```sh

```

在控制器中添加事务


## 不兼容提示

根据 AlloyTeam 的实践经验, Worker 有大约 99.9% 的可用性, 但你可能更关注 0.1% 的不可用场景. Alloy-worker 内置 Worker 可用性监控能力, 可以在 Worker 不可用时提示用户.

可以修改 `src/worker/heart-beat-check.ts` 的 `showDeadTip` 给出 UI 提示:

```js
showDeadTip(): void {
    ...
    alert('Worker 能力不可用, 请使用新版本的浏览器.');
}
```


## 错误上报和日志上报

Alloy-worker 的上报都收归在 src/worker/report-proxy.ts 中, 包括三种上报类型:

* raven 错误上报, 一般上报到 sentry 等监控平台
* weblog 情况上报, 比如心跳包超时时间, 心跳停止时的心跳计数, 通信超时等
* monitor 事件点上报, 只上报某个 id, 

## EOF

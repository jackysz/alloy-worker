# alloy-worker

> 面向事务的高可用 Web Worker 通信框架.

腾讯 [AlloyTeam](https://github.com/AlloyTeam) 出品, 经受住腾讯文档等大型前端项目的考验.

## 特点

* 面向事务及命名空间的通信封装, 支持大规模业务的场景.
* Promise 化调用代替跨线程事件监听, 无缝支持 async, await.
* 完整的 Worker 可用性监控指标; 全链路 Worker 错误监控.
* 源码全 TypeScript, 跨线程数据类型一致性校验.
* 跨线程请求和响应的数据流调试.
* 良好支持 IE10+ 浏览器.

*更多详细信息请查看[Alloy Worker 技术细节][Alloy Worker 技术细节].*

# Demo
* Web Worker 能力测试
> https://todo.com
// TODO GIF

* Worker 图像处理 Demo
> https://todo.com
// TODO GIF

## 代码示例

* 主线程实例化 alloy-worker. 代码示例: `src/index.ts`.

```js
import createAlloyWorker from '../worker/index';

// 实例化
const alloyWorker = createAlloyWorker({ workerName: 'alloyWorker--test' });
// 跨线程 Promise 调用
alloyWorker.workerAbilityTest.communicationTest().then(console.log);
```

* 主线程发起跨线程调用. 代码示例: `src/worker/main-thread/worker-ability-test.ts`

```js
export default class WorkerAbilityTest {
    communicationTest() {
        const mainThreadPostTime: = Date.now();
        // this.controller 是 alloy-worker 的通信控制器
        return this.controller.requestPromise(WorkerAbilityTestActionType.CommunicationTest, mainThreadPostTime);
    }
}
```

* Worker 线程处理跨线程请求并返回结果. 代码示例: `src/worker/worker-thread/worker-ability-test.ts`.

```js
export default class WorkerAbilityTest {
    CommunicationTest(payload) {
        // 获取主线程传递的数据
        const mainThreadPostTime = payload;
        // 返回发送和接收的时间差
        return Date.now() - mainThreadPostTime;
    }
}
```


## 用法
### 接入

Alloy-worker **并不是一个 npm 包**. 它需要你手动将它融合到你的项目源码里, 并成为项目源码的一部分. 好在手动也并不复杂, 而且接入不会影响你的现有业务.

接入步骤请查看[这里](https://todo.com).

### 使用
Alloy-worker 是对原始 Web Worker 能力的 RPC 封装, 也是 **Worker 代码组织方式的约定**. 基于 alloy-worker 开发 Worker 业务时, 需按照 Alloy-worker 的约定来编写代码. 约定不复杂, 请查看[这里](https://todo.com).

## 业界方案对比

| 项目 | 简介 | 底层API封装 | 事务声明 | 可用性监控 | 易拓展性 |
| - | - | :-: | :-: | :-: | :-: |
| [Worker-loader](https://github.com/webpack-contrib/worker-loader) | Webpack 官方,源码打包能力 | ❌ | ❌ | ❌ | ❌ |
| [Promise-worker](https://github.com/nolanlawson/promise-worker) | 封装基本 API 为 Promise 化通信 | ✔️ | ❌ | ❌ | ❌ |
| [Comlink](https://github.com/GoogleChromeLabs/comlink) | Chrome 团队开源, worker 打包 plugin | ✔️ | 跨线程同名函数 | ❌ | ❌ |
| **Alloy-worker** | 面向事务, 高可以用的 Worker 通信框架 | 通信️控制器 | 同名函数, TypeScirpt 声明 | 完整监控指标, 全周期错误监控 | 命名空间 |

## 使用统计

如果你的项目使用 Alloy-Worker 后觉得不错, 请到[这里](https://todo.com)告诉我们.

## 贡献源码
> [参与开发](./CONTRIBUTING.md).

## 相关文档

* Alloy Worker 接入教程
> https://todo.com

* Alloy Worker 使用方式
> https://todo.com

* Alloy Worker 技术细节
> https://todo.com

* Web Worker 文献综述 2020
> https://todo.com

* 朝花夕拾: Web Worker 大型前端项目实践
> https://todo.com

## TODO
* 代码中的 TODO 清理

## EOF

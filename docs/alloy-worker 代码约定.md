# alloy-worker 代码约定

## 相关概念

* 事务
* 事务命名空间
* 负载及其类型声明
* 通信控制器
* 通信通道

## 源码目录

* 主线程源码目录和 Worker 线程源码目录
* 声明文件目录
* 文件名对应命名空间

## 跨线程调用方式

* 主线程实例化 alloy-worker.

```js
// src/index.ts

import createAlloyWorker from '../worker/index';

// 实例化
const alloyWorker = createAlloyWorker({
    workerName: 'alloyWorker--test',
});
// 跨线程 Promise 调用
alloyWorker.workerAbilityTest.communicationTest().then(console.log);
```

* 主线程发起跨线程调用.

```js
// src/worker/main-thread/worker-ability-test.ts

export default class WorkerAbilityTest {
    communicationTest() {
        const mainThreadPostTime: = Date.now();
        // this.controller 为通信控制器
        return this.controller.requestPromise(
            WorkerAbilityTestActionType.CommunicationTest,
            mainThreadPostTime);
    }
}
```

* Worker 线程收到请求并返回结果.

```js
// src/worker/worker-thread/worker-ability-test.ts

export default class WorkerAbilityTest {
    CommunicationTest(payload) {
        // 获取主线程传递的数据
        const mainThreadPostTime = payload;
        // 返回发送和接收的时间差
        return Date.now() - mainThreadPostTime;
    }
}
```

## 事务调用流程

以 `communicationTest` 事务为例介绍事务的跨线程调用流程.

### 主线程调用 `communicationTest` 函数

```ts
// src/worker/main-thread/worker-ability-test.ts

communicationTest(): Promise<WorkerReponse.WorkerAbilityTest.CommunicationTest> {
    const mainThreadPostTime: WorkerPayload.WorkerAbilityTest.CommunicationTest = Date.now();
    return this.controller.requestPromise(
        WorkerAbilityTestActionType.CommunicationTest,
        mainThreadPostTime);
}
```

其中:
* `WorkerPayload.WorkerAbilityTest.CommunicationTest` 为发送负载的类型声明.
* `WorkerReponse.WorkerAbilityTest.CommunicationTest` 为响应负载的类型声明.
* alloy-worker 将通信封装为 Promise, 所以 `communicationTest` 返回 `Promise<T>`.
* `this.controller` 为主线程通信控制器, 调用 `requestPromise` 发送事务, 参数为事务类型和负载.
* `WorkerAbilityTestActionType.CommunicationTest` 为事务类型的字符串, 用以区分不同的事务.

#### 在 Worker 线程进行事务监听

跨线程事务发送到 Worker 线程时, Worker 线程调用相应的处理函数. 需要添加事务监听:

```ts
// src/worker/worker-thread/worker-ability-test.ts

protected addActionHandler(): void {
    this.controller.addActionHandler(
        WorkerAbilityTestActionType.CommunicationTest,
        this.CommunicationTest.bind(this)
    );
    ...
}
```

其中:
* 在 `addActionHandler` 函数用于添加各事务的事件监听.
* `this.controller` 为 Wokrer 线程的通信控制器.
* 调用 `this.controller.addActionHandler` 添加事务监听, 参数为事务类型和事务处理函数.

### Worker 线程的事务处理函数

事务处理函数对具体事务进行处理, 并 return 处理结果, 结果作为跨线程事务的响应返回给主线程.

```ts
// src/worker/worker-thread/worker-ability-test.ts

private CommunicationTest(
    payload: WorkerPayload.WorkerAbilityTest.CommunicationTest
): WorkerReponse.WorkerAbilityTest.CommunicationTest {
    const mainThreadPostTime = payload;
    // 收到主线程信息的耗时
    const workerGetMessageDuration = Date.now() - mainThreadPostTime;

    return workerGetMessageDuration;
}
```

其中:
* `CommunicationTest` 与主线程发起事务函数同名.
* 需要返回类型为 `WorkerReponse.WorkerAbilityTest.CommunicationTest` 的结果.
* `CommunicationTest` 函数中可以随意调用外部模块的函数.

### 事务处理函数异步化

在业务侧, 事务处理函数可能需要等待异步逻辑, 如等待请求后台的结果, 等待 indexDB 读取的数据等. 
Alloy-worker 支持事务处理函数为异步函数, 只需要使用 async/await 进行函数声明.

将同步的 `CommunicationTest` 修改为异步: 

```diff
// src/worker/worker-thread/worker-ability-test.ts

+ private async CommunicationTest(
- private CommunicationTest(
    payload: WorkerPayload.WorkerAbilityTest.CommunicationTest
+): Promise<WorkerReponse.WorkerAbilityTest.CommunicationTest> {
-): WorkerReponse.WorkerAbilityTest.CommunicationTest {
    WorkerThreadWorker.cookie.getCookie();
    const mainThreadPostTime = payload;
    // 收到主线程信息的耗时
    const workerGetMessageDuration = Date.now() - mainThreadPostTime;

+   await new Promise(...);

    return workerGetMessageDuration;
}
```

其中:
* 事务处理函数添加 `async` 关键字声明.
* 事务处理函数的返回类型修改为 `Promise<T>`.
* 在事务处理函数中通过 `await` 等待异步 Promise 逻辑.

## EOF

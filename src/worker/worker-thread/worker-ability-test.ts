import BaseAction from '../common/base-action';
import { WorkerAbilityTestActionType } from '../common/action-type';
import WorkerThreadWorker from './index';

/**
 * 用于测试 Worker 能力的事务
 */
export default class WorkerAbilityTest extends BaseAction {
    protected addActionHandler(): void {
        this.controller.addActionHandler(
            WorkerAbilityTestActionType.CommunicationTest,
            this.CommunicationTest.bind(this)
        );
        this.controller.addActionHandler(WorkerAbilityTestActionType.HeartBeatTest, this.heartBeatTest.bind(this));
    }

    /**
     * 通信能力检测的处理器
     */
    private CommunicationTest(
        payload: WorkerPayload.WorkerAbilityTest.CommunicationTest
    ): WorkerReponse.WorkerAbilityTest.CommunicationTest {
        WorkerThreadWorker.cookie.getCookie();
        const mainThreadPostTime = payload;
        // 收到主线程信息的耗时
        const workerGetMessageDuration = Date.now() - mainThreadPostTime;

        return workerGetMessageDuration;
    }

    /**
     * 心跳检测的处理器
     */
    private heartBeatTest(
        payload: WorkerPayload.WorkerAbilityTest.HeartBeatTest
    ): WorkerReponse.WorkerAbilityTest.HeartBeatTest {
        const heartBeat = payload;
        return heartBeat;
    }
}

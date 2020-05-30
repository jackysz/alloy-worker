import { HeartBeatCheckInterVal, HeartBeatCheckTimeout } from './config';
import MainThreadWorker from './main-thread/index';
import ReportProxy, { WorkerMonitorId } from './report-proxy';

/**
 * 对 Worker 线程进行心跳检测
 */
export default class HeartBeatCheck {
    mainThreadWorker: MainThreadWorker;
    /**
     * 是否正在测心跳
     */
    isHeartBeatChecking = false;
    /**
     * 当前的心跳动次
     */
    heartBeatNow = 0;
    /**
     * 不正常的心跳列表
     */
    sickHeartBeats: number[] = [];

    checkInterValHandle: number;
    checkTimeoutHandle: number;

    constructor(mainThreadWorker: MainThreadWorker) {
        this.mainThreadWorker = mainThreadWorker;
    }

    /**
     * 开始心跳检测
     */
    start(): void {
        // 定时检查
        this.checkInterValHandle = window.setInterval(() => {
            this.checkOne();
        }, HeartBeatCheckInterVal);
    }

    /**
     * 停止心跳检测
     */
    stop(): void {
        clearInterval(this.checkInterValHandle);
        clearTimeout(this.checkTimeoutHandle);
    }

    /**
     * 检查一次心跳
     */
    checkOne(): void {
        // 上一次检测未完成, 直接返回
        if (this.isHeartBeatChecking) {
            return;
        }
        this.isHeartBeatChecking = true;

        this.heartBeatNow += 1;

        const heartBeatStartTime = Date.now();
        this.mainThreadWorker.workerAbilityTest.heartBeatTest(this.heartBeatNow).then(() => {
            this.isHeartBeatChecking = false;

            clearTimeout(this.checkTimeoutHandle);

            const heartBeatDuration = Date.now() - heartBeatStartTime;
            this.durationReport(heartBeatDuration);
        });

        this.checkTimeoutHandle = window.setTimeout(() => {
            this.isHeartBeatChecking = false;
            clearTimeout(this.checkTimeoutHandle);

            this.sickHeartBeats.push(this.heartBeatNow);
            this.checkHealth();
        }, HeartBeatCheckTimeout);
    }

    /**
     * 检查心跳是否健康
     */
    checkHealth(): void {
        const sickHeartBeatsLength = this.sickHeartBeats.length;
        if (sickHeartBeatsLength >= 2) {
            // 检查规则: 连续2次心跳超时, 认为 Worker 线程死亡
            if (this.sickHeartBeats[sickHeartBeatsLength - 2] + 1 === this.sickHeartBeats[sickHeartBeatsLength - 1]) {
                this.stop();
                this.showDeadTip();
                this.deadReport();
            }
        }
    }

    /**
     * Worker 线程死亡的 UI 提示
     */
    showDeadTip(): void {
        console.error(`Worker 线程 \`${this.mainThreadWorker.name}\` 已经挂掉了.`);
    }

    /**
     * 心跳时长的上报
     *
     * @param heartBeatDuration 心跳时长
     */
    durationReport(heartBeatDuration: number): void {
        // 心跳时长超过心跳检测间隔, 上报
        if (heartBeatDuration > HeartBeatCheckTimeout) {
            // Worker 心跳包超时上报
            ReportProxy.monitor(WorkerMonitorId.HeartBeatTimeout);
            ReportProxy.weblog({
                module: 'worker',
                action: 'worker_heartbeat_duration',
                info: heartBeatDuration,
            });
        }
    }

    /**
     * Worker 线程死亡的上报
     */
    deadReport(): void {
        // Worker 心跳停止上报
        ReportProxy.monitor(WorkerMonitorId.HeartBeatStop);
        ReportProxy.weblog({
            module: 'worker',
            action: 'worker_heartbeat_dead',
            // 上报最后一次心跳计数
            info: this.sickHeartBeats[this.sickHeartBeats.length - 1],
        });
    }
}

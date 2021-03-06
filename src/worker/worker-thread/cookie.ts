import BaseAction from '../common/base-action';
import { CookieActionType } from '../common/action-type';

export default class Cookie extends BaseAction {
    protected addActionHandler(): void {}

    /**
     * 到主线程获取 cookie
     */
    getCookie(): Promise<WorkerReponse.Cookie.Cookie> {
        return this.controller.requestPromise(CookieActionType.Cookie);
    }
}

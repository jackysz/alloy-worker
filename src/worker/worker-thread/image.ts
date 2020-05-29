import BaseAction from '../common/base-action';
import { ImageActionType } from '../common/action-type';
import Controller from './controller';
import { threshold, baseBlur } from '../../lib/image-filter';
import { isIE10 } from '../../lib/utils';

/**
 *
 */
export default class Image extends BaseAction {
    constructor(controller: Controller) {
        super(controller);
    }

    protected addActionHandler(): void {
        this.controller.addActionHandler(ImageActionType.Threshold, this.Threshold.bind(this));
        this.controller.addActionHandler(ImageActionType.BaseBlur, this.baseBlur.bind(this));
    }

    /**
     * 响应主线程的处理器
     */
    Threshold(payload: WorkerPayload.Image.Threshold): WorkerReponse.Image.Threshold {
        const startTime = Date.now();

        const response = threshold({
            data: payload.data,
            threshold: payload.threshold,
        });

        console.log('worker run threshold time: ', Date.now() - startTime, 'ms');
        return {
            transferProps: isIE10 ? [] : ['data'],
            data: response.data as any,
        };
    }

    baseBlur(payload: WorkerPayload.Image.BaseBlur): WorkerReponse.Image.BaseBlur {
        const startTime = Date.now();

        const response = baseBlur({
            data: payload.data,
            width: payload.width,
            height: payload.height,
            radius: payload.radius,
        });

        console.log('worker run threshold time: ', Date.now() - startTime, 'ms');
        return {
            transferProps: isIE10 ? [] : ['data'],
            data: response.data as any,
        };
    }
}

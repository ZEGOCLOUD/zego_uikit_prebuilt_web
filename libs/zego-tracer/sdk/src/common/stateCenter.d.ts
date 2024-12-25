import { ZegoLog } from '../util/zego.logger';
/****
 *
 * 负责对接全局状态变化,单独拿出来是为了和全局状态做切割,清晰的看到日志里面用到了哪些全局变量
 *
 * **/
export declare class StateCenter {
    processData: any;
    isLogin(): boolean;
    proxyCtrl: any | undefined;
    logger: any;
    _log: ZegoLog;
    constructor(logger: ZegoLog);
}

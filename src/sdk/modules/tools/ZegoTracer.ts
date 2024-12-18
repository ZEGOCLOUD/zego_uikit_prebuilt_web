import { ZegoSpan, ZegoTracer } from 'zego-tracer';
import { ZegoCloudRTCCore } from '..';
import { SpanEvent } from '../../model/tracer';

interface SystemInfoInter {
    system: string;
    browser: string;
    ua: string;
}

class SystemInfo {
    public ua: string = navigator.userAgent.toLowerCase();
    public system = '';
    public systemVs: string | undefined = '';
    public browser: string | undefined = '';
    public browserVs: string | undefined = '';
    constructor() { }
    testUa(regexp: RegExp): boolean {
        return regexp.test(this.ua);
    }
    testVs(regexp: RegExp): string | undefined {
        return this.ua
            .match(regexp)
            ?.toString()
            .replace(/[^0-9|_.]/g, '')
            .replace(/_/g, '.');
    }
    // 获取操作系统
    getSystem(): string {
        if (this.testUa(/windows|win32|win64|wow32|wow64/g)) {
            this.system = 'windows'; // windows系统
        } else if (this.testUa(/macintosh|macintel/g)) {
            this.system = 'macOS'; // macos系统
        } else if (this.testUa(/x11/g)) {
            this.system = 'linux'; // linux系统
        } else if (this.testUa(/android|adr/g)) {
            this.system = 'android'; // android系统
        } else if (this.testUa(/ios|iphone|ipad|ipod|iwatch/g)) {
            this.system = 'iOS'; // ios系统
        }
        return this.system;
    }
    // 操作系统版本
    getSystemVersion(): string | undefined {
        if (this.system === 'windows') {
            if (this.testUa(/windows nt 5.0|windows 2000/g)) {
                this.systemVs = '2000';
            } else if (this.testUa(/windows nt 5.1|windows xp/g)) {
                this.systemVs = 'xp';
            } else if (this.testUa(/windows nt 5.2|windows 2003/g)) {
                this.systemVs = '2003';
            } else if (this.testUa(/windows nt 6.0|windows vista/g)) {
                this.systemVs = 'vista';
            } else if (this.testUa(/windows nt 6.1|windows 7/g)) {
                this.systemVs = '7';
            } else if (this.testUa(/windows nt 6.2|windows 8/g)) {
                this.systemVs = '8';
            } else if (this.testUa(/windows nt 6.3|windows 8.1/g)) {
                this.systemVs = '8.1';
            } else if (this.testUa(/windows nt 10.0|windows 10/g)) {
                this.systemVs = '10';
            }
        } else if (this.system === 'macOS') {
            this.systemVs = this.testVs(/os x [\d._]+/g);
        } else if (this.system === 'android') {
            this.systemVs = this.testVs(/android [\d._]+/g);
        } else if (this.system === 'iOS') {
            this.systemVs = this.testVs(/os [\d._]+/g);
        }
        return this.systemVs;
    }
    // 浏览器类型
    getBrowser(): string | undefined {
        if (this.testUa(/applewebkit/g)) {
            if (this.testUa(/edg/g)) {
                this.browser = 'edge'; // edge浏览器
            } else if (this.testUa(/opr/g)) {
                this.browser = 'opera'; // opera浏览器
            } else if (this.testUa(/chrome/g)) {
                this.browser = 'chrome'; // chrome浏览器
            } else if (this.testUa(/safari/g)) {
                this.browser = 'safari'; // safari浏览器
            }
        } else if (this.testUa(/gecko/g) && this.testUa(/firefox/g)) {
            this.browser = 'firefox'; // firefox浏览器
        } else if (this.testUa(/presto/g)) {
            this.browser = 'opera'; // opera浏览器
        } else if (this.testUa(/trident|compatible|msie/g)) {
            this.browser = 'ie'; // iexplore浏览器
        }
        return this.browser;
    }
    //浏览器版本
    getBrowserVersion(): string | undefined {
        if (this.browser === 'chrome') {
            this.browserVs = this.testVs(/chrome\/[\d._]+/g);
        } else if (this.browser === 'safari') {
            this.browserVs = this.testVs(/version\/[\d._]+/g);
        } else if (this.browser === 'firefox') {
            this.browserVs = this.testVs(/firefox\/[\d._]+/g);
        } else if (this.browser === 'opera') {
            this.browserVs = this.testVs(/opr\/[\d._]+/g);
        } else if (this.browser === 'iexplore') {
            this.browserVs = this.testVs(/(msie [\d._]+)|(rv:[\d._]+)/g);
        } else if (this.browser === 'edge') {
            this.browserVs = this.testVs(/edg\/[\d._]+/g);
        }
        return this.browserVs;
    }
    // 获取所有信息
    getInfo(): SystemInfoInter {
        return {
            ua: this.ua,
            system: `${this.getSystem() || ''} ${this.getSystemVersion() || ''}`,
            browser: `${this.getBrowser() || ''} ${this.getBrowserVersion() || ''}`,
        };
    }
}


export class TracerConnect {
    public static PRODUCT = 'zegouikit';
    public static tracer: ZegoTracer | null;
    public static systemInfo = new SystemInfo().getInfo();
    private static domain = 'imzego.com';
    private static stringifyWhitelist = ['e_time_s', 'error', 'elapsed_time', 'game_id', 'room_id'];

    static getDeviceId(): string {
        let deviceId = localStorage.getItem(`device`);
        if (!deviceId) {
            deviceId = `device-web-${String(new Date().getTime()).substr(1)}`;
            localStorage.setItem(`device`, deviceId);
        }
        return deviceId;
    }

    public static createTracer(appID: number, token: string, userID: string): void {
        console.warn('===createTracer', appID, token, userID);
        this.init(appID, token, userID);
        // server.getDomain().then((domain) => {
        //     this.tracer?.setConfig({
        //         serverUrl: `wss://weblogger${appID}-api.${domain}/zglog/tlog`,
        //     });
        // });
    }

    private static init(appID: number, token: string, userID: string): void {
        if (!this.tracer) {
            this.tracer = new ZegoTracer();
            this.tracer.init({
                product: this.PRODUCT,
                appID,
                deviceID: this.getDeviceId(),
                env: 0,
                importantLevel: 0,
                serverUrl: "wss://weblogger-wss-alpha.coolacloud.com/zglog/tlog",// 正式环境"wss://weblogger-wss.coolzcloud.com/zglog/tlog",
                levels: [0, 10, 30, 50, 80],
                spanStart: (span: any) => {
                    console.warn('spanStart', span);
                },
                spanBeforeEnd: (span: any) => {
                    console.warn('spanBeforeEnd', span);
                    console.warn('duration', span.duration);

                    const attributes: any = {};
                    const stringify: any = {};
                    Object.keys(span.attributes).forEach((k) => {
                        if (this.stringifyWhitelist.indexOf(k) !== -1) {
                            attributes[k] = span.attributes[k];
                        } else {
                            stringify[k] = span.attributes[k];
                        }
                    });
                    attributes['detail'] = JSON.stringify(stringify);
                    // if (!attributes.hasOwnProperty('elapsed_time')) {
                    //     attributes['elapsed_time'] = span._duration;
                    // }
                    span.attributes = attributes;
                },
                spanEnd: (span: any) => {
                    // 这里也可执行动态模块
                    console.warn('spanEnd', span);
                },
                resources: {
                    product: this.PRODUCT,
                    system: this.systemInfo.system,
                    browser: this.systemInfo.browser,
                    user_agent: this.systemInfo.ua,
                    device_id: this.getDeviceId(),
                    appid: +appID,
                    user_id: userID,
                    platform: 'web',
                    platform_version: '',
                    uikit_version: '2.13.3'//ZegoCloudRTCCore.getVersion(),
                },
            });
            const startCommonField = new Map();
            startCommonField.set('userID', userID);
            startCommonField.set('token', token);
            this.tracer.startReport(startCommonField);
        }
    }

    public static unInit(): void {
        this.tracer = null;
    }

    public static createSpan(event: SpanEvent, option: Record<string, any>): ZegoSpan {
        return this.tracer!.createSpan(0, event, {
            kind: 2,
            attributes: option,
        });
    }
}

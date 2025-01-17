import { ZegoScenario } from "./zego.entity";
interface ScenarioSettingsConfig {
    ANS?: boolean;
    AEC?: boolean;
    AGC?: boolean;
    audioBitrate?: number;
    channelCount?: number;
}
export declare class ZegoSettingConfig {
    defaultSetting: any;
    setting: any;
    userChangedKey: any;
    arrObjKeys: string[];
    arrObjItemKeys: string[];
    noCtrlModeSettingList: string[];
    constructor();
    setSetting(settingFile: any, changeItems?: string[]): void;
    getSetting(key: string, force?: boolean): any;
    setUserValue(key: string, value: any): void;
    /**
     * 获取对应场景化配置的云控值
     * @param scenario 场景枚举值
     * @param force 获取mode为2的强制覆盖值
     * @param onlyGetScenario 是否只获取场景配置，不获取具体的3A和码率的云控默认值
     * @returns
     */
    getCloudSettingScenario(scenario: ZegoScenario, force?: boolean, onlyGetScenario?: boolean): ScenarioSettingsConfig;
    getSettingList(keyList: string[], force?: boolean): any[];
}
export declare const INIT = "init";
export declare const ROOM_BASIC = "room";
export declare const RTC = "rtc";
export {};

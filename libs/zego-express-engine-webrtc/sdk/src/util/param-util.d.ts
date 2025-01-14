import { ZegoError } from "../rtm/zego.entity";
import { ZegoLogger } from "../common/zego.entity";
export declare enum RULE_PARAM_NAME {
    NOT_EMPTY = "NOT_EMPTY",
    ILLEGAL_CHARACTERS = "ILLEGAL_CHARACTERS",
    TYPE_STRING = "TYPE_STRING",
    TYPE_INTEGER = "TYPE_INTEGER",
    TYPE_OBJECT = "TYPE_OBJECT",
    MAX_LENGTH_10 = "MAX_LENGTH_10",
    MAX_LENGTH_64 = "MAX_LENGTH_64",
    MAX_LENGTH_100 = "MAX_LENGTH_100",
    MAX_LENGTH_128 = "MAX_LENGTH_128",
    MAX_LENGTH_256 = "MAX_LENGTH_256",
    MAX_LENGTH_1024 = "MAX_LENGTH_1024"
}
interface RuleTemplate {
    name?: RULE_PARAM_NAME;
    error: ZegoError;
    extMsg?: string;
}
export declare const RULE_SUCCESS: RuleTemplate;
interface ParamTemplate {
    key?: string;
    order: number;
    value: any;
    rules: RuleTemplate[];
}
export declare function checkParams(sourceMap: {
    [index: string]: ParamTemplate;
}, option: {
    logger: ZegoLogger;
    action: string;
}): RuleTemplate;
export {};

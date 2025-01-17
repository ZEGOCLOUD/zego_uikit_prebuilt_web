import { Mode } from "../common/zego.entity";
import { TRACER_LEVEL } from "./zego.entity";
export declare const CLOUD_SETTING: {
    productNum: number;
};
export declare const TRACER_CONFIG: {
    product: string;
    importLevel: TRACER_LEVEL;
    levels: number[];
    bps: number;
};
declare const SDK_CONN_TYPE = 2;
declare const CRYPT_VERSION = 1;
declare const PROTO_VER = 131072;
declare const BIZ_TYPE = 0;
declare const STORE_SECRET = "0c9e6e0f8c0a8f4e";
export declare const NET_ACCESS_SERVERS = "z_net_access_servers";
export declare const NET_HTTP3_ACCESS_SERVERS = "z_net_http3_access_servers";
export declare const APP_CONFIG_KEY = "z_appconfig";
export declare const APP_CONFIG_TAG_KEY = "z_appconfig_etag";
export declare const APP_GEO_KEY = "z_geos";
export declare const SERVER_DOMAINS = "z_rtc_domains";
export { SDK_CONN_TYPE, CRYPT_VERSION, PROTO_VER, BIZ_TYPE, STORE_SECRET };
export declare const NET_ACCESS_CONFIG: {
    domains: string[];
    logreportDomain: string;
    prefixDomain: string;
    normalPriDomains: string[];
    specialDomain: string;
    mode: string;
    modeNo: Mode;
    sdkType: number;
    connectVer: number;
    pcEstablishTimeout: number;
    scheme: string;
    location: string;
    wssMessageType: number;
};
export declare const LOG_REPORT_CONFIG: {
    prefixDomain: string;
};
export declare const DETAIL_LOG_CONFIG: {
    prefixDomain: string;
};
/**
 * 地理围栏配置信息说明
1: GLOBAL   全球,后台保留
2: CN       中国大陆(不包含港澳台)
3: NA       北美
4: EU       欧洲,包括英国
5: AS       亚洲,不包括中国大陆,印度
6: IN       印度
7: NCN      不包含任何中国元素(排除中国大陆,港澳台,以及所有中国供应商)

域名包括 accesshub 和 logreport

1、地理围栏如何限制区域：判断请求服务是否在范围内，即连接的服务器，有统一接入服务，数据上报服务、webrtc 推拉流
2、SDK 首次开启地理围栏，连接的域名及服务ip 是否符合配置
3、连接后缓存返回的地理围栏 id 和调度的 accesshub 域名，下次连接优先使用（目前只有一套域名）
4、隔离域名则替换相应的主域名
 */
export declare const geoFencings: {
    id: number;
    relative_geofencings: number[];
    accesshub: string;
    logreport: string;
    detaillog: string;
}[];
export declare const extGeoFencingIDs: number[];

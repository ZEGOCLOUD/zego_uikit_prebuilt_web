import { ZegoStore } from '../util/zego.store';
/**
 * 同步加载js脚本
 * @param id   需要设置的<script>标签的id
 * @param url   js文件的相对路径或绝对路径
 * @return {Boolean}   返回是否加载成功，true代表成功，false代表失败
 */
declare function loadJS(isRemote: boolean, store: ZegoStore, url: string, key: string, hash: string, dcode: string, param: any): Promise<void>;
export { loadJS };

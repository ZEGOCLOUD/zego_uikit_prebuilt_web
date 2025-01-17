import type { ZegoLogger } from "../../../common/zego.entity";
import { MediaElementRenderer } from './mediaElementRenderer';
export declare class AudioContextManager {
    private _zgp_logger;
    static mgr: AudioContextManager;
    ac: AudioContext;
    private isResuming;
    id: number;
    _zgp_elementNodeMap: Map<HTMLMediaElement, MediaElementRenderer>;
    _zgp_workletMap: Map<string, true>;
    constructor(_zgp_logger: ZegoLogger);
    static create(_zgp_logger: ZegoLogger): AudioContextManager;
    getMediaElementRenderer(audio: HTMLMediaElement): MediaElementRenderer | null;
    private eventHandler;
    private checkAudioContext;
    private offCheckAudioContextListener;
    registerModule(moduleKey: string, fileContent: string): Promise<void>;
    destroy(): void;
}

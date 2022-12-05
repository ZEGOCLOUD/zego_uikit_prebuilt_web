export declare class FingerGestureUtils {
    isPointerdown: boolean;
    pointers: PointerEvent[];
    point1: {
        x: number;
        y: number;
    };
    point2: {
        x: number;
        y: number;
    };
    diff: {
        x: number;
        y: number;
    };
    lastPointermove: {
        x: number;
        y: number;
    };
    lastPoint1: {
        x: number;
        y: number;
    };
    lastPoint2: {
        x: number;
        y: number;
    };
    lastCenter: {
        x: number;
        y: number;
    };
    dom: HTMLElement;
    x: number;
    y: number;
    scale: number;
    maxScale: number;
    minScale: number;
    private callBack;
    addDomListener(dom: HTMLElement, callBack: (x: number, y: number, scale: number) => void): void;
    private pointerDown;
    private pointerMove;
    private pointerUp;
    private pointerCancel;
    /**
     * 更新或删除指针
     * @param {PointerEvent} e
     * @param {string} type
     */
    handlePointers(e: PointerEvent, type: "update" | "delete"): void;
}

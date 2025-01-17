import { HrTime, TimeInput } from './entity';
/**
 * Returns an hrtime calculated via performance component.
 * @param performanceNow
 */
export declare function hrTime(performanceNow?: number): HrTime;
export declare function isTimeInputHrTime(value: unknown): boolean;
export declare function timeInputToHrTime(time: TimeInput): HrTime;
export declare function hrTimeDuration(startTime: HrTime, endTime: HrTime): HrTime;
export declare function hrTimeToMilliseconds(hrTime: HrTime): number;
export declare function isTimeInput(value: unknown): boolean;
export declare function getCurrentTime(): string;

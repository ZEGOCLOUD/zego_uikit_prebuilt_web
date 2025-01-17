import { TracerConfig } from './entity';
/**
 * Function to merge Default configuration (as specified in './config') with
 * user provided configurations.
 */
export declare function mergeConfig(userConfig: TracerConfig): {
    traceParams: {
        numberOfAttributesPerSpan: number;
        numberOfLinksPerSpan: number;
        numberOfEventsPerSpan: number;
    };
} & TracerConfig;

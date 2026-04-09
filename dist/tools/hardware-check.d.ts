export interface HardwareInfo {
    cpu: {
        model: string;
        cores: number;
        threads: number;
    };
    memory: {
        totalGB: number;
        availableGB: number;
    };
    gpu: {
        hasNvidia: boolean;
        count: number;
        models: string[];
        totalMemoryGB: number[];
    };
    storage: {
        availableGB: number;
    };
}
export interface ExperimentConfig {
    batchSize: number;
    epochs: {
        full: number;
        ablation: number;
        debug: number;
    };
    mixedPrecision: boolean;
    gradientAccumulationSteps: number;
    numWorkers: number;
    pinMemory: boolean;
    maxTrainSamples: number;
    maxValSamples: number;
    recommendedDevice: 'cpu' | 'cuda' | 'mps';
    enableAblation: boolean;
    enableSupplementaryExperiments: boolean;
    expectedRuntimeHours: number;
}
export declare function detectHardware(): Promise<HardwareInfo>;
export declare function getOptimalExperimentConfig(hardware: HardwareInfo): Promise<ExperimentConfig>;
export declare function generateHardwareReport(hardware: HardwareInfo, config: ExperimentConfig): Promise<string>;

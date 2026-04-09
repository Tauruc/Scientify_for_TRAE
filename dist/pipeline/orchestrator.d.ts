export declare class PipelineOrchestrator {
    private workdir;
    private state;
    constructor(workdir: string);
    init(): Promise<void>;
    getNextPhase(): Promise<{
        phase: number;
        name: string;
        skill: string;
        outputFile: string;
    } | null>;
    markCurrentPhaseCompleted(): Promise<void>;
    getProgress(): {
        current: number;
        total: number;
        completed: boolean;
    };
}

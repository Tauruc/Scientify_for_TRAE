import { PipelineState, PipelinePhase } from '../types';
export declare function loadPipelineState(workdir: string): Promise<PipelineState | null>;
export declare function savePipelineState(workdir: string, state: PipelineState): Promise<void>;
export declare function deletePipelineState(workdir: string): Promise<void>;
export declare function createInitialState(phases: PipelinePhase[]): PipelineState;
export declare function checkPhaseCompleted(workdir: string, phase: PipelinePhase): Promise<boolean>;

import { PipelineState, PipelinePhase } from '../types';
export declare const PHASES: PipelinePhase[];
export declare function loadState(workDir: string): Promise<PipelineState | null>;
export declare function saveState(workDir: string, state: PipelineState): Promise<void>;
export declare function initState(workDir: string): Promise<PipelineState>;
export declare function isPhaseOutputExists(workDir: string, phase: PipelinePhase): boolean;

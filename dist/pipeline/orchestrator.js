import { DEFAULT_PIPELINE_PHASES } from './phases.js';
import { loadPipelineState, savePipelineState, createInitialState, checkPhaseCompleted } from './state.js';
export class PipelineOrchestrator {
    workdir;
    state = null;
    constructor(workdir) {
        this.workdir = workdir;
    }
    async init() {
        const existingState = await loadPipelineState(this.workdir);
        if (existingState) {
            this.state = existingState;
            console.log(`Resuming pipeline from phase ${existingState.currentPhase + 1}/${existingState.phases.length}`);
        }
        else {
            this.state = createInitialState(DEFAULT_PIPELINE_PHASES);
            console.log('Starting new pipeline');
        }
    }
    async getNextPhase() {
        if (!this.state || this.state.completed) {
            return null;
        }
        while (this.state.currentPhase < this.state.phases.length) {
            const currentPhase = this.state.phases[this.state.currentPhase];
            const completed = await checkPhaseCompleted(this.workdir, currentPhase);
            if (completed) {
                console.log(`Phase ${this.state.currentPhase + 1} [${currentPhase.name}] already completed, skipping`);
                this.state.currentPhase++;
                await savePipelineState(this.workdir, this.state);
            }
            else {
                return {
                    phase: this.state.currentPhase + 1,
                    name: currentPhase.name,
                    skill: currentPhase.skill,
                    outputFile: currentPhase.outputFile
                };
            }
        }
        this.state.completed = true;
        await savePipelineState(this.workdir, this.state);
        return null;
    }
    async markCurrentPhaseCompleted() {
        if (!this.state) {
            throw new Error('Pipeline not initialized');
        }
        this.state.currentPhase++;
        await savePipelineState(this.workdir, this.state);
    }
    getProgress() {
        if (!this.state) {
            return { current: 0, total: DEFAULT_PIPELINE_PHASES.length, completed: false };
        }
        return {
            current: this.state.currentPhase,
            total: this.state.phases.length,
            completed: this.state.completed
        };
    }
}

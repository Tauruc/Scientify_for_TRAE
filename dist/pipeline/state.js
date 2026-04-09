import * as fs from 'fs/promises';
import * as path from 'path';
const STATE_FILE = '.pipeline_state.json';
export async function loadPipelineState(workdir) {
    try {
        const statePath = path.join(workdir, STATE_FILE);
        const data = await fs.readFile(statePath, 'utf-8');
        return JSON.parse(data);
    }
    catch {
        return null;
    }
}
export async function savePipelineState(workdir, state) {
    const statePath = path.join(workdir, STATE_FILE);
    await fs.writeFile(statePath, JSON.stringify(state, null, 2));
}
export async function deletePipelineState(workdir) {
    try {
        const statePath = path.join(workdir, STATE_FILE);
        await fs.unlink(statePath);
    }
    catch {
        // Ignore if file doesn't exist
    }
}
export function createInitialState(phases) {
    return {
        currentPhase: 0,
        phases,
        completed: false
    };
}
export function checkPhaseCompleted(workdir, phase) {
    try {
        const outputPath = path.join(workdir, phase.outputFile);
        return fs.access(outputPath).then(() => true).catch(() => false);
    }
    catch {
        return Promise.resolve(false);
    }
}

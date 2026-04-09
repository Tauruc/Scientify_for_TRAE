
import { PipelineState, PipelinePhase } from '../types';
import * as fs from 'fs/promises';
import * as fsSync from 'fs';
import * as path from 'path';

const STATE_FILE = 'pipeline_state.json';

export const PHASES: PipelinePhase[] = [
  {
    name: 'Literature Survey',
    skill: 'research-collect',
    outputFile: 'papers/',
    description: '搜索、筛选、下载论文'
  },
  {
    name: 'Deep Survey',
    skill: 'research-survey',
    outputFile: 'survey_res.md',
    description: '深度分析论文，提取核心方法'
  },
  {
    name: 'Implementation Plan',
    skill: 'research-plan',
    outputFile: 'plan_res.md',
    description: '制定详细实现计划'
  },
  {
    name: 'Implementation',
    skill: 'research-implement',
    outputFile: 'ml_res.md',
    description: '实现代码并验证'
  },
  {
    name: 'Review',
    skill: 'research-review',
    outputFile: 'iterations/',
    description: '代码审查与迭代'
  },
  {
    name: 'Full Experiment',
    skill: 'research-experiment',
    outputFile: 'experiment_res.md',
    description: '完整实验与分析'
  }
];

export async function loadState(workDir: string): Promise<PipelineState | null> {
  const statePath = path.join(workDir, STATE_FILE);
  try {
    const content = await fs.readFile(statePath, 'utf-8');
    return JSON.parse(content);
  } catch (e) {
    return null;
  }
}

export async function saveState(workDir: string, state: PipelineState): Promise<void> {
  const statePath = path.join(workDir, STATE_FILE);
  await fs.writeFile(statePath, JSON.stringify(state, null, 2));
}

export async function initState(workDir: string): Promise<PipelineState> {
  const state: PipelineState = {
    currentPhase: 0,
    phases: PHASES,
    completed: false
  };
  await saveState(workDir, state);
  return state;
}

export function isPhaseOutputExists(workDir: string, phase: PipelinePhase): boolean {
  const outputPath = path.join(workDir, phase.outputFile);
  try {
    fsSync.accessSync(outputPath);
    return true;
  } catch {
    return false;
  }
}

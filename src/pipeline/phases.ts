
import { PipelinePhase } from '../types';

export const DEFAULT_PIPELINE_PHASES: PipelinePhase[] = [
  {
    name: 'Literature Collection',
    skill: 'research-collect',
    outputFile: 'survey_report.md',
    description: 'Search, filter and download relevant papers'
  },
  {
    name: 'Deep Survey',
    skill: 'research-survey',
    outputFile: 'survey_res.md',
    description: 'Deep analysis of papers, extract methods and formulas'
  },
  {
    name: 'Idea Generation',
    skill: 'idea-generation',
    outputFile: 'ideas/selected_idea.md',
    description: 'Generate research ideas and select the best one'
  },
  {
    name: 'Implementation Plan',
    skill: 'research-plan',
    outputFile: 'plan_res.md',
    description: 'Create detailed implementation plan'
  },
  {
    name: 'Code Implementation',
    skill: 'research-implement',
    outputFile: 'ml_res.md',
    description: 'Implement the code and run validation'
  },
  {
    name: 'Code Review',
    skill: 'research-review',
    outputFile: 'iterations/judge_v1.md',
    description: 'Review code and fix issues'
  },
  {
    name: 'Full Experiment',
    skill: 'research-experiment',
    outputFile: 'experiment_res.md',
    description: 'Run full training and ablation experiments'
  }
];

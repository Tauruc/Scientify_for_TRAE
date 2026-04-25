
import { MetabolismConfig } from './types.js';
import * as fs from 'fs/promises';
import * as path from 'path';

const CONFIG_FILE = 'metabolism_config.json';

export async function loadMetabolismConfig(workdir: string): Promise<MetabolismConfig | null> {
  try {
    const configPath = path.join(workdir, CONFIG_FILE);
    const data = await fs.readFile(configPath, 'utf-8');
    return JSON.parse(data);
  } catch {
    return null;
  }
}

export async function saveMetabolismConfig(workdir: string, config: MetabolismConfig): Promise<void> {
  const configPath = path.join(workdir, CONFIG_FILE);
  await fs.writeFile(configPath, JSON.stringify(config, null, 2));
}

export function createDefaultConfig(keywords: string[], categories: string[] = ['cs.CV', 'cs.CL', 'cs.LG']): MetabolismConfig {
  return {
    keywords,
    arxivCategories: categories,
    sources: ['arxiv', 'openalex'],
    currentDay: 0,
    processedIds: [],
    lastRunDate: undefined
  };
}

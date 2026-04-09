import { MetabolismConfig } from './types';
export declare function loadMetabolismConfig(workdir: string): Promise<MetabolismConfig | null>;
export declare function saveMetabolismConfig(workdir: string, config: MetabolismConfig): Promise<void>;
export declare function createDefaultConfig(keywords: string[], categories?: string[]): MetabolismConfig;

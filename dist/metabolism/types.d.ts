export interface MetabolismConfig {
    keywords: string[];
    arxivCategories: string[];
    sources: ('arxiv' | 'openalex')[];
    currentDay: number;
    processedIds: string[];
    lastRunDate?: string;
}
export interface Hypothesis {
    id: string;
    title: string;
    description: string;
    reasoning: string;
    sourcePapers: string[];
    noveltyScore: number;
    feasibilityScore: number;
    impactScore: number;
    createdAt: string;
}

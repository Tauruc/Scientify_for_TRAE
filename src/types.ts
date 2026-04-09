


export interface Paper {
  id: string;
  title: string;
  authors: string[];
  abstract?: string;
  year?: number;
  arxivId?: string;
  doi?: string;
  pdfUrl?: string;
  sourceUrl?: string;
}

export interface SearchResult {
  papers: Paper[];
  total: number;
}

export interface PipelinePhase {
  name: string;
  skill: string;
  outputFile: string;
  description: string;
}

export interface PipelineState {
  currentPhase: number;
  phases: PipelinePhase[];
  completed: boolean;
}

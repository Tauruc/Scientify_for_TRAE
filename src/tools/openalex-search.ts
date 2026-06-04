
import { Paper, SearchResult } from '../types';

/**
 * 将 OpenAlex 的 abstract_inverted_index（倒排索引）还原为文本摘要
 * OpenAlex 不返回 plain text abstract，而是返回 { "word": [pos1, pos2, ...], ... } 格式
 */
function parseInvertedIndex(index: Record<string, number[]> | undefined): string {
  if (!index || Object.keys(index).length === 0) return '';
  
  // 将所有 (位置, 单词) 对收集起来
  const pairs: [number, string][] = [];
  for (const [word, positions] of Object.entries(index)) {
    for (const pos of positions) {
      pairs.push([pos, word]);
    }
  }
  
  // 按位置排序后拼接
  pairs.sort((a, b) => a[0] - b[0]);
  return pairs.map(p => p[1]).join(' ');
}

export async function searchOpenAlex(query: string, maxResults: number = 20): Promise<SearchResult> {
  const papers: Paper[] = [];
  
  const encodedQuery = encodeURIComponent(query);
  const url = `https://api.openalex.org/works?search=${encodedQuery}&per-page=${maxResults}`;
  
  try {
    console.log(`Searching OpenAlex for: ${query}`);
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.results) {
      for (const work of data.results) {
        const arxivId = work.ids?.arxiv?.replace('https://arxiv.org/abs/', '');
        
        // OpenAlex 使用 abstract_inverted_index，需要反转后才能得到可读文本
        const abstractText = parseInvertedIndex(work.abstract_inverted_index);
        
        papers.push({
          id: work.id,
          title: work.title || '',
          authors: work.authorships?.map((a: any) => a.author?.display_name || '') || [],
          abstract: abstractText,
          year: work.publication_year,
          arxivId,
          doi: work.doi,
          pdfUrl: work.open_access?.oa_url || '',
          sourceUrl: work.ids?.arxiv || work.id
        });
      }
    }
    
    return {
      papers,
      total: papers.length
    };
  } catch (error) {
    console.error('Error searching OpenAlex:', error);
    return {
      papers: [],
      total: 0
    };
  }
}

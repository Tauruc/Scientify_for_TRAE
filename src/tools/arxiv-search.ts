
import { Paper, SearchResult } from '../types';
import { XMLParser } from 'fast-xml-parser';

export async function searchArxiv(query: string, maxResults: number = 30): Promise<SearchResult> {
  const papers: Paper[] = [];
  
  const encodedQuery = encodeURIComponent(query);
  const url = `https://export.arxiv.org/api/query?search_query=${encodedQuery}&start=0&max_results=${maxResults}`;
  
  try {
    console.log(`Searching arXiv for: ${query}`);
    
    const response = await fetch(url);
    const text = await response.text();
    
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_'
    });
    
    const parsed = parser.parse(text);
    const feed = parsed.feed || {};
    const entries = feed.entry || [];
    
    // 确保 entries 是数组
    const entryArray = Array.isArray(entries) ? entries : entries ? [entries] : [];
    
    for (const entry of entryArray) {
      const id = entry.id || '';
      const arxivId = id.replace('http://arxiv.org/abs/', '').replace('https://arxiv.org/abs/', '');
      
      const authors = Array.isArray(entry.author) 
        ? entry.author.map((a: any) => a.name)
        : entry.author ? [entry.author.name] : [];
      
      const year = entry.published 
        ? new Date(entry.published).getFullYear() 
        : undefined;
      
      // 获取 PDF 链接
      let pdfUrl = '';
      const links = Array.isArray(entry.link) ? entry.link : entry.link ? [entry.link] : [];
      for (const link of links) {
        if (link['@_rel'] === 'alternate' && link['@_href']) {
          pdfUrl = link['@_href'].replace('abs', 'pdf') + '.pdf';
          break;
        }
      }
      
      papers.push({
        id: arxivId,
        arxivId: arxivId,
        title: entry.title?.trim() || '',
        authors,
        abstract: entry.summary?.trim(),
        year,
        pdfUrl,
        sourceUrl: `https://arxiv.org/abs/${arxivId}`
      });
    }
    
    return {
      papers,
      total: papers.length
    };
  } catch (error) {
    console.error('Error searching arXiv:', error);
    return {
      papers: [],
      total: 0
    };
  }
}
export async function searchOpenAlex(query, maxResults = 20) {
    const papers = [];
    const encodedQuery = encodeURIComponent(query);
    const url = `https://api.openalex.org/works?search=${encodedQuery}&per-page=${maxResults}`;
    try {
        console.log(`Searching OpenAlex for: ${query}`);
        const response = await fetch(url);
        const data = await response.json();
        if (data.results) {
            for (const work of data.results) {
                const arxivId = work.ids?.arxiv?.replace('https://arxiv.org/abs/', '');
                papers.push({
                    id: work.id,
                    title: work.title || '',
                    authors: work.authorships?.map((a) => a.author?.display_name || '') || [],
                    abstract: work.abstract,
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
    }
    catch (error) {
        console.error('Error searching OpenAlex:', error);
        return {
            papers: [],
            total: 0
        };
    }
}

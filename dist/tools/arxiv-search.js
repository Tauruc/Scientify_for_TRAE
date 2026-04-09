export async function searchArxiv(query, maxResults = 30) {
    const papers = [];
    const encodedQuery = encodeURIComponent(query);
    const url = `https://export.arxiv.org/api/query?search_query=${encodedQuery}&start=0&max_results=${maxResults}`;
    try {
        console.log(`Searching arXiv for: ${query}`);
        const response = await fetch(url);
        const text = await response.text();
        const parser = new DOMParser();
        const xml = parser.parseFromString(text, 'text/xml');
        const entries = xml.getElementsByTagName('entry');
        for (let i = 0; i < entries.length; i++) {
            const entry = entries[i];
            const idElement = entry.getElementsByTagName('id')[0];
            const titleElement = entry.getElementsByTagName('title')[0];
            const summaryElement = entry.getElementsByTagName('summary')[0];
            const publishedElement = entry.getElementsByTagName('published')[0];
            const authorElements = entry.getElementsByTagName('author');
            const linkElements = entry.getElementsByTagName('link');
            const id = idElement?.textContent || '';
            const arxivId = id.replace('http://arxiv.org/abs/', '').replace('https://arxiv.org/abs/', '');
            const authors = [];
            for (let j = 0; j < authorElements.length; j++) {
                const nameElement = authorElements[j].getElementsByTagName('name')[0];
                if (nameElement?.textContent) {
                    authors.push(nameElement.textContent);
                }
            }
            const year = publishedElement?.textContent
                ? new Date(publishedElement.textContent).getFullYear()
                : undefined;
            let pdfUrl = '';
            for (let j = 0; j < linkElements.length; j++) {
                const rel = linkElements[j].getAttribute('rel');
                const href = linkElements[j].getAttribute('href');
                if (rel === 'alternate' && href) {
                    pdfUrl = href.replace('abs', 'pdf') + '.pdf';
                }
            }
            papers.push({
                id: arxivId,
                arxivId: arxivId,
                title: titleElement?.textContent?.trim() || '',
                authors,
                abstract: summaryElement?.textContent?.trim(),
                year,
                pdfUrl,
                sourceUrl: `https://arxiv.org/abs/${arxivId}`
            });
        }
        return {
            papers,
            total: papers.length
        };
    }
    catch (error) {
        console.error('Error searching arXiv:', error);
        return {
            papers: [],
            total: 0
        };
    }
}

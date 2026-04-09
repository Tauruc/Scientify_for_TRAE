
import { Paper } from '../types';

export async function downloadPaper(paper: Paper, targetDir: string): Promise<string | null> {
  const fs = await import('fs/promises');
  const path = await import('path');
  
  try {
    await fs.mkdir(targetDir, { recursive: true });
    
    if (paper.arxivId) {
      const arxivId = paper.arxivId;
      const paperDir = path.join(targetDir, arxivId);
      await fs.mkdir(paperDir, { recursive: true });
      
      console.log(`Downloading arXiv source: ${arxivId}`);
      
      try {
        const sourceUrl = `https://arxiv.org/src/${arxivId}`;
        const response = await fetch(sourceUrl);
        
        if (response.ok) {
          const buffer = await response.arrayBuffer();
          await fs.writeFile(path.join(paperDir, `${arxivId}.tar.gz`), Buffer.from(buffer));
          return paperDir;
        }
      } catch (e) {
        console.log('Source download failed, falling back to PDF');
      }
      
      const pdfUrl = `https://arxiv.org/pdf/${arxivId}.pdf`;
      const pdfResponse = await fetch(pdfUrl);
      
      if (pdfResponse.ok) {
        const buffer = await pdfResponse.arrayBuffer();
        await fs.writeFile(path.join(targetDir, `${arxivId}.pdf`), Buffer.from(buffer));
        return path.join(targetDir, `${arxivId}.pdf`);
      }
    } else if (paper.pdfUrl) {
      console.log(`Downloading PDF: ${paper.pdfUrl}`);
      
      const response = await fetch(paper.pdfUrl);
      
      if (response.ok) {
        const buffer = await response.arrayBuffer();
        const filename = paper.id.replace(/[^a-zA-Z0-9]/g, '_') + '.pdf';
        const filepath = path.join(targetDir, filename);
        await fs.writeFile(filepath, Buffer.from(buffer));
        return filepath;
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error downloading paper:', error);
    return null;
  }
}

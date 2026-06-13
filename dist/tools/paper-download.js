import { execSync } from 'child_process';
/**
 * 下载论文，优先获取 LaTeX 源文件，自动解压
 */
export async function downloadPaper(paper, targetDir) {
    const fs = await import('fs/promises');
    const path = await import('path');
    try {
        await fs.mkdir(targetDir, { recursive: true });
        if (paper.arxivId) {
            const arxivId = paper.arxivId;
            const paperDir = path.join(targetDir, arxivId);
            await fs.mkdir(paperDir, { recursive: true });
            // ========== Step 1: 优先下载 LaTeX 源文件 ==========
            // 正确 URL 是 e-print（非 src），返回 .tar.gz 源文件包
            const sourceUrl = `https://arxiv.org/e-print/${arxivId}`;
            console.log(`Downloading arXiv LaTeX source: ${arxivId}`);
            try {
                const response = await fetch(sourceUrl);
                if (response.ok && response.headers.get('content-type')?.includes('application')) {
                    const buffer = await response.arrayBuffer();
                    const tarPath = path.join(paperDir, `${arxivId}.tar.gz`);
                    await fs.writeFile(tarPath, Buffer.from(buffer));
                    // ========== Step 2: 自动解压 ==========
                    console.log(`Extracting ${arxivId}.tar.gz...`);
                    try {
                        // Windows 10+ 和 Unix 都内置 tar 命令
                        execSync(`tar -xzf "${tarPath}" -C "${paperDir}"`, {
                            encoding: 'utf8',
                            stdio: 'pipe'
                        });
                        // 解压成功，删除压缩包
                        await fs.unlink(tarPath);
                        // 列出解压后的文件
                        const files = await fs.readdir(paperDir);
                        const texFiles = files.filter(f => f.endsWith('.tex'));
                        console.log(`Extracted ${files.length} files (${texFiles.length} .tex files) to ${paperDir}`);
                    }
                    catch (tarError) {
                        console.log('tar extraction failed, keeping .tar.gz as-is');
                        // 解压失败（某些特殊格式），保留压缩包
                    }
                    return paperDir;
                }
            }
            catch (e) {
                console.log('LaTeX source download failed, falling back to PDF');
            }
            // ========== Step 3: 降级到 PDF ==========
            const pdfUrl = `https://arxiv.org/pdf/${arxivId}.pdf`;
            console.log(`Downloading PDF fallback: ${arxivId}`);
            const pdfResponse = await fetch(pdfUrl);
            if (pdfResponse.ok) {
                const buffer = await pdfResponse.arrayBuffer();
                await fs.writeFile(path.join(targetDir, `${arxivId}.pdf`), Buffer.from(buffer));
                return path.join(targetDir, `${arxivId}.pdf`);
            }
        }
        else if (paper.pdfUrl) {
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
    }
    catch (error) {
        console.error('Error downloading paper:', error);
        return null;
    }
}

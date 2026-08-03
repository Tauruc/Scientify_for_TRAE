import { execSync } from 'child_process';
/**
 * 下载论文，优先获取 LaTeX 源文件，自动解压
 *
 * 返回值含义：
 *   "tex:{path}"  — 成功下载 LaTeX 源文件并解压
 *   "pdf:{path}"  — 降级为 PDF 下载
 *   null          — 下载完全失败
 */
export async function downloadPaper(paper, targetDir) {
    const fs = await import('fs/promises');
    const path = await import('path');
    try {
        await fs.mkdir(targetDir, { recursive: true });
        if (paper.arxivId) {
            const arxivId = paper.arxivId;
            const paperDir = path.join(targetDir, arxivId);
            // ========== Step 1: 优先下载 LaTeX 源文件 ==========
            const sourceUrl = `https://arxiv.org/e-print/${arxivId}`;
            console.log(`[paper-download] Trying LaTeX source: ${arxivId}`);
            let sourceDownloaded = false;
            try {
                const response = await fetch(sourceUrl);
                const contentType = response.headers.get('content-type') || '';
                // 只有确认为 tar/gzip 格式才走解压流程
                // arXiv 无源文件时会重定向到 PDF（content-type: application/pdf），
                // 必须精确匹配，不能泛用 includes('application')
                const isTarGzip = contentType.includes('application/x-eprint') ||
                    contentType.includes('application/x-tar') ||
                    contentType.includes('application/gzip') ||
                    contentType.includes('application/x-gzip');
                if (response.ok && isTarGzip) {
                    const buffer = await response.arrayBuffer();
                    // 防御：内容为空也跳过
                    if (buffer.byteLength < 100) {
                        console.log('[paper-download] Response too small, not a valid tarball');
                    }
                    else {
                        await fs.mkdir(paperDir, { recursive: true });
                        const tarPath = path.join(paperDir, `${arxivId}.tar.gz`);
                        await fs.writeFile(tarPath, Buffer.from(buffer));
                        console.log(`[paper-download] Extracting ${arxivId}.tar.gz...`);
                        try {
                            execSync(`tar -xzf "${tarPath}" -C "${paperDir}"`, {
                                encoding: 'utf8',
                                stdio: 'pipe',
                            });
                            await fs.unlink(tarPath);
                            const files = await fs.readdir(paperDir);
                            const texFiles = files.filter((f) => f.endsWith('.tex'));
                            if (texFiles.length > 0) {
                                console.log(`[paper-download] OK: ${files.length} files, ${texFiles.length} .tex`);
                                sourceDownloaded = true;
                            }
                            else {
                                // 解压成功但没有任何 .tex 文件，视为失败
                                console.log('[paper-download] No .tex files found after extraction');
                                await fs.rm(paperDir, { recursive: true, force: true });
                            }
                        }
                        catch (tarError) {
                            // 解压失败，清理目录，降级到 PDF
                            console.log('[paper-download] tar extraction failed, cleaning up');
                            try {
                                await fs.rm(paperDir, { recursive: true, force: true });
                            }
                            catch (_) { }
                        }
                    }
                }
                else {
                    console.log(`[paper-download] e-print unavailable (status=${response.status}, type=${contentType})`);
                }
            }
            catch (e) {
                console.log('[paper-download] LaTeX source request failed:', e);
            }
            if (sourceDownloaded) {
                return `tex:${paperDir}`;
            }
            // ========== Step 2: 降级到 PDF ==========
            const pdfUrl = `https://arxiv.org/pdf/${arxivId}.pdf`;
            console.log(`[paper-download] Falling back to PDF: ${arxivId}`);
            try {
                const pdfResponse = await fetch(pdfUrl);
                if (pdfResponse.ok) {
                    const buffer = await pdfResponse.arrayBuffer();
                    if (buffer.byteLength > 100) {
                        const pdfPath = path.join(targetDir, `${arxivId}.pdf`);
                        await fs.writeFile(pdfPath, Buffer.from(buffer));
                        console.log(`[paper-download] PDF saved: ${pdfPath}`);
                        return `pdf:${pdfPath}`;
                    }
                }
            }
            catch (e) {
                console.log('[paper-download] PDF fallback also failed:', e);
            }
            return null;
        }
        // DOI / 外部 PDF
        if (paper.pdfUrl) {
            console.log(`[paper-download] Downloading external PDF: ${paper.pdfUrl}`);
            const response = await fetch(paper.pdfUrl);
            if (response.ok) {
                const buffer = await response.arrayBuffer();
                const filename = paper.id.replace(/[^a-zA-Z0-9]/g, '_') + '.pdf';
                const filepath = path.join(targetDir, filename);
                await fs.writeFile(filepath, Buffer.from(buffer));
                return `pdf:${filepath}`;
            }
        }
        return null;
    }
    catch (error) {
        console.error('[paper-download] Fatal error:', error);
        return null;
    }
}

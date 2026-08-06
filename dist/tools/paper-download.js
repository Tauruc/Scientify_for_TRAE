import { execSync } from 'child_process';
/**
 * 验证 buffer 是否以 PDF 魔数 %PDF- 开头
 * arXiv 限流时会返回 HTML 页（HTTP 200），没有此检查会被存为假 PDF
 */
function isPdfBuffer(buffer) {
    const header = new Uint8Array(buffer.slice(0, 5));
    // %PDF- = [37, 80, 68, 70, 45]
    return (header[0] === 0x25 &&
        header[1] === 0x50 &&
        header[2] === 0x44 &&
        header[3] === 0x46 &&
        header[4] === 0x2d);
}
/**
 * 下载论文，优先获取 LaTeX 源文件，自动解压
 *
 * 返回值含义：
 *   "tex:{path}"  — 成功下载 LaTeX 源文件并解压
 *   "pdf:{path}"  — 降级为 PDF 下载（已验证 PDF 魔数）
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
                const contentType = (response.headers.get('content-type') || '').toLowerCase();
                // 精确匹配 tar/gzip 类型
                const isTarGzip = contentType.includes('application/x-eprint') ||
                    contentType.includes('application/x-tar') ||
                    contentType.includes('application/gzip') ||
                    contentType.includes('application/x-gzip');
                if (response.ok && isTarGzip) {
                    const buffer = await response.arrayBuffer();
                    if (buffer.byteLength < 512) {
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
                                console.log('[paper-download] No .tex files found after extraction');
                                await fs.rm(paperDir, { recursive: true, force: true });
                            }
                        }
                        catch (tarError) {
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
                const pdfContentType = (pdfResponse.headers.get('content-type') || '').toLowerCase();
                // arXiv 限流时返回 HTML（text/html），被误存为 PDF 是之前"撒谎"的残留原因
                if (pdfResponse.ok && pdfContentType.includes('application/pdf')) {
                    const buffer = await pdfResponse.arrayBuffer();
                    // 双重验证：content-type 可能被伪造，PDF 魔数不会骗人
                    if (buffer.byteLength > 512 && isPdfBuffer(buffer)) {
                        const pdfPath = path.join(targetDir, `${arxivId}.pdf`);
                        await fs.writeFile(pdfPath, Buffer.from(buffer));
                        console.log(`[paper-download] PDF verified: ${pdfPath} (${(buffer.byteLength / 1024).toFixed(0)} KB)`);
                        return `pdf:${pdfPath}`;
                    }
                    else {
                        console.log('[paper-download] Response is not a valid PDF (magic bytes mismatch)');
                    }
                }
                else {
                    console.log(`[paper-download] PDF unavailable (status=${pdfResponse.status}, type=${pdfContentType})`);
                }
            }
            catch (e) {
                console.log('[paper-download] PDF fallback also failed:', e);
            }
            return null;
        }
        // ========== DOI / 外部 PDF ==========
        if (paper.pdfUrl) {
            console.log(`[paper-download] Downloading external PDF: ${paper.pdfUrl}`);
            try {
                const response = await fetch(paper.pdfUrl);
                const contentType = (response.headers.get('content-type') || '').toLowerCase();
                if (response.ok && contentType.includes('application/pdf')) {
                    const buffer = await response.arrayBuffer();
                    if (buffer.byteLength > 512 && isPdfBuffer(buffer)) {
                        const filename = paper.id.replace(/[^a-zA-Z0-9]/g, '_') + '.pdf';
                        const filepath = path.join(targetDir, filename);
                        await fs.writeFile(filepath, Buffer.from(buffer));
                        return `pdf:${filepath}`;
                    }
                }
            }
            catch (e) {
                console.log('[paper-download] External PDF failed:', e);
            }
        }
        return null;
    }
    catch (error) {
        console.error('[paper-download] Fatal error:', error);
        return null;
    }
}

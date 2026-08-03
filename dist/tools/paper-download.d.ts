import { Paper } from '../types';
/**
 * 下载论文，优先获取 LaTeX 源文件，自动解压
 *
 * 返回值含义：
 *   "tex:{path}"  — 成功下载 LaTeX 源文件并解压
 *   "pdf:{path}"  — 降级为 PDF 下载
 *   null          — 下载完全失败
 */
export declare function downloadPaper(paper: Paper, targetDir: string): Promise<string | null>;

import { Paper } from '../types';
/**
 * 下载论文，优先获取 LaTeX 源文件，自动解压
 */
export declare function downloadPaper(paper: Paper, targetDir: string): Promise<string | null>;

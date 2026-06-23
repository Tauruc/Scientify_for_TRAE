---
name: research-collect
description: "[Read when prompt contains /research-collect]"
metadata:
  {
    "openclaw":
      {
        "emoji": "🔍",
      },
  }
---

# Literature Survey

**Don't ask permission. Just do it.**

## Output Structure

```
├── papers/
│   ├── {arxiv_id}/             # LaTeX 源文件目录（必须含 .tex 文件）
│   ├── {doi_slug}.pdf          # DOI 论文 PDF（无可避免时）
│   └── {direction}/            # 整理后的分类目录
├── repos/                      # 参考代码仓库（Phase 3）
└── survey_report.md            # 调研报告
```

---

## Workflow

### Phase 1: 准备

```bash
mkdir -p "papers"
```

生成 4-8 个检索词。

---

### Phase 2: 增量搜索-筛选-下载（循环）

**对每个检索词重复以下步骤**：

#### 2.1 搜索（优先 MCP 工具）

**主搜索手段**：必须调用 MCP 工具，获取结构化结果。

```
# arXiv 搜索 — 调用 MCP 工具 arxiv_search
run_mcp({
  server_name: "scientify-tools",
  tool_name: "arxiv_search",
  args: { query: "<term>", max_results: 30 }
})

# OpenAlex 搜索 — 调用 MCP 工具 openalex_search
run_mcp({
  server_name: "scientify-tools",
  tool_name: "openalex_search",
  args: { query: "<term>", max_results: 20 }
})
```

合并两个来源的结果，按 arXiv ID / DOI 去重。

**补充手段**：可以自行上网搜索作为补充（WebSearch），但不能替代 MCP 工具调用。MCP 工具返回的是结构化数据，便于后续处理和验证。

#### 2.2 筛选

只看**相关性**——这篇论文是否和研究主题直接相关？

- **相关**：直接研究该主题，或提出了可借鉴的方法 → 保留
- **不相关**：主题偏离，仅在关键词上有交集 → 跳过

#### 2.3 下载论文（必须调用 MCP paper_download）

**主下载手段**：调用 MCP 工具 `paper_download`。该工具已配置为优先下载 LaTeX 源文件并自动解压。

```
# 对每篇筛选通过的 arXiv 论文
run_mcp({
  server_name: "scientify-tools",
  tool_name: "paper_download",
  args: { arxiv_id: "<id>", target_dir: "papers" }
})
```

**补充手段**：如果 MCP 工具下载失败（网络问题等），可以通过 curl 自行下载，但必须尝试获取 LaTeX 源文件：

```bash
# 手动下载 LaTeX 源文件（仅作 MCP 失败后的补充）
mkdir -p papers/{arxiv_id}
curl -L "https://arxiv.org/e-print/{arxiv_id}" -o "papers/{arxiv_id}/{arxiv_id}.tar.gz"
tar -xzf "papers/{arxiv_id}/{arxiv_id}.tar.gz" -C "papers/{arxiv_id}" && rm "papers/{arxiv_id}/{arxiv_id}.tar.gz"
```

> **严禁仅下载 PDF！** PDF 中公式、表格、算法伪代码无法被 AI 准确读取。

#### 2.4 LaTeX 源文件校验关卡（Gate）

**每篇论文下载完成后，必须立即验证：**

```bash
# 检查 papers/{arxiv_id}/ 目录下是否存在 .tex 文件
ls papers/{arxiv_id}/*.tex 2>/dev/null || echo "MISSING"
```

**判定规则**：
- ✅ 存在 ≥1 个 `.tex` 文件 → 通过，继续下一环节
- ❌ 没有任何 `.tex` 文件 → **不通过**，必须重新下载

**不通过时的处理流程**：
1. 尝试 MCP paper_download 重新下载
2. 如果 MCP 失败，尝试手动 curl LaTeX 源文件
3. 如果该论文确实不提供 LaTeX 源（极少见），标注为 `⚠️ PDF-ONLY` 并在报告中注明
4. 每个检索词至少有 **80%** 的论文有 `.tex` 源文件，否则该检索词视为不合格

**完成一个检索词后，再进行下一个。** 这样避免上下文被大量搜索结果污染。

---

### Phase 3: GitHub 代码搜索与参考仓库选择

**目标**：为下游 skill（research-survey、research-plan、research-implement）提供可参考的开源实现。

#### 3.1 选择论文

从 `papers/` 中选出 **Top 5** 最相关论文。

#### 3.2 搜索参考仓库

对每篇选中论文，用以下关键词组合搜索 GitHub 仓库：
- 论文标题 + "code" / "implementation"
- 核心方法名 + 作者名
- 论文中提到的数据集名 + 任务名

```bash
gh search repos "{paper_title} implementation" --limit 10 --sort stars --language python
```

#### 3.3 筛选与 clone

选择 **3-5 个**最相关的仓库：

```bash
mkdir -p "repos"
git clone --depth 1 <repo_url> "repos/{name}"
```

**如果搜不到相关仓库**，跳过本阶段。

---

### Phase 4: 分类整理

所有检索词完毕后：

#### 4.1 聚类分析

根据已下载论文的标题和摘要，识别 3-6 个研究方向。

#### 4.2 创建分类目录

```bash
mkdir -p "papers/{direction}"
mv "papers/2401.12345" "papers/data-driven/"
```

#### 4.3 最终 LaTeX 源文件审计

**在分类整理完成后，输出审计报告：**

```bash
# 统计所有论文的 .tex 文件覆盖率
echo "=== LaTeX Source Audit ==="
for dir in papers/*/; do
  tex_count=$(ls "$dir"*.tex 2>/dev/null | wc -l)
  if [ "$tex_count" -gt 0 ]; then
    echo "✅ $(basename $dir): $tex_count .tex files"
  else
    echo "❌ $(basename $dir): NO .tex FILES"
  fi
done
```

在 `survey_report.md` 的调研概要中必须包含：
```
LaTeX 源文件覆盖率: {N}/{M} ({percent}%)
```

---

### Phase 5: 生成报告

创建 `survey_report.md`：
- 调研概要（检索词数、论文数、方向数、**LaTeX 覆盖率**）
- 各研究方向概述
- Top 10 论文（标题 + ID + 一句话价值）
- 参考仓库摘要（如有）
- 建议阅读顺序

---

## Quality Gates（质量关卡）

| 关卡 | 位置 | 判定标准 | 不通过后果 |
|------|------|----------|------------|
| Gate 1 | Phase 2.4（每篇下载后） | `papers/{id}/` 存在 ≥1 个 `.tex` 文件 | 重新下载，最多重试 3 次 |
| Gate 2 | Phase 2.4（每个检索词后） | 该检索词 ≥80% 论文有 `.tex` | 该检索词标记为不合格，补充下载 |
| Gate 3 | Phase 4.3（分类完成后） | 全量 LaTeX 覆盖率 > 0% | 输出审计报告，标注 PDF-only 论文 |

## 关键设计

| 原则 | 说明 |
|------|------|
| **MCP 工具优先** | 搜索和下载必须调用 MCP 工具（结构化数据 + LaTeX 源文件） |
| **Web 搜索为补充** | 上网搜索/下载仅作 MCP 失败后的 fallback，不能替代 |
| **LaTeX 强制** | PDF 对于公式/表格/算法的提取不准确，LaTeX 源是刚需 |
| **增量处理** | 每个检索词独立完成搜索→筛选→下载，避免上下文膨胀 |
| **文件夹即分类** | 聚类结果通过 `papers/{direction}/` 体现 |

## Tools / Commands

| Tool / Command | 调用方式 | Purpose |
|----------------|----------|---------|
| `arxiv_search` | `run_mcp(server: "scientify-tools", tool: "arxiv_search")` | **[强制]** 搜索 arXiv 论文 |
| `openalex_search` | `run_mcp(server: "scientify-tools", tool: "openalex_search")` | **[强制]** 搜索跨学科论文 |
| `paper_download` | `run_mcp(server: "scientify-tools", tool: "paper_download")` | **[强制]** 下载论文（LaTeX 源文件优先） |
| `WebSearch` | WebSearch({ query }) | [补充] 辅助搜索，MCP 不可用时的 fallback |
| `WebFetch` | WebFetch({ url }) | [补充] 辅助下载，仅 MCP 失败后使用 |
| `gh search repos "query"` | `RunCommand` | 搜索 GitHub 仓库 |

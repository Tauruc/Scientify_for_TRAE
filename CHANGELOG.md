# 改动日志

**项目**: Scientify for TRAE  
**许可证**: CC BY-NC 4.0

---

## [v3.2.1] - 2026-06-05

### 🐛 Bug 修复

#### OpenAlex 搜索缺少摘要
- **问题**: OpenAlex 搜索结果返回的论文没有摘要内容
- **原因**: OpenAlex API 不返回 `abstract` 字段，而是返回 `abstract_inverted_index`（倒排索引格式），原代码直接读取了不存在的 `work.abstract`
- **修复**: 新增 `parseInvertedIndex()` 函数，将倒排索引 `{ "word": [pos1, pos2] }` 还原为可读文本
- **文件**: `src/tools/openalex-search.ts`

### ✅ 验证结果
- ✅ OpenAlex 搜索现在返回完整摘要
- ✅ MCP Server 工具调用正常

---

## [v3.2.0] - 2026-04-26

### 🎯 主要改动
本次更新将 Scientify for TRAE 改造为**标准的 MCP Server**，实现了 AI 通过 TRAE MCP 协议真实调用工具函数的能力。

### ✨ 新增功能

#### MCP Server 实现
- 新增 `src/mcp-server.ts` - MCP Server 主入口
- 实现了 4 个 MCP 工具：
  - `arxiv_search` - 搜索 arXiv 论文
  - `openalex_search` - 搜索跨学科论文
  - `paper_download` - 下载论文
  - `detect_hardware` - 检测硬件配置
- 更新 `package.json` 添加 `"bin"` 字段

### 🐛 Bug 修复

#### arXiv 搜索返回空结果
- **问题**: arXiv 搜索返回空结果
- **原因**: 使用了浏览器专用的 `DOMParser` API
- **修复**: 使用 `fast-xml-parser` 库重写 XML 解析逻辑
- **文件**: `src/tools/arxiv-search.ts`

#### ESM 模块路径错误
- **问题**: Node.js ESM 模块解析失败
- **原因**: 相对路径导入缺少 `.js` 扩展名
- **修复**: 在所有源文件的相对导入中添加 `.js` 扩展名
- **文件**: `src/tools/index.ts`, `src/index.ts`, `src/metabolism/*.ts`, `src/pipeline/*.ts`

#### 存储空间检测错误
- **问题**: 存储空间显示 0GB（实际 501GB）
- **原因**: `fsutil` 命令在中文 Windows 下输出 GBK 编码，Node.js UTF-8 读取乱码
- **修复**: 使用 PowerShell `Get-PSDrive` 命令替代 `fsutil`
- **文件**: `src/tools/hardware-check.ts` (第 78-94 行)

### 📦 依赖变更

#### 新增
- `@modelcontextprotocol/sdk@^1.29.0` - MCP 协议实现
- `fast-xml-parser@^5.7.2` - Node.js XML 解析

### 📚 文档更新

#### 新增
- `mcp.example.json` - MCP 配置示例

#### 修改
- `README.md` - 更新为三步安装法，添加 MCP 配置说明

### 📊 改动统计
- **新增文件**: 2 个（`src/mcp-server.ts`, `mcp.example.json`）
- **修改文件**: 13 个（源代码、配置、文档）
- **新增依赖**: 2 个
- **修复问题**: 4 个（MCP 集成、arXiv 搜索、ESM 路径、存储检测）

### ✅ 验证结果
- ✅ MCP Server 启动成功
- ✅ 硬件检测工具正常工作
- ✅ arXiv 搜索返回正确结果（5 篇论文）
- ✅ OpenAlex 搜索正常工作
- ✅ 存储空间正确显示
- ✅ 工具调用链路完整

---

## [v3.1.0] - 之前的版本

### 功能
- 基础工具函数实现
- 技能系统框架
- 知识代谢功能
- 端到端研究流程

### 已知问题
- ❌ arXiv 搜索返回空结果
- ❌ ESM 模块路径错误
- ❌ 存储空间检测错误
- ❌ 无法通过 MCP 调用工具

---

## 版本说明

### 版本号规则
- **主版本号**: 重大架构变更
- **次版本号**: 新功能或重要修复
- **修订号**: 小修复（当前未使用）

### 时间格式
- 所有日期格式：YYYY-MM-DD
- 按时间倒序排列（最新的在前面）

---

## � 记录规范

### 每次提交时更新 CHANGELOG.md

1. **有新版本时**：
   - 在顶部添加新版本记录
   - 包含版本号、日期、改动分类

2. **改动分类**：
   - `✨ 新增功能` - 新功能、新工具、新文档
   - `🐛 Bug 修复` - 修复错误、性能优化
   - `📦 依赖变更` - 新增/删除/更新依赖
   - `📚 文档更新` - 文档修改、注释更新
   - `⚠️ 破坏性变更` - 不兼容的改动

3. **格式要求**：
   - 每个改动都要说明：问题、原因、解决方案、修改文件
   - 代码示例使用 ```typescript 代码块
   - 使用 ✅ ❌ 等 emoji 增强可读性

### 示例模板

```markdown
## [vX.Y.Z] - YYYY-MM-DD

### ✨ 新增功能
- 功能描述
  - 详细说明
  - 相关文件

### � Bug 修复
#### 问题简述
- **问题**: 描述问题现象
- **原因**: 根本原因分析
- **修复**: 解决方案
- **文件**: `修改的文件路径`

### 📦 依赖变更
- 新增：`package@version`
- 删除：`package@version`

### ✅ 验证结果
- ✅ 测试项 1
- ✅ 测试项 2
```

---

**最后更新**: 2026-04-26  
**当前版本**: v3.2.0  

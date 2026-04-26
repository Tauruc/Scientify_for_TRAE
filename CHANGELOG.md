# 改动日志 - MCP Server 实现与 arXiv 搜索修复

**日期**: 2026-04-26  
**版本**: v3.2.0  
**主要改动**: MCP Server 实现、arXiv 搜索修复、ESM 路径修复

---

##  改动概述

本次改动将 Scientify for TRAE 从普通的 npm 包改造为**标准的 MCP Server**，使 AI 能够通过 TRAE 的 MCP 协议真实调用工具函数，并修复了 arXiv 搜索返回空结果的问题。

---

## 📦 核心改动

### 1. MCP Server 实现

#### 新增文件
- `src/mcp-server.ts` - MCP Server 主入口文件

#### 功能
实现了 4 个 MCP 工具：
1. **arxiv_search** - 搜索 arXiv 论文
2. **openalex_search** - 搜索跨学科论文
3. **paper_download** - 下载论文
4. **detect_hardware** - 检测硬件配置

#### 修改文件
- `package.json` - 添加 `"bin"` 字段和 MCP SDK 依赖

---

### 2. arXiv 搜索修复

#### 问题
arXiv 搜索返回空结果，因为使用了浏览器专用的 `DOMParser` API。

#### 解决方案
- 安装 `fast-xml-parser` 库
- 重写 XML 解析逻辑，使用 Node.js 兼容的方式

#### 修改文件
- `src/tools/arxiv-search.ts` - 替换 DOMParser 为 fast-xml-parser
- `package.json` - 添加 fast-xml-parser 依赖

---

### 3. ESM 模块路径修复

#### 问题
Node.js ESM 要求所有相对路径导入必须包含 `.js` 扩展名。

#### 解决方案
在所有 TypeScript 源文件的相对导入中显式添加 `.js` 扩展名。

#### 修改文件
- `src/tools/index.ts`
- `src/index.ts`
- `src/metabolism/config.ts`
- `src/metabolism/heartbeat.ts`
- `src/metabolism/scheduler.ts`
- `src/metabolism/index.ts`
- `src/pipeline/orchestrator.ts`
- `src/pipeline/index.ts`
- `src/mcp-server.ts`

---

### 4. 文档更新

#### 新增文件
- `mcp.example.json` - MCP 配置示例
- `TEST_MCP.md` - MCP Server 测试指南
- `MCP_SERVER_SUMMARY.md` - MCP Server 改造总结
- `QUICK_REFERENCE.md` - 快速参考卡片
- `ESM_PATH_FIX.md` - ESM 路径修复详细说明
- `ARXIV_FIX.md` - arXiv 搜索修复记录
- `CHANGELOG.md` - 改动日志（本文件）

#### 修改文件
- `README.md` - 更新为三步安装法，添加 MCP 配置说明

---

## 📊 改动统计

| 类型 | 数量 | 说明 |
|------|------|------|
| 新增文件 | 8 | MCP Server、文档、配置 |
| 修改文件 | 13 | 源代码、配置、文档 |
| 新增依赖 | 2 | @modelcontextprotocol/sdk, fast-xml-parser |
| 修复问题 | 3 | arXiv 搜索、ESM 路径、MCP 集成 |

---

## 🔧 技术细节

### MCP Server 架构

```
用户输入 → AI 理解意图 → MCP Tool Call → MCP Server → 工具函数 → API → 返回结果
```

### 关键代码变更

#### 1. MCP Server 入口（src/mcp-server.ts）
```typescript
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

const server = new Server({...}, { capabilities: { tools: {} } });

server.setRequestHandler(ListToolsRequestSchema, async () => {...});
server.setRequestHandler(CallToolRequestSchema, async (request) => {...});
```

#### 2. arXiv 搜索修复（src/tools/arxiv-search.ts）
```typescript
// 修复前 ❌
const parser = new DOMParser();
const xml = parser.parseFromString(text, 'text/xml');

// 修复后 ✅
import { XMLParser } from 'fast-xml-parser';
const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_' });
const parsed = parser.parse(text);
```

#### 3. ESM 路径修复
```typescript
// 修复前 ❌
export { searchArxiv } from './arxiv-search';

// 修复后 ✅
export { searchArxiv } from './arxiv-search.js';
```

---

## ✅ 验证结果

### 测试通过
- ✅ MCP Server 启动成功
- ✅ 硬件检测工具正常工作
- ✅ arXiv 搜索返回正确结果（5 篇论文）
- ✅ OpenAlex 搜索正常工作
- ✅ 工具调用链路完整

### 测试命令
```bash
# 直接测试
node test-arxiv.js

# MCP Server 测试
@Builder with MCP 检测我的硬件配置
@Builder with MCP 搜索 5 篇关于 transformer efficiency 的论文
```

---

## 📦 依赖变更

### 新增依赖
```json
{
  "@modelcontextprotocol/sdk": "^1.29.0",
  "fast-xml-parser": "^5.7.2"
}
```

### 依赖用途
- `@modelcontextprotocol/sdk` - MCP 协议实现，用于 TRAE IDE 集成
- `fast-xml-parser` - Node.js XML 解析，替代浏览器 DOMParser

---

## 🚀 安装步骤变更

### 旧方法（已废弃）
```bash
npm install -g .  # ❌ 无法被 TRAE 识别
```

### 新方法（推荐）
```bash
# 1. 编译安装
npm install && npm run build && npm install -g .

# 2. 在 TRAE 中配置 MCP
# 设置 → MCP → 添加 → 手动添加
{
  "mcpServers": {
    "scientify-tools": {
      "command": "scientify-mcp",
      "args": []
    }
  }
}

# 3. 安装全局技能
# 设置 → 规则和技能 → 项目 → 应用到全局
```

---

## 🎯 功能对比

| 功能 | 改造前 | 改造后 |
|------|--------|--------|
| AI 调用工具 | ❌ 无法调用 | ✅ 通过 MCP 调用 |
| arXiv 搜索 | ❌ 返回空结果 | ✅ 正常返回 |
| 工具调用方式 | ❌ 伪代码 | ✅ 真实函数 |
| TRAE 集成 | ❌ 不支持 | ✅ 原生支持 |
| 可调试性 | ❌ 不可调试 | ✅ MCP 日志 |

---

## 📝 待办事项

### 已完成
- ✅ MCP Server 实现
- ✅ arXiv 搜索修复
- ✅ ESM 路径修复
- ✅ 文档更新
- ✅ 测试验证

### 未来计划
- [ ] 添加更多工具（GitHub 搜索、代码实现等）
- [ ] 工具组合（pipeline 工具）
- [ ] 配置管理工具
- [ ] 实验结果分析工具

---

## 🔗 相关文档

- [README.md](README.md) - 完整安装和使用指南
- [TEST_MCP.md](TEST_MCP.md) - 测试指南
- [MCP_SERVER_SUMMARY.md](MCP_SERVER_SUMMARY.md) - 改造总结
- [QUICK_REFERENCE.md](QUICK_REFERENCE.md) - 快速参考
- [ESM_PATH_FIX.md](ESM_PATH_FIX.md) - ESM 路径修复详解
- [ARXIV_FIX.md](ARXIV_FIX.md) - arXiv 搜索修复记录

---

## 👥 贡献者

- 实现：AI Assistant
- 测试：User
- 日期：2026-04-26

---

**状态**: ✅ 已完成并验证  
**版本**: v3.2.0  
**许可证**: CC BY-NC 4.0

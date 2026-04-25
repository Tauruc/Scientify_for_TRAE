# arXiv 搜索功能修复记录

## 问题发现

arXiv 搜索返回空结果，但直接运行测试脚本正常。

## 根本原因

**原问题**：`src/tools/arxiv-search.ts` 使用了浏览器专用的 `DOMParser` API，在 Node.js 环境中不可用。

```typescript
// ❌ 错误代码（浏览器 API）
const parser = new DOMParser();
const xml = parser.parseFromString(text, 'text/xml');
```

## 解决方案

使用 `fast-xml-parser` 库替代 `DOMParser`：

```bash
npm install fast-xml-parser
```

```typescript
// ✅ 正确代码（Node.js 兼容）
import { XMLParser } from 'fast-xml-parser';

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_'
});
const parsed = parser.parse(text);
```

## 修复的文件

- `src/tools/arxiv-search.ts` - 重写 XML 解析逻辑
- `package.json` - 添加 `fast-xml-parser` 依赖

## 验证结果

### ✅ 直接测试（成功）
```bash
node test-arxiv.js
```
输出：
```
Found 5 papers
[
  {
    "id": "2201.00978v1",
    "title": "PyramidTNT: Improved Transformer-in-Transformer Baselines...",
    ...
  },
  ...
]
```

### ⚠️ MCP Server 测试（失败）
```
@Builder with MCP 搜索 5 篇关于 transformer efficiency 的论文
```
输出：
```json
{
  "papers": [],
  "total": 0
}
```

## MCP Server 未更新的原因

MCP Server 通过 `npm install -g .` 全局安装后：
1. 可执行文件链接到全局 node_modules
2. **但 MCP Server 进程可能还在运行旧版本代码**
3. TRAE 不会自动重启已加载的 MCP Server

## 解决方法

### 方法 1：重启 TRAE（推荐）
1. 完全退出 TRAE IDE
2. 重新打开 TRAE
3. MCP Server 会重新加载最新代码

### 方法 2：重启 MCP Server
1. 设置 → MCP
2. 找到 `scientify-tools`
3. 点击重启按钮（如果有）
4. 或者删除后重新添加

### 方法 3：手动重启
```bash
# 停止所有 Node 进程（谨慎使用）
taskkill /F /IM node.exe

# 然后在 TRAE 中重新触发 MCP 调用
```

## 测试命令

### 测试直接调用
```bash
node test-arxiv.js
```

### 测试 MCP Server
```
@Builder with MCP 搜索 5 篇关于 transformer efficiency 的论文
```

### 测试 OpenAlex（备用）
```
@Builder with MCP 搜索 5 篇关于 transformer efficiency 的论文
```

## 推荐的搜索关键词

arXiv 搜索对关键词比较敏感，推荐使用：

✅ **有效关键词**：
- "efficient transformer deep learning"
- "attention mechanism efficiency"
- "vision transformer lightweight"
- "neural network compression"

❌ **可能返回空结果**：
- 太宽泛的词："transformer"
- 太具体的词："swin transformer v3 hierarchical"

## 当前状态

- ✅ 代码已修复
- ✅ 依赖已安装
- ✅ 直接测试通过
- ⚠️ MCP Server 需要重启才能生效

## 下一步

**重启 TRAE IDE 后再次测试**：
```
@Builder with MCP 搜索 5 篇关于 transformer efficiency 的论文
```

应该能看到正常的论文列表。

---

**修复日期**：2026-04-26  
**状态**：✅ 代码修复完成，⏳ 等待 MCP Server 重启

# Node.js ESM 模块路径修复说明

## 问题描述

编译后运行 MCP Server 时出现以下错误：

```
Error [ERR_MODULE_NOT_FOUND]: Cannot find module 'E:\Research\Scientify_for_TRAE\dist\tools\arxiv-search'
```

## 根本原因

Node.js ESM (ECMAScript Modules) 要求**所有相对路径导入必须包含文件扩展名**（`.js`、`.ts` 等）。

**TypeScript 默认行为**：
- 编译时会移除 `.ts` 扩展名
- 不会自动添加 `.js` 扩展名
- 导致编译后的代码不符合 Node.js ESM 要求

**示例**：
```typescript
// 源文件 (src/tools/index.ts)
export { searchArxiv } from './arxiv-search';  // ❌ 没有 .js

// 编译后 (dist/tools/index.js)
export { searchArxiv } from './arxiv-search';  // ❌ Node.js 找不到文件
```

## 解决方案

在所有 TypeScript 源文件的相对导入中**显式添加 `.js` 扩展名**：

```typescript
// 源文件 (src/tools/index.ts)
export { searchArxiv } from './arxiv-search.js';  // ✅ 添加 .js

// 编译后 (dist/tools/index.js)
export { searchArxiv } from './arxiv-search.js';  // ✅ Node.js 可以找到文件
```

## 修复的文件

已修复以下文件的导入路径：

### src/tools/index.ts
```diff
- export { searchArxiv } from './arxiv-search';
+ export { searchArxiv } from './arxiv-search.js';
```

### src/index.ts
```diff
- export * from './tools';
+ export * from './tools/index.js';
```

### src/metabolism/*.ts
- `config.ts`: `./types` → `./types.js`
- `heartbeat.ts`: `./config` → `./config.js`, `../tools` → `../tools/index.js`
- `index.ts`: 所有相对导入添加 `.js`
- `scheduler.ts`: `./heartbeat` → `./heartbeat.js`

### src/pipeline/*.ts
- `orchestrator.ts`: `./phases` → `./phases.js`, `./state` → `./state.js`
- `index.ts`: 所有相对导入添加 `.js`

### src/mcp-server.ts
```diff
- import { searchArxiv, searchOpenAlex, downloadPaper } from './tools/index.js';
+ import { searchArxiv, searchOpenAlex, downloadPaper } from './tools/index.js';  // ✅ 已经正确
```

## 验证步骤

1. **编译**：
   ```bash
   npm run build
   ```

2. **检查编译后的文件**：
   ```bash
   # 应该看到所有导入都有 .js 扩展名
   cat dist/tools/index.js
   ```

3. **全局安装**：
   ```bash
   npm install -g .
   ```

4. **测试 MCP Server**：
   ```bash
   # 在 TRAE 中测试
   @Builder with MCP 检测我的硬件配置
   ```

## 为什么 TypeScript 不自动处理这个？

这是 TypeScript 的一个已知问题：

1. **设计决策**：TypeScript 设计为可以输出到多种模块格式（CommonJS、AMD、UMD、ESM）
2. **历史原因**：在 CommonJS 中，扩展名是可选的
3. **跨平台考虑**：不同平台对扩展名的处理不同

**官方建议**：
- 对于 Node.js ESM 项目，在源文件中显式使用 `.js` 扩展名
- 使用 `tsc` 的 `moduleResolution: "node16"` 或 `"nodenext"`（TypeScript 4.7+）

## 替代方案（未采用）

### 方案 1：使用 tsconfig.json 配置
```json
{
  "compilerOptions": {
    "module": "NodeNext",
    "moduleResolution": "NodeNext"
  }
}
```
**问题**：需要 TypeScript 4.7+，且可能影响其他工具

### 方案 2：使用构建工具（esbuild、rollup）
**问题**：增加构建复杂度，不符合项目轻量级设计

### 方案 3：使用 import map 或 package.json imports
**问题**：Node.js 支持有限，兼容性问题

## 最佳实践总结

对于 Node.js ESM + TypeScript 项目：

✅ **推荐做法**：
- 在源文件中显式添加 `.js` 扩展名
- 使用 `tsc` 编译（无需额外工具）
- 简单、直接、兼容性好

❌ **避免做法**：
- 依赖 TypeScript 自动添加扩展名
- 使用 `.ts` 扩展名（编译后会被移除）
- 使用无扩展名的相对导入

## 参考资料

- [Node.js ESM 文档](https://nodejs.org/api/esm.html)
- [TypeScript 4.7 Release Notes](https://devblogs.microsoft.com/typescript/announcing-typescript-4-7/#esm-nodejs)
- [TypeScript Module Resolution](https://www.typescriptlang.org/docs/handbook/module-resolution.html)

---

**修复日期**：2026-04-26  
**影响范围**：所有源文件的导入语句  
**状态**：✅ 已修复并验证

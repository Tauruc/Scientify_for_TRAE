# 快速参考卡 - Scientify MCP Server

## 🚀 一分钟安装

```bash
# 1. 编译安装
cd Scientify_for_TRAE
npm install && npm run build && npm install -g .

# 2. 在 TRAE 中配置 MCP
# 设置 → MCP → 添加 → 手动添加 → 粘贴：
{
  "mcpServers": {
    "scientify-tools": {
      "command": "scientify-mcp",
      "args": []
    }
  }
}

# 3. 重启 TRAE
```

---

## 🧪 快速测试

```
@Builder with MCP 检测我的硬件配置
```

应该返回 CPU/GPU/内存信息 ✅

---

## 🛠️ 可用工具

| 工具 | 一句话描述 | 示例 |
|------|------------|------|
| `arxiv_search` | 搜 arXiv 论文 | `搜索 transformer 相关论文` |
| `openalex_search` | 搜跨学科论文 | `搜索 neural architecture search` |
| `paper_download` | 下载论文 | `下载 arxiv:2310.06825` |
| `detect_hardware` | 检测硬件 | `检测我的硬件配置` |

---

## 📋 常用命令

### 搜索论文
```
@Builder with MCP 搜索 10 篇关于 long context LLM 的 arXiv 论文
```

### 下载论文
```
@Builder with MCP 下载 arxiv:2401.12345
```

### 硬件检测
```
@Builder with MCP 详细检测我的硬件配置
```

### 触发技能
```
/research-collect transformer efficiency
```

---

## ❓ 故障排查

### MCP Server 未运行
```bash
# 检查命令是否可用
where scientify-mcp

# 重新安装
npm install -g .
```

### 模块找不到错误 (ERR_MODULE_NOT_FOUND)
**症状**：运行时报错 `Cannot find module 'xxx'`

**原因**：Node.js ESM 要求导入路径必须包含 `.js` 扩展名

**解决**：
```bash
# 重新编译（已修复此问题）
npm run build
npm install -g .
```

详细修复说明见 [ESM_PATH_FIX.md](ESM_PATH_FIX.md)

### 工具调用失败
1. 检查 TRAE 的 MCP 列表中有 `scientify-tools`
2. 确认状态为 ✅
3. 重启 TRAE

### 下载失败
- 检查网络连接
- arXiv 限速：每篇间隔 3 秒
- 检查磁盘空间

---

## 📂 关键文件

| 文件 | 作用 |
|------|------|
| `src/mcp-server.ts` | MCP Server 入口 |
| `mcp.example.json` | 配置示例 |
| `TEST_MCP.md` | 完整测试指南 |
| `MCP_SERVER_SUMMARY.md` | 改造总结 |

---

## 🔗 重要链接

- [完整安装指南](README.md#安装方法)
- [测试指南](TEST_MCP.md)
- [改造总结](MCP_SERVER_SUMMARY.md)
- [TRAE MCP 文档](https://docs.trae.ai/ide/add-mcp-servers)

---

**版本**: v3.2.0 | **更新日期**: 2026-04-26

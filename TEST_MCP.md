# MCP Server 测试指南

## 快速测试

### 1. 验证命令行可执行文件

```bash
# 测试 scientify-mcp 命令是否可用
where scientify-mcp
```

应该在输出中看到类似：
```
C:\Users\你的用户名\AppData\Roaming\npm\scientify-mcp
C:\Users\你的用户名\AppData\Roaming\npm\scientify-mcp.cmd
```

### 2. 在 TRAE 中测试 MCP Server

#### 测试 1：硬件检测
在 TRAE 聊天框输入：
```
@Builder with MCP 检测我的硬件配置
```

**预期输出**：
```json
{
  "hardware": {
    "cpu": {
      "model": "...",
      "cores": 16,
      "threads": 24
    },
    "gpu": {
      "hasNvidia": true,
      "count": 1,
      "models": ["NVIDIA GeForce RTX 4060 Laptop GPU"]
    },
    "memory": {
      "totalGB": 16,
      "availableGB": ...
    }
  },
  "recommended_config": {
    "batchSize": 512,
    "epochs": {...},
    ...
  }
}
```

#### 测试 2：arXiv 搜索
在 TRAE 聊天框输入：
```
@Builder with MCP 搜索 3 篇关于 transformer efficiency 的 arXiv 论文
```

**预期输出**：
应该返回包含论文列表的 JSON，每篇论文包含：
- arxivId
- title
- authors
- abstract
- year
- pdfUrl

#### 测试 3：论文下载
在 TRAE 聊天框输入：
```
@Builder with MCP 下载 arxiv:2310.06825
```

**预期输出**：
```
Successfully downloaded to: papers/2310.06825/2310.06825.tar.gz
```
或
```
Successfully downloaded to: papers/2310.06825.pdf
```

### 3. 检查 MCP Server 状态

在 TRAE 中：
1. 打开 **设置 → MCP**
2. 检查 `scientify-tools` 是否在列表中
3. 状态应该是 **✅ 运行中**

## 常见问题排查

### 问题 1：MCP Server 未运行

**症状**：在 TRAE 的 MCP 列表中看不到 `scientify-tools` 或状态为 ❌

**解决方案**：
1. 检查配置是否正确：
   ```json
   {
     "mcpServers": {
       "scientify-tools": {
         "command": "scientify-mcp",
         "args": [],
         "env": {}
       }
     }
   }
   ```

2. 重启 TRAE IDE

3. 手动测试命令：
   ```bash
   # 应该看到 "Scientify MCP Server running on stdio"
   scientify-mcp
   ```

### 问题 2：工具调用失败

**症状**：AI 返回错误信息或无法调用工具

**解决方案**：
1. 确认 MCP Server 已正确添加到 TRAE
2. 检查 `@Builder with MCP` 是否选择了 MCP 工具
3. 查看 TRAE 的 MCP 日志（设置 → MCP → 查看日志）

### 问题 3：命令找不到

**症状**：`where scientify-mcp` 返回空

**解决方案**：
```bash
# 重新全局安装
npm install -g .

# 检查 npm 全局目录
npm root -g
npm bin -g
```

确保 npm 全局目录在 PATH 环境变量中。

## 高级测试

### 测试 verbose 模式的硬件报告

```
@Builder with MCP 详细检测我的硬件配置并生成报告
```

### 测试 OpenAlex 搜索

```
@Builder with MCP 搜索 5 篇关于 neural architecture search 的论文
```

### 测试批量下载

创建测试脚本 `test-batch.js`：
```javascript
// 这个脚本需要通过 AI 工具调用执行
const papers = ['2310.06825', '2401.00001', '2403.00002'];
for (const id of papers) {
  await paper_download({ arxiv_id: id, target_dir: 'test_papers' });
}
```

## 性能基准

正常情况下的响应时间：
- 硬件检测：< 1 秒
- arXiv 搜索（30 篇）：2-5 秒
- OpenAlex 搜索（20 篇）：3-6 秒
- 论文下载（单篇）：5-15 秒（取决于网络）

如果响应时间显著超过这些值，检查：
1. 网络连接
2. API 限流（arXiv 限速）
3. 系统资源

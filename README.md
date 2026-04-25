
# Scientify for TRAE v3.2.0

本项目基于 https://github.com/tsingyuai/scientify

✨ **TRAE IDE 专属优化版** | 基于官方 Scientific v3.2.0，新增独家**硬件自动适配功能**，根据电脑配置智能选择最优实验策略！

Scientify 是一个端到端的 AI 科研工作流自动化工具，帮你完成从文献调研到论文写作的全流程。

## 功能特性

- 🔍 **文献调研**：自动搜索、筛选、下载 arXiv/OpenAlex 论文
- 💡 **Idea 生成**：基于文献分析生成创新研究方案
- 💻 **代码实现**：自动实现研究算法，包含完整训练流程
- 🔬 **实验验证**：自动化实验、消融实验、性能分析
- 🤖 **智能硬件适配**：自动检测电脑配置，生成最优实验策略（支持 CPU/GPU/内存/存储检测）
- 📝 **综述写作**：辅助撰写结构化综述论文
- 🚀 **多 Agent 协作**：分层编排的自主研究流程

## 快速开始

### 前置要求

- TRAE IDE
- Python 3 + uv（用于代码实现和实验运行）
- Git
- Node.js >= 18

### 安装方法

完整安装分为**三步**：MCP Server 安装、底层工具库安装、全局技能安装。

#### 第一步：安装并配置 MCP Server（必须）

MCP Server 是 AI 调用工具的关键桥梁，必须通过 TRAE 的 MCP 系统配置。

**1. 安装并编译：**
```bash
# 克隆或下载本项目到本地
cd Scientify_for_TRAE

# 安装依赖
npm install

# 编译项目
npm run build

# 全局安装 MCP Server
npm install -g .
```

**2. 在 TRAE 中配置 MCP Server：**

- 打开 TRAE IDE，进入 **设置 → MCP**
- 点击 **添加 → 手动添加**
- 填入以下配置：

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

- 点击 **确认** 保存

**验证 MCP Server：**
- 在 TRAE 聊天框输入：`@Builder with MCP 检测我的硬件配置`
- 如果返回 CPU/GPU/内存信息，说明 MCP Server 配置成功

#### 第二步：安装全局技能（二选一即可）

技能是 AI 的工作流指令，告诉 AI 何时调用 MCP 工具。

##### 方法一：界面操作（推荐）
1. 在 TRAE 中打开本项目
2. 打开设置 → 规则和技能 → 选择"项目"标签
3. 找到所有 scientify 相关技能，逐个点击右侧 ⚙️ → "应用到全局"
4. 重启 TRAE IDE 即可在全局技能面板看到所有技能

##### 方法二：手动复制
```powershell
# Windows 系统
# 将.trae/skills/文件夹下的所有内容复制到 TRAE 全局技能目录
Copy-Item -Path ".trae\skills\*" -Destination "$env:USERPROFILE\.trae-cn\skills\" -Recurse
```

```bash
# macOS/Linux 系统
cp -r ./skills/* ~/.trae-cn/skills/
```

#### 第三步：验证安装
1. **重启 TRAE IDE**
2. **检查 MCP Server**：设置 → MCP → 确认 `scientify-tools` 在列表中且状态为 ✅
3. **测试工具调用**：
   - 输入：`@Builder with MCP 搜索 3 篇关于 transformer 效率优化的 arXiv 论文`
   - 如果返回论文列表，说明工具调用成功
4. **测试技能触发**：
   - 输入：`/research-collect long context LLM`
   - 如果开始搜索并下载论文，说明技能正常工作

### 使用方式

#### 两种核心使用模式

**1. 定向科研项目（完成特定研究任务）**
```
# 在空的研究项目目录中运行
/research-pipeline 你的研究主题
```

**2. 长期领域跟进（自动知识代谢）**
```
# 初始化配置
/metabolism-init 关键词："LLM efficiency, long context" 分类：cs.CL, cs.LG

# 启动每日自动更新
/metabolism-start
```

更多详细使用方法参见 [USAGE.md](./USAGE.md) 和 [METABOLISM_USAGE.md](./METABOLISM_USAGE.md)

## 项目结构

```
Scientify_for_TRAE/
├── skills/              # 11 个科研技能定义（可直接修改定制）
│   ├── idea-generation/
│   ├── metabolism/
│   ├── research-pipeline/
│   └── ...
├── src/                 # 底层能力封装
│   ├── mcp-server.ts    # MCP Server 入口（新增）
│   ├── tools/           # 论文搜索、下载等工具
│   ├── pipeline/        # 工作流编排与断点续跑
│   └── metabolism/      # 知识代谢心跳功能
├── mcp.example.json     # MCP 配置示例（新增）
├── USAGE.md             # 详细使用指南
├── METABOLISM_USAGE.md  # 知识代谢功能专项说明
└── README.md
```

## 技能列表

| 技能 | 功能 |
|------|------|
| `research-pipeline` | 端到端科研工作流编排器 |
| `research-collect` | 文献收集与下载 |
| `research-survey` | 论文深度分析与调研 |
| `idea-generation` | 研究创新点生成 |
| `research-plan` | 实现方案规划 |
| `research-implement` | 代码实现 |
| `research-review` | 代码审查与迭代 |
| `research-experiment` | 实验验证与分析（**支持硬件自动适配**） |
| `write-review-paper` | 综述论文写作 |
| `metabolism` | 知识代谢与持续跟进 |
| `paper-download` | 论文下载工具 |

## 核心工具（通过 MCP 调用）

| 工具 | 功能 | 示例 |
|------|------|------|
| `arxiv_search` | 搜索 arXiv 论文 | `@Builder 搜索 transformer 相关的论文` |
| `openalex_search` | 搜索跨学科学术论文 | `@Builder 搜索 neural architecture search` |
| `paper_download` | 下载论文 PDF/源码 | `@Builder 下载 arxiv:2310.06825` |
| `detect_hardware` | 检测硬件并推荐配置 | `@Builder 检测我的硬件配置` |

## 许可证

本项目采用 **CC BY-NC 4.0 非商用许可证**，你可以：
- ✅ 自由下载、使用、修改、分发本项目
- ✅ 用于个人研究、学术学习、非商业场景
- ❌ 禁止任何商业用途（包括售卖、付费服务等）
- ⚠️ 需要保留原版权声明，注明来源

完整许可证文本参见 [LICENSE](LICENSE) 文件。

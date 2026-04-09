
# Scientify for TRAE v3.2.0

本项目基于https://github.com/tsingyuai/scientify

✨ **TRAE IDE 专属优化版** | 基于官方Scientify v3.2.0，新增独家**硬件自动适配功能**，根据电脑配置智能选择最优实验策略！

Scientify 是一个端到端的 AI 科研工作流自动化工具，帮你完成从文献调研到论文写作的全流程。

## 功能特性

- 🔍 **文献调研**：自动搜索、筛选、下载 arXiv/OpenAlex 论文
- 💡 **Idea 生成**：基于文献分析生成创新研究方案
- 💻 **代码实现**：自动实现研究算法，包含完整训练流程
- 🔬 **实验验证**：自动化实验、消融实验、性能分析
- 🤖 **智能硬件适配**：自动检测电脑配置，生成最优实验策略（支持CPU/GPU/内存/存储检测）
- 📝 **综述写作**：辅助撰写结构化综述论文
- 🚀 **多 Agent 协作**：分层编排的自主研究流程

## 快速开始

### 前置要求

- TRAE IDE
- Python 3 + uv（用于代码实现和实验运行）
- Git
- Node.js >= 18

### 安装方法

完整安装分为**底层工具库安装**和**全局技能安装**两步：

#### 第一步：安装底层工具库（必须）
```bash
# 克隆或下载本项目到本地
cd Scientify_for_TRAE

# 安装依赖
npm install

# 编译项目
npm run build

# 全局安装底层工具库（技能运行时会自动调用）
npm install -g .
```

#### 第二步：安装全局技能（二选一即可）
##### 方法一：界面操作（推荐）
1. 在TRAE中打开本项目
2. 打开设置 → 规则和技能 → 选择"项目"标签
3. 找到所有scientify相关技能，逐个点击右侧 ⚙️ → "应用到全局"
4. 重启TRAE IDE即可在全局技能面板看到所有技能

##### 方法二：手动复制
```powershell
# Windows系统
# 将.trae/skills/文件夹下的所有内容复制到TRAE全局技能目录
Copy-Item -Path ".trae\skills\*" -Destination "$env:USERPROFILE\.trae-cn\skills\" -Recurse
```

```bash
# macOS/Linux系统
cp -r ./skills/* ~/.trae-cn/skills/
```

#### 验证安装
1. 重启TRAE IDE，在全局技能面板能看到11个Scientify相关技能
2. 在任意项目中运行 `/paper-download arxiv:2310.06825` 测试是否能正常下载论文

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
/metabolism-init 关键词: "LLM efficiency, long context" 分类: cs.CL, cs.LG

# 启动每日自动更新
/metabolism-start
```

更多详细使用方法参见 [USAGE.md](./USAGE.md) 和 [METABOLISM_USAGE.md](./METABOLISM_USAGE.md)

## 项目结构

```
Scientify_for_TRAE/
├── skills/              # 11个科研技能定义（可直接修改定制）
│   ├── idea-generation/
│   ├── metabolism/
│   ├── research-pipeline/
│   └── ...
├── src/                 # 底层能力封装（无需手动修改）
│   ├── tools/           # 论文搜索、下载等工具
│   ├── pipeline/        # 工作流编排与断点续跑
│   └── metabolism/      # 知识代谢心跳功能
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

## 许可证

MIT

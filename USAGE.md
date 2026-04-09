
# 使用说明

## 前置安装说明

使用前需要完成两步安装：

### 1. 安装底层工具库
```bash
cd Scientify_for_TRAE
npm install
npm run build
npm install -g .
```

### 2. 安装全局技能
在TRAE中打开本项目，打开规则与技能面板，将所有Scientify技能"应用到全局"，或者手动复制`.trae/skills/`文件夹下所有内容到`C:/Users/你的用户名/.trae-cn/skills/`目录下。

安装完成后重启TRAE IDE即可在任意项目中使用所有功能。

## 快速开始

### 1. 初始化研究项目

1. 在 TRAE 中打开一个空文件夹作为研究工作目录

2. 初始化工作目录结构会自动创建：
```
your-research/
├── papers/          # 下载的论文
├── knowledge/       # 知识库
├── ideas/           # 生成的研究想法
├── project/         # 代码实现
├── iterations/  # 审查迭代记录
└── .pipeline_state.json # 断点状态文件
```

### 2. 启动完整研究流程

在 TRAE 聊天框输入：
```
/research-pipeline 研究"长上下文LLM推理优化
```

系统会自动开始端到端的研究流程：
1. 📚 文献收集：搜索并下载相关论文
2. 🔍 深度调研：分析论文，提取核心方法
3. 💡 Idea生成：产生创新研究方案
4. 📋 实现规划：制定详细的实现计划
5. 💻 代码实现：自动实现算法
6. 🔬 代码审查：多轮迭代审查修复问题
7. 🧪 实验验证：完整训练和实验分析

### 3. 断点续跑

如果流程中断，再次运行同样的命令，系统会自动识别已完成的阶段，从断点继续执行。

### 4. 单独调用技能

也可以单独调用特定技能：

```
# 只收集论文
/research-collect transformer efficiency

# 基于现有论文生成idea
/idea-generation

# 实现代码并验证
/research-implement
```

## 技能列表

| 命令 | 功能 |
|------|------|
| `/research-pipeline [主题]` | 启动端到端研究流程 |
| `/research-collect [关键词]` | 搜索下载相关论文 |
| `/research-survey` | 深度分析现有论文 |
| `/idea-generation` | 生成创新研究方案 |
| `/research-plan` | 制定实现计划 |
| `/research-implement` | 代码实现与验证 |
| `/research-review` | 代码审查与迭代 |
| `/research-experiment` | 运行完整实验 |
| `/write-review-paper` | 生成综述论文 |
| `/metabolism-start` | 启动知识代谢，每日自动更新 |

## 输出文件说明

| 文件/目录 | 说明 |
|-----------|------|
| `papers/` | 所有下载的论文，按arXiv ID组织 |
| `knowledge/` | 论文笔记、方法对比、核心公式汇总 |
| `ideas/` | 生成的5个研究方案，以及选中方案的详细路线 |
| `project/` | 完整可运行的代码项目 |
| `survey_report.md` | 初步文献调研报告 |
| `survey_res.md` | 深度调研综合报告 |
| `plan_res.md` | 详细实现计划（数据集/模型/训练/测试） |
| `ml_res.md` | 代码实现报告和验证结果 |
| `experiment_res.md` | 完整实验报告和结果分析 |
| `iterations/` | 多轮代码审查记录 |

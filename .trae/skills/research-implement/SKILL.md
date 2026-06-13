---
name: research-implement
description: "[Read when prompt contains /research-implement]"
metadata:
  {
    "openclaw":
      {
        "emoji": "💻",
        "requires": { "bins": ["python3", "uv"] },
      },
  }
---

# Research Implement

**Don't ask permission. Just do it.**


## Prerequisites

| File | Source |
|------|--------|
| `plan_res.md` | /research-plan |
| `survey_res.md` | /research-survey |
| `repos/` (optional) | reference code |

**If `plan_res.md` is missing, STOP:** "需要先运行 /research-plan 完成实现计划"

## Output

| File | Content |
|------|---------|
| `project/` | 完整可运行代码 |
| `ml_res.md` | 实现报告（含真实执行结果） |

---

## Workflow

### Step 1: 读取计划

读取 `plan_res.md`，提取：
- 所有组件列表
- 数据集信息
- 训练参数

### Step 2: 创建项目结构

```
project/
  model/          # 模型组件（每个组件一个文件）
  data/           # 数据加载
  training/       # 训练循环 + loss
  testing/        # 评估
  utils/          # 工具函数
  run.py          # 入口（必须输出 [RESULT] 行）
  requirements.txt
```

### Step 3: 搜索已有模块（必须先做！）

**在写任何新代码前，搜索 `project/` 目录下是否已有可复用的模块：**

```bash
# 搜索已有函数和类
grep -rn "def " project/ | grep -v __pycache__
grep -rn "class " project/ | grep -v __pycache__
ls project/*/
```

**规则：**
- 如果已有模块实现了相同功能 → **直接 import**，禁止重写
- 如果已有模块功能接近但有差异 → **修改已有模块使其通用化**，禁止新建冗余文件
- 只有当功能完全不同时才新建模块

**注意：`project/` 目录可能已经存在部分代码，不要忽略！**

---

### Step 4: 实现代码（增量 + 模块化）

**每个模块独立为一个文件，模块间通过 import 连接。** 按此顺序实现（每步完成后立即验证）：

**4a. requirements.txt** — 列出所有依赖，pin 主版本

**4b. 数据管道 (`data/dataset.py`, `data/loader.py`)**
```bash
cd project && uv venv .venv && source .venv/bin/activate
uv pip install -r requirements.txt
python3 -c "from data.dataset import *; print('data OK')"
```
验证：import 无报错

**4c. 模型架构 (`model/*.py`)** — 每个组件一个文件
```bash
python3 -c "from model import *; import torch; x = torch.randn(2, ...); print(model(x).shape)"
```
验证：输出 shape 正确

**4d. Loss + 训练循环 (`training/trainer.py`, `training/loss.py`)**

**4e. 评估逻辑 (`testing/eval.py`)**

**4f. run.py** — 入口文件，**只负责 import 已实现模块并串联**：
```python
from data.dataset import load_data
from model import build_model
from training.trainer import train
from testing.eval import evaluate

if __name__ == '__main__':
    train_loader, val_loader = load_data(args)
    model = build_model(args)
    trainer = train(model, train_loader, val_loader, args)
    evaluate(model, val_loader)
    
    print(f"[RESULT] train_loss={trainer.best_loss:.6f}")
    print(f"[RESULT] val_metric={trainer.best_metric:.6f}")
    print(f"[RESULT] elapsed={trainer.elapsed:.1f}s")
    print(f"[RESULT] device={args.device}")
```

> **run.py 不写任何算法逻辑**，所有逻辑必须在对应子模块中。

### Step 4: 环境搭建 + 执行

```bash
cd project
uv venv .venv
source .venv/bin/activate

# 自动检测依赖格式
if [ -f "pyproject.toml" ]; then
    uv pip install -e .
elif [ -f "requirements.txt" ]; then
    uv pip install -r requirements.txt
fi

# 2 epoch 验证
python3 run.py --epochs 2
```

### Step 5: 验证执行结果

**执行完成后，必须：**

1. 读取 stdout/stderr 完整输出
2. 确认存在 `[RESULT]` 行
3. 确认 loss 非 NaN/Inf
4. 确认 loss 有下降趋势（即使微小）

**如果执行失败：**
- 读取报错信息
- 修复代码
- 重新执行
- 最多重试 3 次

### Step 6: 写入报告

写入 `ml_res.md`：

```markdown
# Implementation Report

## Data Source
- Dataset: {name} — real / mock (reason)
- If mock: steps to obtain real data: [...]

## Components Implemented
- {module}: {description}

## Quick Validation Results (from execution log)
- Epochs: 2
- [RESULT] train_loss={从执行输出中复制}
- [RESULT] val_metric={从执行输出中复制}
- [RESULT] elapsed={从执行输出中复制}
- [RESULT] device={从执行输出中复制}

> 以上数值直接引用自代码执行输出。
> 如任何数值无法从执行日志中验证，标注为 ⚠️ UNVERIFIED。

## Deviations from Plan
- {changes and why}

## Known Issues
- {issues}
```

---

## Critical Rules

1. **禁止编造结果。** 所有数值必须来自代码执行输出。执行失败就报告失败。
2. **禁止使用全局 pip。** 必须用 uv venv 隔离。
3. **禁止直接 import repos/**，必须改写适配。
4. **mock 数据必须标注** — 代码中 `# MOCK DATA: <reason>`，报告中声明。
5. **run.py 必须输出 `[RESULT]` 行**，报告必须引用这些输出。
6. **先搜索再写代码。** 写新函数/类前先 `grep` 搜索 `project/` 下是否已有实现。已有则 import，禁止重复编写。
7. **run.py 不写算法逻辑。** 入口文件只 import 子模块并串联，算法实现在 `model/`、`training/`、`data/` 等独立模块中。
8. **增量修复，不全量重跑。** 如果 Step 4e 报错，只修改 4e 相关代码再执行该步骤，不要从 4a 重新开始。
9. 3 次重试后仍失败，写入失败报告并停止。

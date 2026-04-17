---
name: tavily-research
description: Tavily深度研究助手 — 自动化搜索、摘要生成、报告导出。将搜索API转化为结构化研究输出。
triggers:
  - "搜索研究"
  - "Tavily搜索"
  - "生成研究笔记"
  - "查资料"
---

# Tavily Research - 深度研究助手 🔍

> 把搜索API变成结构化研究报告

## Skill职责

将零散的网络搜索需求，转化为结构化的研究笔记。自动调用Tavily API，生成包含摘要、来源、引用链接的完整报告。

## 触发场景

- "帮我研究一下[主题]"
- "搜索[话题]并生成报告"
- "用Tavily查资料"
- "整理搜索结果"

## 执行步骤

### Step 1: 需求分析
确定：
- 研究主题（核心关键词）
- 深度要求（basic/advanced）
- 输出数量（3-10条结果）
- 是否需要AI摘要

### Step 2: 执行搜索
```bash
node scripts/tavily-search.mjs --query "主题" --depth advanced --results 5 --output notes/
```

### Step 3: 生成报告
自动按content-creator标准格式输出：
- 文件命名：`YYYYMMDD_topic-keyword.md`
- 文件头：标题、日期、来源、标签
- 内容结构：核心概念、关键发现、详细分析、参考链接

### Step 4: 质量检查
- [ ] 搜索结果相关性 > 0.5
- [ ] 至少3个有效来源
- [ ] AI摘要不为空
- [ ] 文件符合命名规范

## 输出标准

### 文件命名
`YYYYMMDD_topic-keyword.md`

### 文件头
```markdown
# [研究主题]

> [一句话描述]
> 日期: YYYY-MM-DD HH:MM
> 来源: Tavily搜索
> 标签: [标签1, 标签2]

---
```

### 内容结构
```markdown
## 核心概念
## 关键发现（表格）
## 详细分析
## 我的看法
## 参考链接
```

## 使用方法

### 方式1：交互式研究
```
用户: 帮我研究一下Darkbloom
AI: 正在搜索... → 生成报告 → 保存到 notes/20260417_darkbloom-research.md
```

### 方式2：命令行
```bash
node scripts/tavily-search.mjs --query "AI agent consciousness" --depth advanced
```

### 方式3：批量研究
```bash
node scripts/tavily-batch.mjs --input topics.txt --output notes/
```

## 依赖

- Tavily API Key（存储在~/.openclaw/.env）
- Node.js 18+
- 无外部npm依赖

## 集成

添加到AGENTS.md：
```markdown
## 研究任务

涉及网络搜索时，激活tavily-research skill。

1. 确认研究主题和深度
2. 执行搜索脚本
3. 按content-creator标准生成报告
4. 保存到notes/目录
```

## License

MIT

---

*Created by 小白* 🤍

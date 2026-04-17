#!/usr/bin/env node
/**
 * Tavily搜索脚本 — 深度研究助手
 * 用法: node tavily-search.mjs --query "主题" [--depth basic|advanced] [--results 5] [--output dir]
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

const TAVILY_API_KEY = process.env.TAVILY_API_KEY || '';

function showHelp() {
  console.log('Tavily Research - 深度研究助手\n');
  console.log('用法:');
  console.log('  node tavily-search.mjs --query "AI agent consciousness"');
  console.log('  node tavily-search.mjs --query "Darkbloom" --depth advanced --results 8');
  console.log('  node tavily-search.mjs --query "RLHF" --output notes/\n');
  console.log('选项:');
  console.log('  --query     搜索关键词');
  console.log('  --depth     搜索深度: basic (默认) | advanced');
  console.log('  --results   结果数量 (默认5, 最多10)');
  console.log('  --output    输出目录 (默认当前目录)');
}

async function searchTavily(query, depth = 'basic', maxResults = 5) {
  const response = await fetch('https://api.tavily.com/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      api_key: TAVILY_API_KEY,
      query: query,
      search_depth: depth,
      max_results: maxResults,
      include_answer: true
    })
  });
  
  if (!response.ok) {
    throw new Error(`API错误: ${response.status}`);
  }
  
  return await response.json();
}

function generateReport(query, results) {
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];
  const timeStr = now.toTimeString().split(' ')[0].substring(0, 5);
  
  // 清理主题词用于文件名
  const safeTopic = query.toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .substring(0, 30);
  
  let md = `# ${query} 研究报告

> 基于Tavily ${results.search_depth || 'basic'}搜索整理
> 日期: ${dateStr} ${timeStr}
> 来源: Tavily搜索
> 标签: research, ${safeTopic}

---

## AI摘要

${results.answer || '（无AI摘要）'}

---

## 关键发现

| # | 标题 | 相关度 | 来源 |
|---|------|--------|------|
`;

  for (let i = 0; i < results.results.length; i++) {
    const r = results.results[i];
    const shortTitle = r.title.length > 40 ? r.title.substring(0, 40) + '...' : r.title;
    md += `| ${i + 1} | [${shortTitle}](${r.url}) | ${r.score.toFixed(3)} | ${new URL(r.url).hostname} |\n`;
  }

  md += `
---

## 详细内容

`;

  for (let i = 0; i < results.results.length; i++) {
    const r = results.results[i];
    md += `### ${i + 1}. ${r.title}

**URL**: ${r.url}  
**相关度**: ${r.score.toFixed(3)}

${r.content}

---

`;
  }

  md += `*研究报告由Tavily Research Skill生成*\n`;
  
  return { content: md, filename: `${dateStr}_${safeTopic}.md` };
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.length === 0) {
    showHelp();
    return;
  }
  
  if (!TAVILY_API_KEY) {
    console.log('❌ 错误: TAVILY_API_KEY未设置');
    console.log('   请在~/.openclaw/.env中配置');
    process.exit(1);
  }
  
  const queryIdx = args.indexOf('--query');
  const depthIdx = args.indexOf('--depth');
  const resultsIdx = args.indexOf('--results');
  const outputIdx = args.indexOf('--output');
  
  const query = queryIdx >= 0 ? args[queryIdx + 1] : null;
  const depth = depthIdx >= 0 ? args[depthIdx + 1] : 'basic';
  const maxResults = resultsIdx >= 0 ? parseInt(args[resultsIdx + 1]) : 5;
  const outputDir = outputIdx >= 0 ? args[outputIdx + 1] : process.cwd();
  
  if (!query) {
    console.log('❌ 错误: 请提供搜索关键词 (--query)');
    process.exit(1);
  }
  
  console.log(`🔍 Tavily搜索: "${query}"`);
  console.log(`   深度: ${depth}`);
  console.log(`   数量: ${maxResults}\n`);
  
  try {
    const results = await searchTavily(query, depth, maxResults);
    const report = generateReport(query, results);
    
    // 确保输出目录存在
    if (!existsSync(outputDir)) {
      mkdirSync(outputDir, { recursive: true });
    }
    
    const outputPath = join(outputDir, report.filename);
    
    // 检查文件是否存在
    if (existsSync(outputPath)) {
      console.log(`⚠️ 文件已存在: ${outputPath}`);
      console.log('   添加时间戳...');
      const timestamp = Date.now().toString().slice(-4);
      report.filename = report.filename.replace('.md', `-${timestamp}.md`);
    }
    
    const finalPath = join(outputDir, report.filename);
    writeFileSync(finalPath, report.content, 'utf-8');
    
    console.log('✅ 研究报告生成成功');
    console.log(`   文件: ${finalPath}`);
    console.log(`   结果: ${results.results.length}条`);
    console.log(`   字数: ${report.content.length}`);
    
  } catch (error) {
    console.log(`❌ 错误: ${error.message}`);
    process.exit(1);
  }
}

main();

import test from 'node:test';
import assert from 'node:assert/strict';

import { buildSearchIndex, searchItems } from './search.js';

const projects = [
  {
    id: 'memoir',
    categories: ['products', 'experiments'],
    en: {
      title: 'Memoir',
      tagline: 'Local-first AI photo albums',
      description: 'A local-first AI album creator built with Next.js and Go.',
      meta: 'Next.js + Go / Memory craft',
    },
    zh: {
      title: 'Memoir / 集忆',
      tagline: '本地优先 AI 相册创作',
      description: '导入旅行或家庭照片，让 AI 生成故事相册。',
      meta: 'Next.js + Go / 记忆创作',
    },
  },
  {
    id: 'glint',
    categories: ['tools'],
    en: {
      title: 'Glint',
      tagline: 'Obsidian capture organizer',
      description: 'Turns iCloud capture JSON into structured Markdown notes.',
      meta: 'Obsidian plugin / Knowledge capture',
    },
    zh: {
      title: 'Glint',
      tagline: 'Obsidian 捕获整理插件',
      description: '把 iCloud 收件箱内容整理成 Markdown 笔记。',
      meta: 'Obsidian 插件 / 知识捕获',
    },
  },
];

const notes = [
  {
    id: 'memoir-ai-story-album',
    date: '2026',
    en: {
      title: 'Memoir: AI story albums',
      summary: 'Turns thousands of photos into curated narrative albums.',
      content: 'local-first albums with GitHub Pages export',
    },
    zh: {
      title: 'Memoir / 集忆：AI 故事相册',
      summary: '从几千张照片里挑出值得保留的瞬间。',
      content: '本地优先，相册，GitHub Pages 发布',
    },
  },
];

const process = [
  {
    en: ['Stack', 'React, Next.js, Go, FastAPI, Obsidian plugins, prompt engineering.'],
    zh: ['能力栈', 'React、Next.js、Go、FastAPI、Obsidian 插件、Prompt Engineering。'],
  },
];

test('finds projects by Chinese keywords regardless of current language', () => {
  const index = buildSearchIndex({ projects, notes, process });

  const results = searchItems(index, '相册创作', 'en');

  assert.equal(results[0].kind, 'project');
  assert.equal(results[0].id, 'memoir');
  assert.equal(results[0].title, 'Memoir');
});

test('finds notes by English body keywords and returns localized labels', () => {
  const index = buildSearchIndex({ projects, notes, process });

  const results = searchItems(index, 'GitHub Pages', 'zh');

  assert.equal(results[0].kind, 'note');
  assert.equal(results[0].id, 'memoir-ai-story-album');
  assert.match(results[0].title, /集忆/);
});

test('finds technology stack terms in the profile search item', () => {
  const index = buildSearchIndex({ projects, notes, process });

  const results = searchItems(index, 'FastAPI', 'zh');

  assert.equal(results.some((result) => result.kind === 'section' && result.targetId === 'process'), true);
});

test('ranks title matches before body matches', () => {
  const index = buildSearchIndex({ projects, notes, process });

  const results = searchItems(index, 'Glint', 'zh');

  assert.equal(results[0].kind, 'project');
  assert.equal(results[0].id, 'glint');
});

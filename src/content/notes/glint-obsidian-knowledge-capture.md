---
slug: glint-obsidian-knowledge-capture
order: 3
date: 2026
image: /assets/notes/glint-cover.png
title_zh: Glint：Obsidian 采集整理
summary_zh: 一个面向 Obsidian 的采集整理插件，把 iOS 快捷指令、iCloud 收件箱和桌面端整理流程串起来，最终输出干净的 Markdown 笔记。
title_en: Glint: Obsidian capture
summary_en: An Obsidian capture plugin that connects iOS Shortcuts, iCloud inbox files, and desktop processing into clean Markdown notes.
---

<!-- zh -->

> Glint 仓库地址：[https://github.com/kinrochen/obsidian-glint](https://github.com/kinrochen/obsidian-glint)
>
> 入驻了爱发电，喜欢的欢迎给我打赏一杯咖啡：[https://ifdian.net/a/kinrochen](https://ifdian.net/a/kinrochen)

## 你可能也遇到过这些问题

手机上看到好内容，第一反应是点“分享”或复制链接。但它最后去了哪里？

可能在 Safari 阅读列表里，可能在微信收藏里，可能在备忘录里，可能在稍后读工具里，也可能只是躺在剪贴板里，第二天就忘了。

即使你是 Obsidian 用户，移动端采集也并不顺手。很多时候，你需要：

- 手动复制 URL
- 打开 Obsidian
- 新建笔记
- 粘贴链接
- 补标题
- 写摘要
- 加标签
- 放到合适的文件夹

这个流程太重了。结果就是，大多数内容只被“收藏”，没有被真正整理。

更麻烦的是，信息越积越多后，知识库会开始变乱：

- 链接只有标题，没有正文摘要
- 标签越建越多，难以复用
- 分类不统一
- 保存过的内容找不到
- 处理失败也不知道失败在哪里
- 改了提示词或模型后，旧笔记没法方便重新整理

最后，Obsidian 明明是你的知识库，却变成了另一个“稍后再看”的堆积场。

![Glint 预览](/assets/notes/glint-cover.png)

## Glint 想解决什么

Glint 是一个面向 Obsidian 的采集整理插件。

它的目标很简单：让你在手机上轻量采集，在桌面端自动整理，最后把内容稳定地写成 Obsidian 原生 Markdown。

整个流程是这样的：

1. 在 iPhone 或 iPad 上通过快捷指令采集 URL
2. 快捷指令把采集内容写入 iCloud 中的 Glint 收件箱
3. Obsidian 桌面插件自动读取这些 JSON
4. Glint 抓取网页正文，生成标题、摘要、要点、分类和标签
5. 最终输出为 Markdown 笔记，进入你的 Vault

你不需要维护额外数据库，也不需要新的同步服务。Glint 只做一件事：把采集内容整理成干净的 Markdown。

## 两个 iOS 快捷指令入口

Glint 提供两个快捷指令：

- 从共享表单中获取 URL  
  适合在 Safari、微信、邮件、阅读器等 App 里直接分享链接。
- 从剪贴板中获取 URL  
  适合你已经复制了链接，只想快速丢进收件箱。

这两个入口覆盖了移动端最常见的采集场景。

## 自动整理，而不是简单保存

Glint 不只是把链接粘到笔记里。

它会根据内容生成：

- 标题
- 摘要
- 关键要点
- 核心内容整理
- 分类
- 标签
- 来源信息
- YAML frontmatter

生成后的文件是普通 Markdown。你可以继续使用 Obsidian 自带的搜索、标签、图谱、文件管理和链接能力。

## 可选的分析方式

Glint 默认支持本地规则整理，不依赖外部模型。

如果你希望获得更高质量的摘要和结构化内容，也可以配置：

- Ollama
- OpenAI-compatible 接口

URL 正文抓取是独立开关。对于登录页、反爬页或内容过短的页面，Glint 会在状态页提示抓取质量问题，而不是静默生成低质量笔记。

## 为什么是 Markdown

Glint 不试图替代 Obsidian，也不额外建立知识图谱或数据库。

因为真正长期可靠的是 Markdown 文件本身。

你的内容最终会回到 Vault 里，成为可以搜索、链接、备份、同步、迁移的普通笔记。

这也是 Glint 的设计原则：

采集要轻，整理要稳，结果要开放。

## 适合谁

Glint 适合这些用户：

- 经常在手机上看到资料，想沉淀到 Obsidian
- 不想手动复制、粘贴、分类和打标签
- 想把网页链接变成结构化笔记
- 希望采集系统可诊断、可重试、可重新整理
- 偏好 Markdown，不想被额外数据库绑定
- 想把 iOS 快捷指令、iCloud 和 Obsidian 串成一条可靠链路

## 总结

收藏不是知识管理，整理才是。

Glint 让你在移动端快速捕捉信息，在桌面端自动整理成 Obsidian 原生 Markdown。它不改变你的知识库结构，也不引入复杂同步服务，只是把“稍后再看”的碎片，变成真正可用的笔记。

如果你的 Obsidian 里缺少一个稳定的移动端采集入口，Glint 就是为这个场景做的。

<!-- en -->

> This article is currently published in Chinese. Switch back to Chinese to read the full original version.

## Glint: turning fragments into an Obsidian knowledge base

Glint is an Obsidian capture and organization plugin. It connects iOS Shortcuts, an iCloud inbox, desktop processing, webpage extraction, summaries, tags, categories, and YAML frontmatter into clean Markdown notes inside your Vault.

GitHub: [https://github.com/kinrochen/obsidian-glint](https://github.com/kinrochen/obsidian-glint)

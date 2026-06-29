---
slug: memoir-ai-story-album
order: 1
date: 2026
image: /assets/notes/memoir-cover.png
title_zh: Memoir / 集忆：AI 故事相册
summary_zh: 用 Go + Next.js 做了一个本地优先的 AI 相册工具，让 AI 从几千张照片里挑出值得保留的瞬间，生成有封面、有节奏、有配文的故事相册。
title_en: Memoir: AI story albums
summary_en: A local-first AI photo album tool built with Go and Next.js that turns thousands of photos into curated narrative albums.
---

<!-- zh -->

> 拍照越来越容易，翻看却越来越难。我用 Go + Next.js 做了一个本地优先的 AI 相册工具——**集忆 (Memoir)**，让 AI 帮你从几千张照片里挑出最值得保留的那几张，自动生成一本有封面、有节奏、有配文的叙事相册。
>
> 开源地址：[github.com/kinrochen/Memoir](https://github.com/kinrochen/Memoir)

## 一个真实的问题

上周末整理手机相册，我发现一个熟悉又让人头疼的事实：光是去年一次旅行就拍了 1200 多张照片。

相似连拍、模糊抓拍、同角度微调、路过的风景、随手拍的菜单……它们每一张都承载了一段记忆，但要从中挑出"最值得保留"的那几十张，做成一个可以回看的相册，几乎是一项不可能完成的任务。

太累了，所以照片就躺在文件夹里吃灰了。

我问自己：**如果 AI 真的理解图片，它能不能帮我把这些记忆"存下来"，而不只是生成更多内容？**

于是有了**集忆 (Memoir)**。

## 集忆是什么

一句话：**本地优先的 AI 叙事相册创作工具**。

![集忆界面预览](/assets/notes/memoir-cover.png)

你导入照片，AI 分析每一张的质量、保存价值和故事潜力，自动分组相似连拍并推荐最佳代表帧，然后生成一本有封面、有节奏、有配文的完整相册——最后你可以导出为交互式 HTML，或者一键发布到 GitHub Pages。

整个过程，照片和数据都在你本地。

## 它怎么工作

### 第一步：智能导入

支持 JPG、PNG、HEIC、HEIF 格式上传。实时进度跟踪，自动格式转换。你不需要担心 iPhone 的 HEIC 格式——集忆会自动处理。

![智能导入](/assets/notes/memoir-import.png)

### 第二步：AI 分析

点击"开始分析"，AI 会逐张分析你的照片：

- **质量分** (0-10)：清晰度、曝光、构图
- **保存价值** (0-10)：独特性、情感价值、不可复制性
- **故事价值** (0-10)：能否作为叙事的一部分
- **问题识别**：模糊、过曝、重复、构图问题
- **裁剪建议**：改善构图的裁剪方案
- **文案种子**：为每张照片生成描述性文字

AI 还会自动聚合相似连拍，从每组中推荐"最值得保留"的那一张。

![AI 分析](/assets/notes/memoir-analysis.png)

### 第三步：人工审核

这是集忆最重要的设计理念——**人在回路中 (Human in the Loop)**。

AI 给出的只是建议，你可以在审核页面逐张查看，覆盖任何决策：

- 保留
- 排除
- 改进后保留

你也可以按质量分、保存价值、拍摄时间等维度筛选和排序。

![人工审核](/assets/notes/memoir-review.png)

### 第四步：生成叙事相册

点击"生成相册"，AI 会像一位摄影编辑一样工作：

- 设计封面页（标题 + 简介）
- 规划页面节奏（不是所有照片都平铺在一起）
- 为每一页写标题和正文
- 安排图片位置和大小
- 生成结尾备注
- 起草社交媒体文案（小红书、朋友圈等）

![生成叙事相册](/assets/notes/memoir-generate.png)

![相册页面](/assets/notes/memoir-album.png)

### 第五步：编辑和导出

你可以拖拽重新排序页面、编辑文字、调整图片位置、撤销/重做。

满意后，选择导出格式：

- **HTML** — 独立交互式网页相册，支持照片放大、响应式布局
- **长图** — 单张 PNG，方便微信/聊天分享
- **分享链接** — 本地预览 URL
- **GitHub Pages** — 一键发布到互联网

![编辑和导出](/assets/notes/memoir-export.png)

## GitHub Pages 一键发布

这是我最喜欢集忆的一个功能。

在设置里配置好 GitHub Token 和仓库信息后，你可以直接把相册发布到 GitHub Pages：

- 自动生成相册封面和元数据
- 自动维护相册首页（列出所有已发布的相册）
- 实时上传进度
- 每次发布自动更新首页

![GitHub Pages 发布](/assets/notes/memoir-pages.png)

## 技术架构

集忆的技术栈选择遵循"简单、高效、零依赖"原则：

```text
前端：Next.js 16 + React 19 + TypeScript
后端：Go 1.26 + Gin Web Framework
AI：  Eino 框架 + OpenAI 兼容多模态模型
存储：本地 JSON 文件（无需数据库）
部署：单文件 Go 二进制，内嵌前端
```

### 为什么选 Go？

- **单文件部署**：`go build` 生成的二进制文件可以直接运行，用户不需要安装任何环境
- **跨平台编译**：一条命令就能编译出 macOS/Linux/Windows 三个平台的可执行文件
- **并发友好**：Go 的 goroutine 处理多张并发上传和分析非常自然
- **嵌入资源**：`//go:embed` 可以把前端静态资源直接编译进二进制，真正做到"一个文件搞定一切"

### 为什么本地优先？

照片是最私密的数据之一。集忆的设计原则：

- 所有照片、项目状态、导出内容默认留在本地
- AI 分析只在需要时调用外部 API（最小化数据传输）
- 无遥测、无分析、无广告
- 你选择分析哪些照片，选择发布哪些相册

## 快速上手

### 下载运行

前往 [GitHub Releases](https://github.com/kinrochen/Memoir/releases) 下载对应平台的可执行文件：

- `memoir-darwin-arm64` — macOS (Apple Silicon)
- `memoir-linux-amd64` — Linux (x86_64)
- `memoir-windows-amd64.exe` — Windows (x86_64)

```bash
# macOS / Linux
chmod +x memoir-* && ./memoir-*

# Windows
memoir-windows-amd64.exe
```

集忆会启动本地服务并自动打开浏览器。

### 配置 AI

在设置页面填入 OpenAI 兼容的 API 凭证：

```text
API Base URL: https://api.openai.com/v1（或其他兼容服务）
API Key:      sk-xxxx
Model:        gpt-4o-mini（多模态模型）
```

集忆支持任何 OpenAI 兼容的多模态模型——GPT-4o、Claude（通过兼容代理）、本地部署的开源模型都可以。

### 开始使用

1. 点击"新建项目"，填写标题
2. 上传照片
3. 点击"开始分析"
4. 在审核页面检查 AI 决策
5. 点击"生成相册"
6. 编辑、导出、发布

## 一些使用场景

### 旅行相册

一趟旅行几百上千张照片，AI 帮你挑出最精彩的几十张，按时间线和地点组织成一本完整的旅行故事。

### 家庭记录

孩子的成长、家庭聚会、节日庆祝——这些照片太多太散，AI 帮你筛选和叙事化，变成可以回看的故事。

### 毕业季

四年大学生涯几千张照片，AI 帮你选出最有代表性的，生成一本有叙事感的毕业纪念册。

### 社交媒体

AI 可以为小红书、朋友圈等平台生成文案，附推荐配图——不用自己纠结发什么文字、选哪九张图。

## 项目状态

集忆目前处于 pre-1.0 阶段，核心功能已经可用，但仍有很多可以改进的地方：

- [ ] PDF / EPUB 导出格式
- [ ] 更多相册视觉主题
- [ ] 支持更多 AI 提供商（Gemini、本地模型等）
- [ ] Kubernetes 部署方案
- [ ] 批量项目管理

欢迎 Star、Issue、PR。如果你觉得这个工具有用，也欢迎分享给身边那个"照片永远堆在文件夹里"的朋友。

## 最后

拍照是为了留住记忆。但如果照片堆在文件夹里永远不翻看，那记忆其实也没有被留住。

集忆想做的事情很小——帮你从几千张照片里，挑出值得记住的那几张，做成一本可以回看的相册。

技术只是手段，记忆才是目的。

---

**相关链接**

- GitHub：[github.com/kinrochen/Memoir](https://github.com/kinrochen/Memoir)
- 官网：[kinrochen.github.io/Memoir](https://kinrochen.github.io/Memoir/)
- 下载：[GitHub Releases](https://github.com/kinrochen/Memoir/releases)
- 问题反馈：[GitHub Issues](https://github.com/kinrochen/Memoir/issues)

---

*如果这篇文章对你有帮助，欢迎点赞、收藏、转发。开源项目不易，一个 Star 就是最大的支持。*

<!-- en -->

> This article is currently published in Chinese. Switch back to Chinese to read the full original version.

## Memoir: turning photo piles into story albums with AI

Memoir is a local-first AI photo album tool built with Go and Next.js. It helps select meaningful photos from large folders, groups similar shots, and generates a narrative album with a cover, pacing, captions, export options, and GitHub Pages publishing.

Open source: [github.com/kinrochen/Memoir](https://github.com/kinrochen/Memoir)

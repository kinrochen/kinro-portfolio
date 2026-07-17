import { useEffect, useMemo, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BracketsAngle,
  Compass,
  GithubLogo,
  MagnifyingGlass,
  MoonStars,
  PencilLine,
  SunDim,
  X,
} from '@phosphor-icons/react';
import { buildSearchIndex, searchItems } from './search.js';

const appBasePath = (import.meta.env.BASE_URL || '/').replace(/\/$/, '');

function appPath(path) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${appBasePath}${normalizedPath}` || '/';
}

function publicPath(path) {
  if (!path || /^(https?:|mailto:|data:|#)/.test(path)) return path;
  return appPath(path);
}

function getAppPathname() {
  if (typeof window === 'undefined') return '/';
  const { pathname } = window.location;
  if (!appBasePath) return pathname;
  if (pathname === appBasePath) return '/';
  if (pathname.startsWith(`${appBasePath}/`)) return pathname.slice(appBasePath.length) || '/';
  return pathname;
}

function getAppRoutePath() {
  if (typeof window === 'undefined') return '/';
  const hashPath = window.location.hash.startsWith('#/') ? window.location.hash.slice(1) : '';
  return hashPath || getAppPathname();
}

const markdownComponents = {
  img({ node, src = '', alt = '', ...props }) {
    return <img {...props} src={publicPath(src)} alt={alt} />;
  },
};

const assets = {
  hero: publicPath('/assets/hero-paper-map.png'),
  galleyStudio: publicPath('/assets/notes/galley-studio-console-and-theme-selection.png'),
  glint: publicPath('/assets/notes/glint-cover.png'),
  aiInterview: publicPath('/assets/notes/ai-interview-cover.png'),
  memoir: publicPath('/assets/notes/memoir-cover.png'),
  promptManager: publicPath('/assets/notes/prompt-manager-home.png'),
  orbit: publicPath('/assets/orbit-cover.png'),
};

const noteModules = import.meta.glob('./content/notes/*.md', {
  eager: true,
  import: 'default',
  query: '?raw',
});

const copy = {
  en: {
    nav: ['Intro', 'Work', 'Resume', 'Notes', 'Contact'],
    sections: ['Intro', 'Work', 'Resume', 'Notes', 'Contact'],
    eyebrow: 'AI-native builder / Vibe coder',
    title: 'Kinro Chen',
    lead: [
      'I turn half-formed ideas into working things,',
      'blend AI capability with product taste,',
      'then polish them until they feel useful, calm, and worth shipping.',
    ],
    primaryCta: 'Explore work',
    secondaryCta: 'GitHub',
    theme: 'Theme',
    light: 'Light',
    dark: 'Dark',
    search: {
      trigger: 'Search',
      title: 'Command search',
      eyebrow: 'Find anything',
      placeholder: 'Search projects, notes, stack, keywords...',
      hint: 'Projects, notes, stack, and bilingual keywords',
      shortcut: 'Press / or Ctrl K',
      empty: 'No matching result',
      emptyBody: 'Try a project name, AI, Obsidian, FastAPI, Go, prompt, or album.',
      open: 'Open',
      suggestions: 'Suggested',
      results: 'Results',
      project: 'Project',
      note: 'Note',
      section: 'Profile',
    },
    filters: {
      all: 'All',
      products: 'Products',
      tools: 'Tools',
      experiments: 'Experiments',
    },
    workTitle: 'Vibe Coding Projects',
    workKicker: 'Live product shelf',
    openProject: 'Open project',
    moreProjects: 'More projects',
    allProjects: 'All projects',
    backToWork: 'Back to work',
    viewGithub: 'View GitHub',
    viewNote: 'View note',
    processKicker: 'Profile / resume',
    processTitle: 'Resume Snapshot',
    notesTitle: 'Notes',
    notesKicker: 'Thinking log',
    openNote: 'Read note',
    moreNotes: 'View more',
    allNotes: 'All notes',
    backToNotes: 'Back to notes',
    lessNotes: 'Show less',
    contactTitle: 'Let’s build something useful.',
    contactBody: 'Open to collaborations, early-stage product ideas, and AI-native tools worth making real.',
    conversation: 'Start a conversation',
    close: 'Close',
    repo: 'Repository',
    status: 'Available for collaboration',
    location: 'Taipei, Taiwan',
    sponsor: 'Sponsor',
  },
  zh: {
    nav: ['介绍', '作品', '简历', '笔记', '联系'],
    sections: ['介绍', '作品', '简历', '笔记', '联系'],
    eyebrow: 'AI 原生创造者 / Vibe coder',
    title: 'Kinro Chen',
    lead: ['用 vibe coding 把灵感、', 'AI 与产品直觉编译成型，', '让松散想法长成可用、耐看、能落地的数字作品。'],
    primaryCta: '查看作品',
    secondaryCta: 'GitHub',
    theme: '主题',
    light: '浅色',
    dark: '深色',
    search: {
      trigger: '搜索',
      title: '命令搜索',
      eyebrow: '快速找到',
      placeholder: '搜索项目、笔记、技术栈、关键词...',
      hint: '支持项目、笔记、技术栈和中英文关键词',
      shortcut: '按 / 或 Ctrl K',
      empty: '没有匹配结果',
      emptyBody: '可以试试项目名、AI、Obsidian、FastAPI、Go、提示词或相册。',
      open: '打开',
      suggestions: '推荐',
      results: '结果',
      project: '项目',
      note: '笔记',
      section: '简介',
    },
    filters: {
      all: '全部',
      products: '产品',
      tools: '工具',
      experiments: '实验',
    },
    workTitle: 'Vibe Coding 项目',
    workKicker: '真实项目展柜',
    openProject: '查看项目',
    moreProjects: '更多项目',
    allProjects: '全部项目',
    backToWork: '返回作品',
    viewGithub: '查看 GitHub',
    viewNote: '查看笔记',
    processKicker: 'Profile / Resume',
    processTitle: '简历简介',
    notesTitle: '笔记',
    notesKicker: 'Thinking log',
    openNote: '阅读笔记',
    moreNotes: '查看更多',
    allNotes: '全部笔记',
    backToNotes: '返回笔记',
    lessNotes: '收起笔记',
    contactTitle: '一起做点真正有用的东西。',
    contactBody: '开放合作、早期产品想法，以及值得落地的 AI 原生工具。',
    conversation: '开始对话',
    close: '关闭',
    repo: '代码仓库',
    status: '开放合作',
    location: 'Taipei, Taiwan',
    sponsor: '赞助',
  },
};

const projects = [
  {
    id: 'galley-studio',
    image: assets.galleyStudio,
    url: 'https://github.com/kinrochen/Galley-Studio',
    noteId: 'galley-studio-obsidian-ai-publishing-studio',
    categories: ['tools'],
    accent: '#f5a65b',
    en: {
      title: 'Galley Studio',
      tagline: 'AI publishing studio for Obsidian',
      description:
        'An open-source Obsidian plugin that turns Markdown into editable, publication-ready HTML with AI layout, theme selection, visible generation traces, visual editing, source editing, and local file ownership.',
      meta: 'Obsidian plugin / AI publishing',
    },
    zh: {
      title: 'Galley Studio',
      tagline: 'Obsidian AI 排版与发布工作台',
      description: '开源 Obsidian 插件，把 Markdown 交给 AI 排版，并在同一工作台完成主题选择、生成过程查看、HTML 预览、可视化编辑、源码编辑与本地保存。',
      meta: 'Obsidian 插件 / AI 内容发布',
    },
  },
  {
    id: 'glint',
    image: assets.glint,
    url: 'https://github.com/kinrochen/obsidian-glint',
    noteId: 'glint-obsidian-knowledge-capture',
    categories: ['tools'],
    accent: '#75f6d1',
    en: {
      title: 'Glint',
      tagline: 'Obsidian capture organizer',
      description:
        'An Obsidian desktop plugin that turns Shortcuts capture JSON from iCloud into structured Markdown notes with summaries, tags, categories, and source metadata.',
      meta: 'Obsidian plugin / Knowledge capture',
    },
    zh: {
      title: 'Glint',
      tagline: 'Obsidian 捕获整理插件',
      description: '从 Shortcuts 的 iCloud 收件箱读取采集 JSON，自动整理成摘要、标签、分类和干净的 Markdown 笔记。',
      meta: 'Obsidian 插件 / 知识捕获',
    },
  },
  {
    id: 'ai-interview',
    image: assets.aiInterview,
    url: 'https://github.com/kinrochen/ai-interview',
    noteId: 'ai-interview-open-source-workbench',
    categories: ['products'],
    accent: '#a78bfa',
    en: {
      title: 'AI Interview',
      tagline: 'AI recruiting command center',
      description:
        'An open-source recruiting system with resume AI parsing, candidate matching, AI interview assistance, online tests, offer management, dashboards, and workflows.',
      meta: 'React + FastAPI / Recruiting AI',
    },
    zh: {
      title: 'AI Interview',
      tagline: 'AI 招聘管理中台',
      description: '开源智能招聘系统，覆盖简历解析、候选人匹配、AI 面试助手、在线笔试、Offer、数据看板和工作流编排。',
      meta: 'React + FastAPI / 招聘 AI',
    },
  },
  {
    id: 'memoir',
    image: assets.memoir,
    url: 'https://github.com/kinrochen/Memoir',
    noteId: 'memoir-ai-story-album',
    categories: ['products', 'experiments'],
    accent: '#f2c879',
    en: {
      title: 'Memoir',
      tagline: 'Local-first AI photo albums',
      description:
        'A local-first AI album creator that analyzes and groups meaningful photos, then turns them into narrative albums for export or GitHub Pages.',
      meta: 'Next.js + Go / Memory craft',
    },
    zh: {
      title: 'Memoir / 集忆',
      tagline: '本地优先 AI 相册创作',
      description: '导入旅行、家庭或日常照片，让 AI 分析筛选并生成有封面、节奏、配文和结尾的叙事相册。',
      meta: 'Next.js + Go / 记忆创作',
    },
  },
  {
    id: 'prompt-manager',
    image: assets.promptManager,
    url: 'https://github.com/kinrochen/prompt-manager',
    noteId: 'prompt-manager-professional-ai-prompts',
    categories: ['tools'],
    accent: '#64d9ff',
    en: {
      title: 'Prompt Manager',
      tagline: 'Prompt version control platform',
      description:
        'A full-stack prompt management platform with projects, semantic versions, diff comparison, rollback, AI optimization, playground testing, import/export, and SDK integration.',
      meta: 'Go / Prompt engineering / Versioning',
    },
    zh: {
      title: 'Prompt Manager',
      tagline: '提示词版本管理平台',
      description: '用项目、语义化版本、Diff 对比、回滚、AI 优化、Playground 测试、导入导出和 SDK 集成管理提示词资产。',
      meta: 'Go / Prompt Engineering / 版本控制',
    },
  },
];

const process = [
  {
    icon: Compass,
    en: [
      'Profile',
      'AI-native product builder and vibe coder focused on turning early ideas into useful, polished, working digital products.',
    ],
    zh: ['个人定位', 'AI 原生产品构建者与 vibe coder，关注把早期想法做成真实、有用、耐看的数字产品。'],
  },
  {
    icon: BracketsAngle,
    en: [
      'Stack',
      'React, Next.js, Go, FastAPI, Obsidian plugins, prompt engineering, and AI-assisted product prototyping.',
    ],
    zh: ['能力栈', 'React、Next.js、Go、FastAPI、Obsidian 插件、Prompt Engineering，以及 AI 辅助产品原型。'],
  },
  {
    icon: PencilLine,
    en: [
      'Direction',
      'Building around knowledge capture, AI recruiting, prompt versioning, local-first albums, and a personal AI OS.',
    ],
    zh: ['代表方向', '正在围绕知识捕获、AI 招聘、提示词版本管理、本地优先相册和个人 AI OS 做产品实验。'],
  },
];

const navTargets = ['intro', 'work', 'process', 'notes', 'contact'];
const sectionIds = ['intro', 'work', 'process', 'notes', 'contact'];
const siteUrl = 'https://kinrochen.top';
const defaultShareImage = `${siteUrl}/og-image.png`;
const defaultSeo = {
  title: 'Kinro Chen | AI 原生创造者与 Vibe Coder',
  description: 'Kinro Chen 的个人作品集，记录 AI 原生产品、Vibe Coding 项目、Obsidian 插件、AI 内容发布、AI 招聘系统、提示词管理和本地优先 AI 相册实验。',
  path: '/',
  image: defaultShareImage,
  type: 'website',
};

function sitePath(path = '/') {
  const normalizedPath = path === '/' ? '/' : `/${path.replace(/^\/|\/$/g, '')}/`;
  return new URL(normalizedPath, siteUrl).toString();
}

function setMetaContent(selector, content, createAttributes = {}) {
  if (!content) return;
  let element = document.head.querySelector(selector);
  if (!element) {
    element = document.createElement('meta');
    Object.entries(createAttributes).forEach(([key, value]) => element.setAttribute(key, value));
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
}

function setCanonical(href) {
  let element = document.head.querySelector('link[rel="canonical"]');
  if (!element) {
    element = document.createElement('link');
    element.setAttribute('rel', 'canonical');
    document.head.appendChild(element);
  }
  element.setAttribute('href', href);
}

function updateDocumentSeo(pageSeo, lang) {
  const title = pageSeo.title || defaultSeo.title;
  const description = pageSeo.description || defaultSeo.description;
  const canonical = sitePath(pageSeo.path || '/');
  const image = pageSeo.image || defaultShareImage;
  const type = pageSeo.type || 'website';
  const locale = lang === 'zh' ? 'zh_CN' : 'en_US';

  document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
  document.title = title;
  setCanonical(canonical);
  setMetaContent('meta[name="description"]', description, { name: 'description' });
  setMetaContent('meta[name="robots"]', pageSeo.robots || 'index, follow', { name: 'robots' });
  setMetaContent('meta[property="og:type"]', type, { property: 'og:type' });
  setMetaContent('meta[property="og:locale"]', locale, { property: 'og:locale' });
  setMetaContent('meta[property="og:title"]', title, { property: 'og:title' });
  setMetaContent('meta[property="og:description"]', description, { property: 'og:description' });
  setMetaContent('meta[property="og:url"]', canonical, { property: 'og:url' });
  setMetaContent('meta[property="og:image"]', image, { property: 'og:image' });
  setMetaContent('meta[name="twitter:title"]', title, { name: 'twitter:title' });
  setMetaContent('meta[name="twitter:description"]', description, { name: 'twitter:description' });
  setMetaContent('meta[name="twitter:image"]', image, { name: 'twitter:image' });
}

function parseFrontmatter(source) {
  const match = source.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) return { frontmatter: {}, body: source.trim() };

  const frontmatter = {};
  match[1].split('\n').forEach((line) => {
    const field = line.match(/^([A-Za-z0-9_.-]+):\s*(.*)$/);
    if (!field) return;
    const [, key, rawValue] = field;
    frontmatter[key] = rawValue.replace(/^["']|["']$/g, '').trim();
  });

  return { frontmatter, body: match[2].trim() };
}

function splitLocalizedMarkdown(body) {
  const zh = body.match(/<!--\s*zh\s*-->([\s\S]*?)(?=<!--\s*en\s*-->|$)/i);
  const en = body.match(/<!--\s*en\s*-->([\s\S]*?)(?=<!--\s*zh\s*-->|$)/i);

  return {
    zh: (zh?.[1] || body).trim(),
    en: (en?.[1] || body).trim(),
  };
}

const notes = Object.entries(noteModules)
  .filter(([path]) => !path.split('/').pop()?.startsWith('_'))
  .map(([path, source], index) => {
    const { frontmatter, body } = parseFrontmatter(source);
    const content = splitLocalizedMarkdown(body);
    const fallbackId = path.split('/').pop()?.replace(/\.md$/, '') || `note-${index + 1}`;

    return {
      id: frontmatter.slug || fallbackId,
      date: frontmatter.date || '2026',
      order: Number(frontmatter.order || index + 1),
      image: publicPath(frontmatter.image || ''),
      en: {
        title: frontmatter.title_en || frontmatter.title || fallbackId,
        summary: frontmatter.summary_en || '',
        content: content.en,
      },
      zh: {
        title: frontmatter.title_zh || frontmatter.title || fallbackId,
        summary: frontmatter.summary_zh || '',
        content: content.zh,
      },
    };
  })
  .sort((a, b) => a.order - b.order);

function scrollToId(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function ScrambleText({ text }) {
  const [display, setDisplay] = useState(text);

  useEffect(() => {
    const characters = 'K1NR0<>AI/{}[]#*+-=';
    let frame = 0;
    const maxFrames = Math.max(18, text.length + 10);
    const timer = window.setInterval(() => {
      frame += 1;
      const revealed = Math.floor((frame / maxFrames) * text.length);
      setDisplay(
        text
          .split('')
          .map((char, index) => (char === ' ' || index < revealed ? char : characters[Math.floor(Math.random() * characters.length)]))
          .join(''),
      );
      if (frame >= maxFrames) {
        window.clearInterval(timer);
        setDisplay(text);
      }
    }, 34);

    return () => window.clearInterval(timer);
  }, [text]);

  return <span className="scramble-text">{display}</span>;
}

function getRouteNoteId() {
  if (typeof window === 'undefined') return null;
  const match = getAppRoutePath().match(/^\/notes\/([^/]+)\/?$/);
  return match ? decodeURIComponent(match[1]) : null;
}

function getRouteNotesPage() {
  if (typeof window === 'undefined') return false;
  return /^\/notes\/?$/.test(getAppRoutePath());
}

function getRouteProjectPage() {
  if (typeof window === 'undefined') return false;
  return /^\/projects\/?$/.test(getAppRoutePath());
}

function MotionField({ theme }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const context = canvas.getContext('2d');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let raf = 0;
    let width = 0;
    let height = 0;
    let dots = [];

    function resize() {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * ratio;
      canvas.height = height * ratio;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      dots = Array.from({ length: Math.min(90, Math.max(42, Math.floor(width / 16))) }, (_, index) => ({
        x: (index * 149) % width,
        y: (index * 83) % height,
        vx: (Math.random() - 0.5) * 0.22,
        vy: (Math.random() - 0.5) * 0.18,
        r: Math.random() * 1.4 + 0.7,
      }));
    }

    function draw() {
      context.clearRect(0, 0, width, height);
      context.globalCompositeOperation = theme === 'dark' ? 'screen' : 'multiply';
      const base = theme === 'dark' ? '93, 238, 255' : '48, 98, 135';

      dots.forEach((dot, index) => {
        if (!reducedMotion) {
          dot.x += dot.vx;
          dot.y += dot.vy;
          if (dot.x < -30) dot.x = width + 30;
          if (dot.x > width + 30) dot.x = -30;
          if (dot.y < -30) dot.y = height + 30;
          if (dot.y > height + 30) dot.y = -30;
        }

        context.fillStyle = `rgba(${base}, ${theme === 'dark' ? 0.36 : 0.2})`;
        context.beginPath();
        context.arc(dot.x, dot.y, dot.r, 0, Math.PI * 2);
        context.fill();

        for (let j = index + 1; j < dots.length; j += 1) {
          const other = dots[j];
          const distance = Math.hypot(dot.x - other.x, dot.y - other.y);
          if (distance < 132) {
            context.strokeStyle = `rgba(${base}, ${(1 - distance / 132) * (theme === 'dark' ? 0.2 : 0.11)})`;
            context.lineWidth = 0.8;
            context.beginPath();
            context.moveTo(dot.x, dot.y);
            context.lineTo(other.x, other.y);
            context.stroke();
          }
        }
      });

      if (!reducedMotion) raf = window.requestAnimationFrame(draw);
    }

    resize();
    draw();
    window.addEventListener('resize', resize);

    return () => {
      window.removeEventListener('resize', resize);
      window.cancelAnimationFrame(raf);
    };
  }, [theme]);

  return <canvas className="motion-field" ref={canvasRef} aria-hidden="true" />;
}

function handleTilt(event) {
  const element = event.currentTarget;
  const rect = element.getBoundingClientRect();
  const x = (event.clientX - rect.left) / rect.width;
  const y = (event.clientY - rect.top) / rect.height;
  element.style.setProperty('--rx', `${(0.5 - y) * 11}deg`);
  element.style.setProperty('--ry', `${(x - 0.5) * 13}deg`);
  element.style.setProperty('--mx', `${x * 100}%`);
  element.style.setProperty('--my', `${y * 100}%`);
}

function resetTilt(event) {
  const element = event.currentTarget;
  element.style.setProperty('--rx', '0deg');
  element.style.setProperty('--ry', '0deg');
  element.style.setProperty('--mx', '50%');
  element.style.setProperty('--my', '50%');
}

function handleHeroPointer(event) {
  const element = event.currentTarget;
  const rect = element.getBoundingClientRect();
  const x = ((event.clientX - rect.left) / rect.width) * 100;
  const y = ((event.clientY - rect.top) / rect.height) * 100;
  element.style.setProperty('--hero-x', `${x}%`);
  element.style.setProperty('--hero-y', `${y}%`);
}

function resetHeroPointer(event) {
  const element = event.currentTarget;
  element.style.setProperty('--hero-x', '50%');
  element.style.setProperty('--hero-y', '50%');
}

function localizeSearchItem(item, lang) {
  return {
    ...item,
    title: item.title?.[lang] || item.title?.en || item.title?.zh || item.id,
    description: item.description?.[lang] || item.description?.en || item.description?.zh || '',
    eyebrow: item.eyebrow?.[lang] || item.eyebrow?.en || item.eyebrow?.zh || '',
  };
}

function getResultIcon(kind) {
  if (kind === 'note') return PencilLine;
  if (kind === 'section') return Compass;
  return BracketsAngle;
}

export function App() {
  const dockFrameRef = useRef(null);
  const searchInputRef = useRef(null);
  const [lang, setLang] = useState('zh');
  const [theme, setTheme] = useState(() => {
    if (typeof window === 'undefined') return 'dark';
    return localStorage.getItem('kinro-theme') || 'dark';
  });
  const [filter, setFilter] = useState('all');
  const [activeSection, setActiveSection] = useState('intro');
  const [selectedId, setSelectedId] = useState(null);
  const [isSearchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSearchIndex, setActiveSearchIndex] = useState(0);
  const [routeNoteId, setRouteNoteId] = useState(() => getRouteNoteId());
  const [routeNotesPage, setRouteNotesPage] = useState(() => getRouteNotesPage());
  const [routeProjectPage, setRouteProjectPage] = useState(() => getRouteProjectPage());
  const [galleryProjectId, setGalleryProjectId] = useState('memoir');
  const [pendingSectionId, setPendingSectionId] = useState(null);
  const t = copy[lang];
  const searchIndex = useMemo(() => buildSearchIndex({ projects, notes, process }), []);
  const searchResults = useMemo(() => searchItems(searchIndex, searchQuery, lang, 9), [lang, searchIndex, searchQuery]);
  const searchSuggestions = useMemo(
    () => searchIndex.filter((item) => item.kind !== 'section').slice(0, 6).map((item) => localizeSearchItem(item, lang)),
    [lang, searchIndex],
  );
  const commandResults = searchQuery.trim() ? searchResults : searchSuggestions;

  useEffect(() => {
    return () => {
      if (dockFrameRef.current) window.cancelAnimationFrame(dockFrameRef.current);
    };
  }, []);

  const filteredProjects = useMemo(() => {
    const visibleProjects = filter === 'all' ? projects : projects.filter((project) => project.categories.includes(filter));
    return [...visibleProjects].sort((a, b) => {
      if (a.id === 'memoir') return -1;
      if (b.id === 'memoir') return 1;
      return 0;
    });
  }, [filter]);

  const selectedProject = selectedId ? projects.find((project) => project.id === selectedId) : null;
  const homeProjects = useMemo(() => filteredProjects.slice(0, 3), [filteredProjects]);
  const featuredProjectId = homeProjects.some((project) => project.id === 'memoir') ? 'memoir' : homeProjects[0]?.id;
  const galleryProject = projects.find((project) => project.id === galleryProjectId) || projects[0];
  const galleryProjectIndex = projects.findIndex((project) => project.id === galleryProject.id);
  const galleryProjectNote = galleryProject.noteId ? notes.find((note) => note.id === galleryProject.noteId) : null;
  const selectedProjectNote = selectedProject?.noteId ? notes.find((note) => note.id === selectedProject.noteId) : null;
  const pageNote = routeNoteId ? notes.find((note) => note.id === routeNoteId) : null;
  const visibleNotes = notes.slice(0, 3);
  const hasNotes = notes.length > 0;
  const pageSeo = useMemo(() => {
    if (routeNoteId) {
      if (!pageNote) {
        return {
          title: lang === 'zh' ? '没有找到这篇笔记 | Kinro Chen' : 'Note not found | Kinro Chen',
          description: lang === 'zh' ? '这篇笔记可能已经被移动或重命名。' : 'This note may have been moved or renamed.',
          path: `/notes/${routeNoteId}`,
          image: defaultShareImage,
          type: 'website',
          robots: 'noindex, follow',
        };
      }
      return {
        title: `${pageNote[lang].title} | Kinro Chen`,
        description: pageNote[lang].summary || defaultSeo.description,
        path: `/notes/${pageNote.id}`,
        image: pageNote.image ? new URL(pageNote.image, siteUrl).toString() : defaultShareImage,
        type: 'article',
      };
    }

    if (routeNotesPage) {
      return {
        title: lang === 'zh' ? '笔记 | Kinro Chen' : 'Notes | Kinro Chen',
        description:
          lang === 'zh'
            ? 'Kinro Chen 的 AI 产品、Vibe Coding、知识管理和开发实践笔记。'
            : 'Notes on AI products, vibe coding, knowledge capture, and product engineering by Kinro Chen.',
        path: '/notes',
        image: defaultShareImage,
        type: 'website',
      };
    }

    if (routeProjectPage) {
      return {
        title:
          lang === 'zh'
            ? `${galleryProject[lang].title} | Vibe Coding 项目`
            : `${galleryProject[lang].title} | Vibe Coding Projects`,
        description: galleryProject[lang].description,
        path: '/projects',
        image: defaultShareImage,
        type: 'website',
      };
    }

    return {
      ...defaultSeo,
      title: lang === 'zh' ? defaultSeo.title : 'Kinro Chen | AI-native Builder & Vibe Coder',
      description:
        lang === 'zh'
          ? defaultSeo.description
          : 'Kinro Chen’s personal portfolio for AI-native products, vibe coding projects, Obsidian plugins, AI publishing, AI recruiting systems, prompt management, and local-first AI albums.',
    };
  }, [galleryProject, lang, pageNote, routeNoteId, routeNotesPage, routeProjectPage]);

  function goToSection(id) {
    setActiveSection(id);
    if (routeNoteId || routeNotesPage || routeProjectPage) {
      window.history.pushState({}, '', appPath(`/#${id}`));
      setPendingSectionId(id);
      setRouteNoteId(null);
      setRouteNotesPage(false);
      setRouteProjectPage(false);
      return;
    }
    window.history.replaceState({}, '', appPath(`/#${id}`));
    scrollToId(id);
  }

  function openNotePage(noteId) {
    window.history.pushState({}, '', appPath(`/notes/${encodeURIComponent(noteId)}`));
    setRouteNoteId(noteId);
    setRouteNotesPage(false);
    setRouteProjectPage(false);
    setSelectedId(null);
    setActiveSection('notes');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function openNotesGallery() {
    window.history.pushState({}, '', appPath('/notes'));
    setRouteNoteId(null);
    setRouteNotesPage(true);
    setRouteProjectPage(false);
    setSelectedId(null);
    setActiveSection('notes');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function openProjectGallery(projectId = featuredProjectId || projects[0].id) {
    window.history.pushState({}, '', appPath('/projects'));
    setGalleryProjectId(projectId);
    setSelectedId(null);
    setRouteNoteId(null);
    setRouteNotesPage(false);
    setRouteProjectPage(true);
    setActiveSection('work');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleProjectAlbumMove(event) {
    if (event.pointerType === 'touch') return;

    const album = event.currentTarget;
    const pointerX = event.clientX;

    if (dockFrameRef.current) window.cancelAnimationFrame(dockFrameRef.current);
    dockFrameRef.current = window.requestAnimationFrame(() => {
      album.querySelectorAll('.project-album-card').forEach((card) => {
        const rect = card.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const distance = Math.abs(pointerX - centerX);
        const influence = Math.exp(-((distance / 310) ** 2));
        const eased = influence < 0.035 ? 0 : influence;

        card.style.setProperty('--dock-scale', (1 + eased * 0.19).toFixed(3));
        card.style.setProperty('--dock-lift', `${(eased * 15).toFixed(1)}px`);
        card.style.setProperty('--dock-z', String(Math.round(eased * 12) + 1));
      });
      dockFrameRef.current = null;
    });
  }

  function handleProjectAlbumLeave(event) {
    if (dockFrameRef.current) {
      window.cancelAnimationFrame(dockFrameRef.current);
      dockFrameRef.current = null;
    }
    event.currentTarget.querySelectorAll('.project-album-card').forEach((card) => {
      card.style.removeProperty('--dock-scale');
      card.style.removeProperty('--dock-lift');
      card.style.removeProperty('--dock-z');
    });
  }

  function backToNotes() {
    window.history.pushState({}, '', appPath('/#notes'));
    setActiveSection('notes');
    setPendingSectionId('notes');
    setRouteNoteId(null);
    setRouteNotesPage(false);
    setRouteProjectPage(false);
  }

  function backToWork() {
    window.history.pushState({}, '', appPath('/#work'));
    setActiveSection('work');
    setPendingSectionId('work');
    setRouteNoteId(null);
    setRouteNotesPage(false);
    setRouteProjectPage(false);
  }

  function closeSearch() {
    setSearchOpen(false);
    setSearchQuery('');
    setActiveSearchIndex(0);
  }

  function getSearchKindLabel(kind) {
    if (kind === 'note') return t.search.note;
    if (kind === 'section') return t.search.section;
    return t.search.project;
  }

  function openSearchResult(result) {
    if (!result) return;
    closeSearch();

    if (result.kind === 'note') {
      openNotePage(result.targetId);
      return;
    }

    if (result.kind === 'section') {
      goToSection(result.targetId);
      return;
    }

    setSelectedId(result.targetId);
    setActiveSection('work');
    if (routeNoteId || routeNotesPage || routeProjectPage) {
      window.history.pushState({}, '', appPath('/#work'));
      setRouteNoteId(null);
      setRouteNotesPage(false);
      setRouteProjectPage(false);
      setPendingSectionId('work');
      return;
    }

    window.history.replaceState({}, '', appPath('/#work'));
    scrollToId('work');
  }

  function handleSearchKeyDown(event) {
    if (event.key === 'Escape') {
      event.preventDefault();
      closeSearch();
      return;
    }

    if (!commandResults.length) return;

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveSearchIndex((index) => (index + 1) % commandResults.length);
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveSearchIndex((index) => (index - 1 + commandResults.length) % commandResults.length);
    }

    if (event.key === 'Enter') {
      event.preventDefault();
      openSearchResult(commandResults[activeSearchIndex]);
    }
  }

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('kinro-theme', theme);
  }, [theme]);

  useEffect(() => {
    updateDocumentSeo(pageSeo, lang);
  }, [lang, pageSeo]);

  useEffect(() => {
    setActiveSearchIndex(0);
  }, [searchQuery, lang]);

  useEffect(() => {
    if (!isSearchOpen) return undefined;
    const frame = window.requestAnimationFrame(() => searchInputRef.current?.focus());
    return () => window.cancelAnimationFrame(frame);
  }, [isSearchOpen]);

  useEffect(() => {
    function handleGlobalSearchShortcut(event) {
      const tagName = event.target?.tagName?.toLowerCase();
      const isTypingTarget = ['input', 'textarea', 'select'].includes(tagName) || event.target?.isContentEditable;
      const key = event.key.toLowerCase();

      if ((event.metaKey || event.ctrlKey) && key === 'k') {
        event.preventDefault();
        setSearchOpen(true);
        return;
      }

      if (event.key === '/' && !isTypingTarget && !event.metaKey && !event.ctrlKey && !event.altKey) {
        event.preventDefault();
        setSearchOpen(true);
      }
    }

    window.addEventListener('keydown', handleGlobalSearchShortcut);
    return () => window.removeEventListener('keydown', handleGlobalSearchShortcut);
  }, []);

  useEffect(() => {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add('is-visible');
        });
      },
      { threshold: 0.16 },
    );

    document.querySelectorAll('.reveal').forEach((element) => revealObserver.observe(element));
    return () => revealObserver.disconnect();
  }, [filter, lang, routeNoteId, routeNotesPage, routeProjectPage, galleryProjectId]);

  useEffect(() => {
    function syncRouteState() {
      const nextNoteId = getRouteNoteId();
      const nextNotesPage = getRouteNotesPage();
      const nextProjectPage = getRouteProjectPage();
      setRouteNoteId(nextNoteId);
      setRouteNotesPage(nextNotesPage);
      setRouteProjectPage(nextProjectPage);
      if (nextProjectPage) {
        setActiveSection('work');
      } else if (nextNoteId || nextNotesPage) {
        setActiveSection('notes');
      } else {
        const hashId = window.location.hash.replace('#', '');
        if (sectionIds.includes(hashId)) {
          setActiveSection(hashId);
          setPendingSectionId(hashId);
        }
      }
    }

    window.addEventListener('popstate', syncRouteState);
    window.addEventListener('hashchange', syncRouteState);
    return () => {
      window.removeEventListener('popstate', syncRouteState);
      window.removeEventListener('hashchange', syncRouteState);
    };
  }, []);

  useEffect(() => {
    if (!(routeNoteId || routeNotesPage || routeProjectPage)) return;
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [routeNoteId, routeNotesPage, routeProjectPage]);

  useEffect(() => {
    if (routeNoteId || routeNotesPage || routeProjectPage) return undefined;

    const sectionObserver = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActiveSection(visible.target.id);
      },
      { rootMargin: '-22% 0px -68% 0px', threshold: [0.05, 0.35, 0.65] },
    );

    sectionIds.forEach((id) => {
      const element = document.getElementById(id);
      if (element) sectionObserver.observe(element);
    });
    return () => sectionObserver.disconnect();
  }, [routeNoteId, routeNotesPage, routeProjectPage]);

  useEffect(() => {
    if (routeNoteId || routeNotesPage || routeProjectPage || !pendingSectionId) return;
    const frame = window.requestAnimationFrame(() => {
      scrollToId(pendingSectionId);
      setPendingSectionId(null);
    });
    return () => window.cancelAnimationFrame(frame);
  }, [routeNoteId, routeNotesPage, routeProjectPage, pendingSectionId]);

  return (
    <main
      className={`lab-shell ${routeNoteId ? 'is-note-page' : ''} ${routeNotesPage ? 'is-notes-page' : ''} ${routeProjectPage ? 'is-project-page' : ''}`}
    >
      <MotionField theme={theme} />

      <header className="lab-header">
        <button className="brand" type="button" onClick={() => goToSection('intro')} aria-label="Kinro Chen">
          <span>KC</span>
          <small>Vibe Lab</small>
        </button>

        <nav className="pill-nav" aria-label="Primary navigation">
          {navTargets.map((id, index) => (
            <button
              type="button"
              key={id}
              className={
                routeProjectPage
                  ? id === 'work'
                    ? 'active'
                    : ''
                  : routeNoteId || routeNotesPage
                    ? id === 'notes'
                      ? 'active'
                      : ''
                    : activeSection === id
                      ? 'active'
                      : ''
              }
              onClick={() => goToSection(id)}
            >
              {t.nav[index]}
            </button>
          ))}
        </nav>

        <div className="controls">
          <button
            className="search-trigger"
            type="button"
            onClick={() => setSearchOpen(true)}
            aria-label={t.search.title}
            aria-keyshortcuts="Control+K Meta+K /"
          >
            <MagnifyingGlass size={17} />
            <span>{t.search.trigger}</span>
            <kbd>/</kbd>
          </button>
          <div className="segmented" aria-label="Language switcher">
            <button type="button" className={lang === 'zh' ? 'active' : ''} onClick={() => setLang('zh')}>
              中文
            </button>
            <button type="button" className={lang === 'en' ? 'active' : ''} onClick={() => setLang('en')}>
              EN
            </button>
          </div>
          <button
            className="theme-toggle"
            type="button"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            aria-label={`${t.theme}: ${theme === 'dark' ? t.dark : t.light}`}
          >
            {theme === 'dark' ? <MoonStars size={18} /> : <SunDim size={18} />}
            <span>{theme === 'dark' ? t.dark : t.light}</span>
          </button>
        </div>
      </header>

      <aside className="section-rail" aria-label="Section navigation">
        {sectionIds.map((id, index) => (
          <button
            type="button"
            key={id}
            className={
              routeProjectPage
                ? id === 'work'
                  ? 'active'
                  : ''
                : routeNoteId || routeNotesPage
                  ? id === 'notes'
                    ? 'active'
                    : ''
                  : activeSection === id
                    ? 'active'
                    : ''
            }
            onClick={() => goToSection(id)}
          >
            <span>{String(index + 1).padStart(2, '0')}</span>
            <small>{t.sections[index]}</small>
          </button>
        ))}
      </aside>

      {routeProjectPage ? (
        <section className="project-page section">
          <div className="project-page-head reveal is-visible">
            <button className="note-page-back" type="button" onClick={backToWork}>
              <ArrowLeft size={18} />
              {t.backToWork}
            </button>
            <p className="eyebrow">{t.allProjects}</p>
          </div>

          <article className="project-showcase reveal is-visible" style={{ '--accent': galleryProject.accent }}>
            <div className="project-showcase-copy">
              <span>{String(galleryProjectIndex + 1).padStart(2, '0')}</span>
              <p className="eyebrow">{galleryProject[lang].meta}</p>
              <h1>{galleryProject[lang].title}</h1>
              <strong>{galleryProject[lang].tagline}</strong>
              <p>{galleryProject[lang].description}</p>
              <div className="project-showcase-actions">
                <a className="primary-action compact" href={galleryProject.url} target="_blank" rel="noreferrer">
                  <GithubLogo size={18} />
                  {t.viewGithub}
                </a>
                {galleryProjectNote && (
                  <button className="ghost-action compact" type="button" onClick={() => openNotePage(galleryProjectNote.id)}>
                    <PencilLine size={18} />
                    {t.viewNote}
                  </button>
                )}
              </div>
            </div>
            <div className="project-showcase-visual">
              <img src={galleryProject.image} alt="" />
              <span className="project-showcase-glow" />
            </div>
          </article>

          <div
            className="project-album"
            aria-label={lang === 'zh' ? '所有项目' : 'All projects'}
            onPointerMove={handleProjectAlbumMove}
            onPointerLeave={handleProjectAlbumLeave}
          >
            {projects.map((project, index) => (
              <button
                className={`project-album-card ${project.id === galleryProject.id ? 'active' : ''}`}
                type="button"
                key={project.id}
                onClick={() => setGalleryProjectId(project.id)}
                aria-pressed={project.id === galleryProject.id}
                style={{ '--accent': project.accent }}
              >
                <img src={project.image} alt="" />
                <span className="album-index">{String(index + 1).padStart(2, '0')}</span>
                <strong>{project[lang].title}</strong>
                <em>{project[lang].tagline}</em>
              </button>
            ))}
          </div>
        </section>
      ) : routeNotesPage ? (
        <section className="notes-page section">
          <div className="note-page-head reveal is-visible">
            <button className="note-page-back" type="button" onClick={backToNotes}>
              <ArrowLeft size={18} />
              {t.backToNotes}
            </button>
            <p className="eyebrow">{t.allNotes}</p>
          </div>

          <div className="section-heading notes-page-title reveal is-visible">
            <p>{t.notesKicker}</p>
            <h1>{t.notesTitle}</h1>
          </div>

          <div className="notes-grid notes-gallery-grid">
            {notes.map((note) => (
              <button
                className={`note note-button glass-panel reveal is-visible ${note.image ? 'now' : ''}`}
                type="button"
                key={note.id}
                onClick={() => openNotePage(note.id)}
              >
                {note.image && <img src={note.image} alt="" />}
                <span className="note-copy">
                  <time>{note.date}</time>
                  <h3>{note[lang].title}</h3>
                  <p>{note[lang].summary}</p>
                  <span className="note-link">
                    {t.openNote}
                    <ArrowRight size={16} />
                  </span>
                </span>
              </button>
            ))}
          </div>
        </section>
      ) : routeNoteId ? (
        <section className="note-page section">
          <article className="note-page-surface glass-panel reveal is-visible">
            <div className="note-page-head">
              <button className="note-page-back" type="button" onClick={backToNotes}>
                <ArrowLeft size={18} />
                {lang === 'zh' ? '返回笔记' : 'Back to notes'}
              </button>
              <p className="eyebrow">{pageNote?.date || 'Note'}</p>
            </div>
            {pageNote ? (
              <>
                <h1>{pageNote[lang].title}</h1>
                <p className="note-page-summary">{pageNote[lang].summary}</p>
                <div className="note-page-divider" />
                <div className="markdown-body note-page-body">
                  <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                    {pageNote[lang].content}
                  </ReactMarkdown>
                </div>
              </>
            ) : (
              <>
                <h1>{lang === 'zh' ? '没有找到这篇笔记' : 'Note not found'}</h1>
                <p className="note-page-summary">
                  {lang === 'zh' ? '这篇笔记可能已经被移动或重命名。' : 'This note may have been moved or renamed.'}
                </p>
              </>
            )}
          </article>
        </section>
      ) : (
        <>
      <section id="intro" className="hero-lab section" onMouseMove={handleHeroPointer} onMouseLeave={resetHeroPointer}>
        <div className="hero-blueprint" aria-hidden="true">
          <span>VIBE</span>
          <span>LAB</span>
        </div>

        <div className="hero-copy hero-identity reveal">
          <p className="eyebrow">{t.eyebrow}</p>
          <h1 className="hero-name">
            {t.title.split(' ').map((word, index) => (
              <span className={`hero-name-line ${index === 1 ? 'is-offset' : ''}`} key={word}>
                <ScrambleText text={word} />
              </span>
            ))}
          </h1>
        </div>

        <div className="hero-command glass-panel reveal">
          <div className="command-line">
            <span>{lang === 'zh' ? 'IDEA COMPILER' : 'IDEA COMPILER'}</span>
            <code>{lang === 'zh' ? 'idea -> prototype -> product' : 'idea -> prototype -> product'}</code>
          </div>
          <p className="hero-lead">
            {(Array.isArray(t.lead) ? t.lead : [t.lead]).map((line, index) => (
              <span className={`hero-lead-row hero-lead-row-${index + 1}`} key={line}>
                {line}
              </span>
            ))}
          </p>
          <div className="hero-actions">
            <button type="button" className="primary-action" onClick={() => goToSection('work')}>
              {t.primaryCta}
              <ArrowRight size={18} />
            </button>
            <a className="ghost-action" href="https://github.com/kinrochen" target="_blank" rel="noreferrer">
              <GithubLogo size={18} />
              {t.secondaryCta}
            </a>
          </div>
        </div>

        <div className="hero-system reveal">
          <div className="lab-view" onMouseMove={handleTilt} onMouseLeave={resetTilt} aria-hidden="true">
            <div className="lab-stage">
              <img src={assets.hero} alt="" />
              <div className="lab-stage-shade" />
            </div>
          </div>
        </div>
      </section>

      <section id="work" className="work-section section">
        <div className="section-heading reveal">
          <p>{t.workKicker}</p>
          <h2>{t.workTitle}</h2>
        </div>

        <div className="work-layout work-layout-featured">
          <div className="project-bento project-bento-featured">
            {homeProjects.map((project, index) => (
              <article
                className={`project-tile reveal ${project.id === featuredProjectId ? 'is-large' : ''}`}
                key={project.id}
                style={{ '--accent': project.accent }}
              >
                <button type="button" onClick={() => setSelectedId(project.id)} onMouseMove={handleTilt} onMouseLeave={resetTilt}>
                  <img src={project.image} alt="" />
                  <span className="tile-glow" />
                  <span className="tile-index">{String(index + 1).padStart(2, '0')}</span>
                  <span className="tile-type">{project[lang].meta}</span>
                  <strong>{project[lang].title}</strong>
                  <em>{project[lang].tagline}</em>
                  <span className="tile-arrow">
                    <ArrowUpRight size={18} />
                  </span>
                </button>
              </article>
            ))}
          </div>
          <div className="work-more reveal">
            <button className="work-more-button glass-panel" type="button" onClick={() => openProjectGallery()} aria-label={t.allProjects}>
              <span>{t.moreProjects}</span>
              <strong>{t.allProjects}</strong>
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </section>

      <section id="process" className="process-lab section">
        <div className="section-heading reveal">
          <p>{t.processKicker}</p>
          <h2>{t.processTitle}</h2>
        </div>
        <div className="process-grid">
          {process.map((item, index) => {
            const Icon = item.icon;
            return (
              <article className="process-card glass-panel reveal" key={item.en[0]}>
                <span>{String(index + 1).padStart(2, '0')}</span>
                <Icon size={30} weight="thin" />
                <h3>{item[lang][0]}</h3>
                <p>{item[lang][1]}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section id="notes" className="notes-lab section">
        <div className="section-heading reveal">
          <p>{t.notesKicker}</p>
          <h2>{t.notesTitle}</h2>
        </div>
        <div className="notes-grid">
          {visibleNotes.map((note) => (
            <button
              className={`note note-button glass-panel reveal ${note.image ? 'now' : ''}`}
              type="button"
              key={note.id}
              onClick={() => openNotePage(note.id)}
            >
              {note.image && <img src={note.image} alt="" />}
              <span className="note-copy">
                <time>{note.date}</time>
                <h3>{note[lang].title}</h3>
                <p>{note[lang].summary}</p>
                <span className="note-link">
                  {t.openNote}
                  <ArrowRight size={16} />
                </span>
              </span>
            </button>
          ))}
        </div>
        {hasNotes && (
          <div className="notes-actions reveal">
            <button className="notes-more glass-panel" type="button" onClick={openNotesGallery}>
              <span>{t.moreNotes}</span>
              <strong>{t.allNotes}</strong>
              <ArrowRight size={16} />
            </button>
          </div>
        )}
      </section>

      <footer id="contact" className="contact-lab section">
        <div className="contact-copy reveal">
          <h2>{t.contactTitle}</h2>
          <p>{t.contactBody}</p>
        </div>
        <div className="contact-panel glass-panel reveal">
          <a href="mailto:kinrochen@agent.qq.com">
            <span>{t.conversation}</span>
            kinrochen@agent.qq.com
          </a>
          <div className="footer-links">
            <a href="https://github.com/kinrochen" target="_blank" rel="noreferrer">
              <GithubLogo size={20} />
              GitHub
            </a>
            <a href="https://ifdian.net/a/kinrochen" target="_blank" rel="noreferrer">
              <ArrowUpRight size={18} />
              {t.sponsor}
            </a>
          </div>
        </div>
      </footer>
        </>
      )}

      {isSearchOpen && (
        <div className="search-dialog" role="presentation">
          <button className="search-backdrop" type="button" onClick={closeSearch} aria-label={t.close} />
          <section
            className="search-modal glass-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="search-title"
            onKeyDown={handleSearchKeyDown}
          >
            <div className="search-modal-head">
              <p className="eyebrow">{t.search.eyebrow}</p>
              <button className="drawer-close" type="button" onClick={closeSearch} aria-label={t.close}>
                <X size={18} />
              </button>
            </div>
            <form
              className="search-form"
              onSubmit={(event) => {
                event.preventDefault();
                openSearchResult(commandResults[activeSearchIndex]);
              }}
            >
              <label className="search-field" htmlFor="global-search">
                <MagnifyingGlass size={22} />
                <span id="search-title">{t.search.title}</span>
                <input
                  id="global-search"
                  ref={searchInputRef}
                  type="search"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder={t.search.placeholder}
                  autoComplete="off"
                  spellCheck="false"
                  aria-controls="search-results"
                />
              </label>
            </form>
            <div className="search-meta">
              <span>{t.search.hint}</span>
              <kbd>{t.search.shortcut}</kbd>
            </div>

            <div className="search-results-head">
              <strong>{searchQuery.trim() ? t.search.results : t.search.suggestions}</strong>
              <span>{commandResults.length}</span>
            </div>

            {commandResults.length ? (
              <div className="search-results" id="search-results" role="listbox">
                {commandResults.map((result, index) => {
                  const Icon = getResultIcon(result.kind);
                  return (
                    <button
                      className={`search-result ${index === activeSearchIndex ? 'active' : ''}`}
                      type="button"
                      key={`${result.kind}-${result.id}`}
                      onClick={() => openSearchResult(result)}
                      onMouseEnter={() => setActiveSearchIndex(index)}
                      role="option"
                      aria-selected={index === activeSearchIndex}
                    >
                      <span className="search-result-icon" style={{ '--accent': result.accent || 'var(--cyan)' }}>
                        <Icon size={20} weight="thin" />
                      </span>
                      <span className="search-result-copy">
                        <span>
                          <em>{getSearchKindLabel(result.kind)}</em>
                          {result.eyebrow && <small>{result.eyebrow}</small>}
                        </span>
                        <strong>{result.title}</strong>
                        {result.description && <p>{result.description}</p>}
                      </span>
                      <span className="search-result-action">
                        {t.search.open}
                        <ArrowRight size={16} />
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="search-empty">
                <MagnifyingGlass size={28} />
                <strong>{t.search.empty}</strong>
                <p>{t.search.emptyBody}</p>
              </div>
            )}
          </section>
        </div>
      )}

      {selectedProject && (
        <div className="drawer" role="dialog" aria-modal="true" aria-label={selectedProject[lang].title}>
          <button
            className="drawer-backdrop"
            type="button"
            onClick={() => setSelectedId(null)}
            aria-label={lang === 'zh' ? '关闭项目详情背景' : 'Close project detail backdrop'}
          />
          <article className="drawer-card glass-panel" style={{ '--accent': selectedProject.accent }}>
            <button className="drawer-close" type="button" onClick={() => setSelectedId(null)} aria-label={t.close}>
              <X size={18} />
            </button>
            <img src={selectedProject.image} alt="" />
            <p className="eyebrow">{selectedProject[lang].meta}</p>
            <h2>{selectedProject[lang].title}</h2>
            <strong>{selectedProject[lang].tagline}</strong>
            <p>{selectedProject[lang].description}</p>
            <div className="drawer-actions">
              <a className="primary-action compact" href={selectedProject.url} target="_blank" rel="noreferrer">
                <GithubLogo size={18} />
                {t.viewGithub}
              </a>
              {selectedProjectNote && (
                <button className="ghost-action compact" type="button" onClick={() => openNotePage(selectedProjectNote.id)}>
                  <PencilLine size={18} />
                  {t.viewNote}
                </button>
              )}
            </div>
          </article>
        </div>
      )}

    </main>
  );
}
